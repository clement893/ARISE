import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Get the current user from the request headers
 * Returns null if not authenticated
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

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
