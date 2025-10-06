import React, { useState, useEffect } from 'react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, MapPin, Phone, BookOpen, Award, DollarSign, Star, CheckCircle } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  dob: string;
  bio: string;
  subjects: string[];
  qualifications: string[];
  description: string;
  heading: string;
  location: string;
  phone_number: string;
  prices: number;
  rating: number;
  status: string;
}

interface Subject {
  sub_id: string;
  name: string;
}

export default function MassTutorProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Available subjects from database
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bio: '',
    subjects: [] as string[],
    qualifications: [] as string[],
    description: '',
    heading: '',
    location: '',
    phone_number: '',
    prices: 0,
  });

  // Input fields for adding qualifications
  const [newQualification, setNewQualification] = useState('');

  // Fetch profile and subjects on mount
  useEffect(() => {
    fetchProfile();
    fetchSubjects();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await massTutorAPI.getTutorProfile();
      console.log('Profile response:', response);
      setProfile(response.profile);
      
      // Initialize form with profile data
      setFormData({
        name: response.profile.name || '',
        dob: response.profile.dob || '',
        bio: response.profile.bio || '',
        subjects: response.profile.subjects || [],
        qualifications: response.profile.qualifications || [],
        description: response.profile.description || '',
        heading: response.profile.heading || '',
        location: response.profile.location || '',
        phone_number: response.profile.phone_number || '',
        prices: response.profile.prices || 0,
      });
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to load profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await massTutorAPI.getAllSubjects();
      setAvailableSubjects(response.subjects || []);
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load available subjects');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = () => {
    if (selectedSubject && !formData.subjects.includes(selectedSubject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, selectedSubject],
      }));
      setSelectedSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  };

  const handleAddQualification = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q !== qualification),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.prices < 0 || formData.prices > 3) {
      toast.error('Monthly rate must be between $0 and $3 (admin cap)');
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    try {
      setSaving(true);
      const response = await massTutorAPI.updateTutorProfile(formData);
      toast.success('Profile updated successfully!');
      setProfile(response.profile);
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        dob: profile.dob || '',
        bio: profile.bio || '',
        subjects: profile.subjects || [],
        qualifications: profile.qualifications || [],
        description: profile.description || '',
        heading: profile.heading || '',
        location: profile.location || '',
        phone_number: profile.phone_number || '',
        prices: profile.prices || 0,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your professional information and account settings
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{profile.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.rating ? `${profile.rating.toFixed(1)} / 5.0` : 'No ratings yet'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Rate</p>
                <p className="text-lg font-semibold text-gray-900">${profile.prices.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="City, State, Country"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Professional Information
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="e.g., Experienced Math & Physics Tutor"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                placeholder="Describe your teaching experience, methodology, and what makes you unique..."
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects <span className="text-red-500">*</span>
              </label>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a subject...</option>
                    {availableSubjects
                      .filter((subject) => !formData.subjects.includes(subject.name))
                      .map((subject) => (
                        <option key={subject.sub_id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!selectedSubject}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.subjects.length > 0 ? (
                  formData.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-xl font-medium"
                    >
                      {subject}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject)}
                          className="hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No subjects added yet</p>
                )}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="inline w-4 h-4 mr-1" />
                Qualifications
              </label>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQualification())}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a qualification (e.g., B.Sc. in Mathematics)"
                  />
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.qualifications.length > 0 ? (
                  formData.qualifications.map((qualification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-xl font-medium"
                    >
                      {qualification}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(qualification)}
                          className="hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No qualifications added yet</p>
                )}
              </div>
            </div>

            {/* Monthly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="prices"
                  value={formData.prices}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="3"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum rate is capped at $3.00/month by admin</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
