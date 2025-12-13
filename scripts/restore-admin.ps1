# PowerShell script to restore admin permissions
# This script connects directly to PostgreSQL and updates the user role

$connectionString = "postgresql://postgres:cNUvlInibCwWkKnKWLiETJnODwqiuasH@mainline.proxy.rlwy.net:27665/railway"
$email = "clement@clementroy.work"

Write-Host "Connecting to database..." -ForegroundColor Cyan
Write-Host "Checking user: $email" -ForegroundColor Cyan

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "Found psql, executing SQL..." -ForegroundColor Green
    
    # Extract connection details from connection string
    $connParts = $connectionString -replace 'postgresql://', '' -split '@'
    $userPass = $connParts[0] -split ':'
    $hostPortDb = $connParts[1] -split '/'
    $hostPort = $hostPortDb[0] -split ':'
    
    $pgUser = $userPass[0]
    $pgPass = $userPass[1]
    $pgHost = $hostPort[0]
    $pgPort = $hostPort[1]
    $pgDb = $hostPortDb[1]
    
    # Set password as environment variable
    $env:PGPASSWORD = $pgPass
    
    # Check current status
    Write-Host ""
    Write-Host "Current user status:" -ForegroundColor Yellow
    psql -h $pgHost -p $pgPort -U $pgUser -d $pgDb -c "SELECT id, email, `"firstName`", `"lastName`", role, `"isActive`" FROM `"User`" WHERE email = '$email';"
    
    # Update to admin
    Write-Host ""
    Write-Host "Updating user role to admin..." -ForegroundColor Yellow
    psql -h $pgHost -p $pgPort -U $pgUser -d $pgDb -c "UPDATE `"User`" SET role = 'admin', `"isActive`" = true WHERE email = '$email';"
    
    # Verify update
    Write-Host ""
    Write-Host "Verification:" -ForegroundColor Green
    psql -h $pgHost -p $pgPort -U $pgUser -d $pgDb -c "SELECT id, email, `"firstName`", `"lastName`", role, `"isActive`" FROM `"User`" WHERE email = '$email';"
    
    Write-Host ""
    Write-Host "Done! Admin permissions restored." -ForegroundColor Green
    
    # Clear password
    Remove-Item Env:\PGPASSWORD
} else {
    Write-Host "psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternatively, you can:" -ForegroundColor Yellow
    Write-Host "1. Use the SQL script (restore-admin.sql) in a database client" -ForegroundColor White
    Write-Host "2. Use the API endpoint: POST /api/admin/restore-admin" -ForegroundColor White
    Write-Host "3. Use Prisma Studio: pnpm db:studio" -ForegroundColor White
    Write-Host ""
    Write-Host "SQL Query to run:" -ForegroundColor Cyan
    Write-Host 'UPDATE "User" SET role = ''admin'', "isActive" = true WHERE email = ''clement@clementroy.work'';' -ForegroundColor White
}
