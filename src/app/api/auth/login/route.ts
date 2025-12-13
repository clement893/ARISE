import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { AuthUser } from '@/lib/auth';
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rateLimit';
import { loginSchema, validateRequest } from '@/lib/validation';
import { AuthenticationError, handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = rateLimitMiddleware(request, RATE_LIMITS.auth);
    if (!rateLimit.allowed) {
      return rateLimit.response!;
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Use same error message to prevent user enumeration
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Use same error message to prevent user enumeration
      throw new AuthenticationError('Invalid email or password');
    }

    // Create AuthUser object for token generation
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Generate tokens
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    // Return user data (excluding password) with tokens
    const { password: _, ...userWithoutPassword } = user;

    // Set HTTP-only cookies for refresh token (more secure than localStorage)
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken, // Client can store this in memory or secure storage
    });

    // Set refresh token in HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
