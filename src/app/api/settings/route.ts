import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        settingsEmailNotifications: true,
        settingsWeeklyReport: true,
        settingsDarkMode: true,
        settingsLanguage: true,
        settingsDataSharing: true,
        settingsAnalyticsTracking: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      settings: {
        notifications: {
          emailNotifications: user.settingsEmailNotifications,
          weeklyProgressReport: user.settingsWeeklyReport,
        },
        appearance: {
          darkMode: user.settingsDarkMode,
          language: user.settingsLanguage,
        },
        privacy: {
          dataSharing: user.settingsDataSharing,
          analyticsTracking: user.settingsAnalyticsTracking,
        },
        security: {
          twoFactorAuth: false, // Not implemented yet
        },
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings are required' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        settingsEmailNotifications: settings.notifications?.emailNotifications ?? true,
        settingsWeeklyReport: settings.notifications?.weeklyProgressReport ?? true,
        settingsDarkMode: settings.appearance?.darkMode ?? false,
        settingsLanguage: settings.appearance?.language ?? 'English',
        settingsDataSharing: settings.privacy?.dataSharing ?? true,
        settingsAnalyticsTracking: settings.privacy?.analyticsTracking ?? true,
      },
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
