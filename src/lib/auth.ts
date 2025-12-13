import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyAccessToken } from './jwt';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Get the current user from JWT token in Authorization header
 * Returns null if not authenticated or token is invalid
 * Can also use x-user-id header if set by middleware (for performance)
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // First check if middleware already set x-user-id (more efficient)
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) {
      const userId = parseInt(userIdFromHeader);
      if (!isNaN(userId)) {
        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        });

        // Check if user exists and is active
        if (user && user.isActive) {
          return user;
        }
      }
    }

    // Fallback: Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    // Fetch user from database to ensure they still exist and get latest data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return null;
    }

    // Verify role hasn't changed (security check)
    if (user.role !== payload.role) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 * Returns the user if admin, null otherwise
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser | null> {
  const user = await getCurrentUser(request);
  
  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

/**
 * Check if the current user is a coach
 * Returns the user if coach, null otherwise
 */
export async function requireCoach(request: NextRequest): Promise<AuthUser | null> {
  const user = await getCurrentUser(request);
  
  if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
    return null;
  }

  return user;
}

/**
 * Check if the current user is authenticated
 * Returns the user if authenticated, null otherwise
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  return getCurrentUser(request);
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}
