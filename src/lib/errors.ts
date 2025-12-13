import { NextResponse } from 'next/server';

/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', resetTime?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { resetTime });
  }
}

/**
 * Handle errors and return appropriate response
 * Prevents information leakage by sanitizing error messages in production
 */
export function handleError(error: unknown): NextResponse {
  // Log error for debugging (in production, send to error tracking service)
  console.error('Error:', error);

  // Handle known error types
  if (error instanceof AppError) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        // Only include details in development
        ...(isDevelopment && error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A record with this value already exists', code: 'UNIQUE_CONSTRAINT' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Invalid reference', code: 'FOREIGN_KEY_CONSTRAINT' },
          { status: 400 }
        );
      default:
        // Don't expose Prisma error details in production
        return NextResponse.json(
          { 
            error: 'Database error occurred',
            code: 'DATABASE_ERROR',
            ...(process.env.NODE_ENV === 'development' ? { details: prismaError.message } : {}),
          },
          { status: 500 }
        );
    }
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && error instanceof Error ? { details: error.message } : {}),
    },
    { status: 500 }
  );
}

/**
 * Wrap async route handlers to catch errors
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
