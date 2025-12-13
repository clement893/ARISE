import { NextRequest } from 'next/server';
import { getCurrentUser, requireAuth, requireAdmin, requireCoach } from './auth';

/**
 * Middleware helper to protect routes with authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<Response>
): Promise<Response> {
  const user = await requireAuth(request);
  
  if (!user) {
    return Response.json(
      { error: 'Authentication required', code: 'AUTHENTICATION_ERROR' },
      { status: 401 }
    );
  }

  return handler(request, user);
}

/**
 * Middleware helper to protect routes with admin role
 */
export async function withAdmin(
  request: NextRequest,
  handler: (request: NextRequest, user: Awaited<ReturnType<typeof requireAdmin>>) => Promise<Response>
): Promise<Response> {
  const user = await requireAdmin(request);
  
  if (!user) {
    return Response.json(
      { error: 'Admin access required', code: 'AUTHORIZATION_ERROR' },
      { status: 403 }
    );
  }

  return handler(request, user);
}

/**
 * Middleware helper to protect routes with coach role
 */
export async function withCoach(
  request: NextRequest,
  handler: (request: NextRequest, user: Awaited<ReturnType<typeof requireCoach>>) => Promise<Response>
): Promise<Response> {
  const user = await requireCoach(request);
  
  if (!user) {
    return Response.json(
      { error: 'Coach access required', code: 'AUTHORIZATION_ERROR' },
      { status: 403 }
    );
  }

  return handler(request, user);
}
