import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl: string;
  phone: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({
    id: "1",
    name: "John Admin",
    email: "john.admin@tutorly.com",
    role: "Super Admin",
    photoUrl: "https://ui-avatars.com/api/?name=John+Admin&background=0D8ABC&color=fff",
    phone: "+1 (555) 123-4567",
    lastLogin: "2025-09-07T08:30:00Z",
    twoFactorEnabled: true
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to update profile
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleToggle2FA = async () => {
    try {
      // TODO: Implement API call to toggle 2FA
      setProfile({ ...profile, twoFactorEnabled: !profile.twoFactorEnabled });
      toast.success(`Two-factor authentication ${profile.twoFactorEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    }
  };

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
                src={profile.photoUrl}
                alt={profile.name}
                className="w-32 h-32 rounded-full"
              />
              <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.role}</p>
              
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">Sep 2025</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">Last Login</span>
                  <span className="font-medium">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-gray-500">2FA Status</span>
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    profile.twoFactorEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
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
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="mt-1 text-gray-900">{profile.role}</p>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className="border-t pt-4 mt-6">
                      <h4 className="text-lg font-medium mb-4">Change Password</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* Security Settings */}
              <div className="border-t mt-6 pt-6">
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      profile.twoFactorEnabled
                        ? 'text-red-700 bg-red-50 hover:bg-red-100'
                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {profile.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}