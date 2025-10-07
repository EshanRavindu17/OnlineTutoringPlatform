import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Users, ArrowLeft, Clock, BookOpen, Calendar, Search, Filter } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface Student {
  name: string;
  email: string;
  photo_url: string | null;
}

interface Enrollment {
  enrol_id: string;
  student_id: string;
  status: 'valid' | 'invalid';
  subscription_id: string | null;
  created_at: string;
  student: Student;
}

interface EnrollmentStats {
  total: number;
  paid: number;
  unpaid: number;
}

interface ClassData {
  class_id: string;
  title: string;
  subject: string;
  day: string;
  time: string;
  description: string | null;
  studentCount: number;
}

export default function StudentsPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Fetch all classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getClasses();
      setClasses(data);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast.error(error.response?.data?.error || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (classId: string) => {
    try {
      setLoadingEnrollments(true);
      const data = await massTutorAPI.getClassEnrollments(classId);
      setEnrollments(data.enrollments);
      setStats(data.stats);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast.error(error.response?.data?.error || 'Failed to load enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleClassClick = (classData: ClassData) => {
    setSelectedClass(classData);
    fetchEnrollments(classData.class_id);
  };

  const handleBack = () => {
    setSelectedClass(null);
    setEnrollments([]);
    setStats(null);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Filter enrollments based on search and status
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = 
      enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'paid' && enrollment.status === 'valid') ||
      (statusFilter === 'unpaid' && enrollment.status === 'invalid');
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  // Show class cards view
  if (!selectedClass) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Students</h2>
          <p className="text-gray-600 mt-2">Monitor enrollment status and manage your class rosters</p>
        </div>

        {/* Summary Stats */}
        {classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Classes</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{classes.length}</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Total Students</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
                  </p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <Users className="w-6 h-6 text-green-900" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Active Classes</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {classes.filter(cls => (cls.studentCount || 0) > 0).length}
                  </p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-900" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="mt-8 text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
            <p className="text-sm text-gray-500">Create a class to start managing student enrollments</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((classData) => {
                const totalStudents = classData.studentCount || 0;

                return (
                  <button
                    key={classData.class_id}
                    onClick={() => handleClassClick(classData)}
                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left relative overflow-hidden"
                  >
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/30 transition-all duration-200"></div>
                    
                    <div className="relative">
                      {/* Class Title & Subject */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                          {classData.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="bg-blue-100 p-1.5 rounded">
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                          </div>
                          <span className="font-medium">{classData.subject}</span>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-5 bg-gray-50 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{classData.day}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatTime(classData.time)}</span>
                      </div>

                      {/* Student Count */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Users className="w-4 h-4 text-green-700" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Enrolled</p>
                            <p className="text-lg font-bold text-gray-900">
                              {totalStudents}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm group-hover:gap-2.5 transition-all">
                          <span>View</span>
                          <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show detailed enrollment table for selected class
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Classes</span>
      </button>

      {/* Class Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedClass.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span className="font-medium text-blue-900">{selectedClass.subject}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-purple-700" />
                <span className="font-medium text-purple-900">
                  {selectedClass.day} at {formatTime(selectedClass.time)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Total Students</p>
                <p className="text-4xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-blue-200 p-4 rounded-xl">
                <Users className="w-8 h-8 text-blue-900" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">Paid This Month</p>
                <p className="text-4xl font-bold text-green-900">{stats.paid}</p>
                <p className="text-xs text-green-700 mt-1">
                  {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}% payment rate
                </p>
              </div>
              <div className="bg-green-200 p-4 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-green-900" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Payment Pending</p>
                <p className="text-4xl font-bold text-red-900">{stats.unpaid}</p>
                {stats.unpaid > 0 && (
                  <p className="text-xs text-red-700 mt-1">Requires attention</p>
                )}
              </div>
              <div className="bg-red-200 p-4 rounded-xl">
                <XCircle className="w-8 h-8 text-red-900" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      {!loadingEnrollments && enrollments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-sm"
              >
                <option value="all">All Students</option>
                <option value="paid">Paid Only</option>
                <option value="unpaid">Unpaid Only</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredEnrollments.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{enrollments.length}</span> students
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enrollments Table */}
      {loadingEnrollments ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading enrollments...</p>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students enrolled yet</h3>
          <p className="text-sm text-gray-500">Students will appear here once they enroll in this class</p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Enrolled On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.enrol_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {enrollment.student.photo_url ? (
                          <img
                            src={enrollment.student.photo_url}
                            alt={enrollment.student.name}
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-200"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-gray-200">
                            <span className="text-white font-bold text-base">
                              {enrollment.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {enrollment.student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{enrollment.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 font-medium">
                          {formatDate(enrollment.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          enrollment.status === 'valid'
                            ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                            : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                        }`}
                      >
                        {enrollment.status === 'valid' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Unpaid
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
