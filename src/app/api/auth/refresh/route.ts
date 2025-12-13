import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { AuthUser } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rateLimit';

/**
 * Refresh access token using refresh token from cookie
 */
export async function POST(request: NextRequest) {
  // Rate limiting - use refresh limit which is more permissive
  const rateLimit = rateLimitMiddleware(request, RATE_LIMITS.refresh);
  if (!rateLimit.allowed) {
    return rateLimit.response!;
  }
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      response.cookies.delete('refreshToken');
      return response;
    }

    // Fetch user to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        roles: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      const response = NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
      response.cookies.delete('refreshToken');
      return response;
    }

    // Parse roles array
    const currentRoles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as string))
      : [user.role];

    // Get primary role (admin takes precedence, then first role)
    const primaryRole = currentRoles.includes('admin') 
      ? 'admin' 
      : (currentRoles[0] || user.role) as 'admin' | 'coach' | 'participant';

    // Generate new access token with current roles
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: primaryRole,
      roles: currentRoles,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const newAccessToken = generateAccessToken(authUser);

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

/**
 * Logout - clear refresh token cookie
 */
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Logged out successfully',
  });

  // Clear refresh token cookie
  response.cookies.delete('refreshToken');

  return response;
}
