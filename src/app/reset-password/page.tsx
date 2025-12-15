/**
 * Reset Password Page
 * 
 * Server component wrapper for the reset password form.
 * This allows us to use export const dynamic = 'force-dynamic' to prevent pre-rendering.
 */

import { Suspense } from 'react';
import { Lock } from 'lucide-react';
import ResetPasswordForm from './reset-password-form';

// Force dynamic rendering to avoid pre-rendering issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-500 relative overflow-hidden flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500/20 rounded-full mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-secondary-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait while we validate your reset link.</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

