import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from './api';

interface AdminProfile {
  admin_id: string;
  name: string | null;
  email: string;
  token_version: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    // Password validation if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);

      // Update profile info
      const updatedProfile = await adminApi.updateProfile({
        name: formData.name,
        email: formData.email,
      });

      // Change password if provided
      if (formData.newPassword && formData.currentPassword) {
        await adminApi.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        // Clear password fields after successful change
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success('Profile and password updated successfully');
      } else {
        toast.success('Profile updated successfully');
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load profile data</p>
        <button 
          onClick={loadProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Admin')}&background=0D8ABC&color=fff`}
                alt={profile.name || 'Admin'}
                className="w-32 h-32 rounded-full"
              />
              <h2 className="mt-4 text-xl font-semibold">{profile.name || 'Admin'}</h2>
              <p className="text-gray-500">Administrator</p>
              
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">Last Login</span>
                  <span className="font-medium">
                    {profile.last_login_at 
                      ? new Date(profile.last_login_at).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">Admin ID</span>
                  <span className="font-medium text-xs">
                    {profile.admin_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {isEditing ? 'Edit Profile Information' : 'Profile Information'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Updated
                    </label>
                    <p className="mt-1 text-gray-900">
                      {new Date(profile.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className="border-t pt-4 mt-6">
                      <h4 className="text-lg font-medium mb-4">Change Password (Optional)</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter only if changing password"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={formData.newPassword}
                              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="At least 8 characters"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {saving && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}