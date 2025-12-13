'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  Button, 
  Card,
  Input,
  Modal,
  LoadingInline,
} from '@/components/ui';
import { api } from '@/lib/api-client';

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'coach' as 'coach' | 'participant' | 'admin',
    userType: 'coach' as 'coach' | 'individual' | 'business',
    plan: 'coach' as 'starter' | 'individual' | 'coach' | 'professional' | 'enterprise' | 'revelation' | 'coaching',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/admin/users', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        role: formData.role,
        userType: formData.userType,
        plan: formData.plan,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (role: 'coach' | 'participant' | 'admin') => {
    setFormData({
      ...formData,
      role,
      userType: role === 'coach' ? 'coach' : role === 'admin' ? 'individual' : 'individual',
      plan: role === 'coach' ? 'coach' : role === 'admin' ? 'professional' : 'starter',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New User</h1>
              <p className="text-gray-600 mt-1">Add a new coach, participant, or admin user</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">User created successfully!</p>
              <p className="text-sm text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                User Role *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('coach')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.role === 'coach'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Coach</div>
                  <div className="text-sm text-gray-600 mt-1">For coaches and consultants</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('participant')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.role === 'participant'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Participant</div>
                  <div className="text-sm text-gray-600 mt-1">Regular user</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.role === 'admin'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Admin</div>
                  <div className="text-sm text-gray-600 mt-1">Administrator</div>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
              <Input
                label="Confirm Password *"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>

            {/* User Type (for non-admin roles) */}
            {formData.role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {formData.role === 'coach' ? (
                    <option value="coach">Coach</option>
                  ) : (
                    <>
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="starter">Starter</option>
                <option value="individual">Individual</option>
                {formData.role === 'coach' && <option value="coach">Coach</option>}
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="revelation">Revelation</option>
                <option value="coaching">Coaching</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isSubmitting}
                disabled={success}
              >
                Create User
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

