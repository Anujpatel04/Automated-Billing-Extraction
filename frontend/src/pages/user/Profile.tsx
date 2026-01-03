/**
 * User Profile & Settings Page
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { usersApi } from '@/api/users.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/formatters';
import {
  User,
  Mail,
  Lock,
  Shield,
  TrendingUp,
  Receipt,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useToastContext } from '@/components/ui/ToastProvider';

export const Profile = () => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showSuccess, showError } = useToastContext();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => usersApi.getProfile(),
  });

  const profile = data?.data;

  const updateProfileMutation = useMutation({
    mutationFn: (data: { email: string }) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsEditingEmail(false);
      showSuccess('Profile updated successfully!');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password changed successfully!');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handleUpdateEmail = () => {
    if (!email || !email.includes('@')) {
      showError('Please enter a valid email address');
      return;
    }
    updateProfileMutation.mutate({ email });
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }
    changePasswordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword,
    });
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                <User className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        value={isEditingEmail ? email : profile?.email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditingEmail}
                        className="pl-10"
                      />
                    </div>
                    {!isEditingEmail ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmail(profile?.email || '');
                          setIsEditingEmail(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleUpdateEmail}
                          disabled={updateProfileMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingEmail(false);
                            setEmail('');
                          }}
                          disabled={updateProfileMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 capitalize">{profile?.role || 'User'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-900">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <Lock className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Change your password to keep your account secure
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Expenses</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {profile?.statistics?.total_expenses || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {profile?.statistics?.pending_expenses || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {profile?.statistics?.approved_expenses || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={changePasswordMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              isLoading={changePasswordMutation.isPending}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

