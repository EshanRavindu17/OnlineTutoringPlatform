import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Users, ArrowLeft, Clock, BookOpen } from 'lucide-react';
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
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <p className="text-gray-500 mt-1">View enrollment status for each class</p>

        {classes.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No classes found</p>
            <p className="text-sm text-gray-500 mt-1">Create a class to see student enrollments</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classData) => {
              // We'll show the total student count from the class
              // In a real scenario, you might want to fetch enrollment stats for each class
              const totalStudents = classData.studentCount || 0;

              return (
                <button
                  key={classData.class_id}
                  onClick={() => handleClassClick(classData)}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all text-left hover:border-blue-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {classData.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{classData.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{classData.day} at {formatTime(classData.time)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {totalStudents} {totalStudents === 1 ? 'Student' : 'Students'}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">View Details →</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Show detailed enrollment table for selected class
  return (
    <div className="p-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Classes</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{selectedClass.title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{selectedClass.subject}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{selectedClass.day} at {formatTime(selectedClass.time)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Table */}
      {loadingEnrollments ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enrollments...</p>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No students enrolled yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.enrol_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {enrollment.student.photo_url ? (
                          <img
                            src={enrollment.student.photo_url}
                            alt={enrollment.student.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {enrollment.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(enrollment.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.status === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {enrollment.status === 'valid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
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
