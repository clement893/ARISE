#!/usr/bin/env python3
"""
Script to restore admin permissions for clement@clementroy.work
Connects directly to PostgreSQL database
"""

import sys
import os

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("ERROR: psycopg2 not installed. Install it with: pip install psycopg2-binary")
    sys.exit(1)

# Database connection string
DATABASE_URL = "postgresql://postgres:cNUvlInibCwWkKnKWLiETJnODwqiuasH@mainline.proxy.rlwy.net:27665/railway"
EMAIL = "clement@clementroy.work"

def main():
    print("Connecting to database...")
    print(f"Checking user: {EMAIL}")
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Check current status
        cur.execute(
            'SELECT id, email, "firstName", "lastName", role, "isActive" FROM "User" WHERE email = %s',
            (EMAIL,)
        )
        user = cur.fetchone()
        
        if not user:
            print(f"ERROR: User {EMAIL} not found!")
            conn.close()
            sys.exit(1)
        
        user_id, email, first_name, last_name, role, is_active = user
        
        print("\nCurrent user status:")
        print(f"  ID: {user_id}")
        print(f"  Email: {email}")
        print(f"  Name: {first_name or ''} {last_name or ''}".strip() or "N/A")
        print(f"  Role: {role}")
        print(f"  Active: {is_active}")
        
        if role == 'admin':
            print("\nUser is already an admin. No changes needed.")
        else:
            print("\nUpdating user role to admin...")
            
            # Update to admin
            cur.execute(
                'UPDATE "User" SET role = %s, "isActive" = %s WHERE email = %s',
                ('admin', True, EMAIL)
            )
            conn.commit()
            
            # Verify update
            cur.execute(
                'SELECT id, email, "firstName", "lastName", role, "isActive" FROM "User" WHERE email = %s',
                (EMAIL,)
            )
            updated_user = cur.fetchone()
            
            print("\nVerification:")
            print(f"  ID: {updated_user[0]}")
            print(f"  Email: {updated_user[1]}")
            print(f"  Name: {updated_user[2] or ''} {updated_user[3] or ''}".strip() or "N/A")
            print(f"  Role: {updated_user[4]}")
            print(f"  Active: {updated_user[5]}")
            
            print("\nSUCCESS! Admin permissions restored.")
            print(f"You can now log in as admin with: {EMAIL}")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"ERROR: Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

