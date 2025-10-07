import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  Download, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getPaymentSummaryByStudentId, getStudentIDByUserID, getMassPayment, Payment } from '../../api/Student';
import { useAuth } from '../../context/authContext';

// Payment type for tab navigation
type PaymentType = 'individual' | 'mass' | 'all';

// Base interface for all payment types
interface BasePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  method: string;
}

// Individual session payment
interface IndividualPayment extends BasePayment {
  type: 'individual';
  sessionId: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  subject: string;
  title: string;
  slots: string[];
  tutorName: string;
  tutorPhoto: string;
}

// Mass class payment
interface MassClassPayment extends BasePayment {
  type: 'mass';
  classId: string;
  className: string;
  subject: string;
  paidMonth: string;
  tutorName: string;
  tutorPhoto: string;
  paymentDate: string;
}

// Union type for all payment history items
type PaymentHistory = IndividualPayment | MassClassPayment;

interface PaymentSummaryStats {
  // Combined metrics for both payment types
  totalAmount: number;
  totalPayments: number;
  successfulPaymentsCount: number;
  
  // Individual session specific metrics
  individual: {
    completedSessionCount: number;
    ScheduledSessionCount: number;
    canceledSessionCount: number;
    totalAmount: number;
  };
  
  // Mass class specific metrics
  massClass: {
    totalClasses: number;
    totalMonthsPaid: number;
    totalAmount: number;
  };
}

interface PaymentFilters {
  status: string;
  dateRange: string;
  searchTerm: string;
}

export default function PaymentHistoryPage() {
  const { currentUser, userProfile } = useAuth();
  
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState<PaymentType>('all');
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage, filters, userProfile, activeTab]);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Toast notification function
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: 'info', message: '' });
    }, 4000);
  };

  const fetchPaymentHistory = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First get the student_id using the user_id
      const studentId = await getStudentIDByUserID(userProfile.id);
      
      if (!studentId) {
        console.log('No student_id found for user:', userProfile.id);
        setPayments([]);
        setPaymentSummary(null);
        return;
      }

      let individualData = null;
      let massData = null;
      let allPayments: PaymentHistory[] = [];

      // Fetch individual payments if needed
      if (activeTab === 'individual' || activeTab === 'all') {
        try {
          individualData = await getPaymentSummaryByStudentId(studentId);
        } catch (error) {
          console.error('Failed to fetch individual payments:', error);
          showToast('error', 'Failed to load individual payment history');
        }
      }

      // Fetch mass class payments if needed
      if (activeTab === 'mass' || activeTab === 'all') {
        try {
          const massPayments = await getMassPayment(studentId);
          // Transform to match the expected structure
          massData = {
            transactions: massPayments,
            totalAmount: massPayments.reduce((sum, payment) => sum + payment.amount, 0),
            successfulPaymentsCount: massPayments.filter(payment => payment.status === 'succeeded').length,
            totalClasses: new Set(massPayments.map(payment => payment.class_id)).size,
            totalMonthsPaid: massPayments.length
          };
        } catch (error) {
          console.error('Failed to fetch mass payments:', error);
          showToast('error', 'Failed to load mass class payment history');
        }
      }

      // Transform individual payments
      if (individualData && (activeTab === 'individual' || activeTab === 'all')) {
        const transformedIndividualPayments: IndividualPayment[] = individualData.transactions.map(transaction => ({
          type: 'individual',
          id: transaction.i_payment_id,
          sessionId: transaction.session_id,
          amount: transaction.amount,
          currency: 'lkr',
          status: transaction.status.toLowerCase(),
          method: transaction.method || 'Online Payment',
          createdAt: new Date(transaction.payment_date_time).toISOString(),
          sessionDate: new Date(transaction.payment_date_time).toISOString().split('T')[0],
          sessionTime: new Date(transaction.payment_date_time).toTimeString().slice(0, 5),
          duration: 1, // Default duration since not provided by API
          subject: `Individual Session (${transaction.method || 'Online Payment'})`,
          title: transaction.Sessions?.title || `Session ${transaction.session_id.substring(0, 8)}`,
          slots: transaction.Sessions?.slots || [],
          tutorName: transaction.Sessions?.Individual_Tutor?.User?.name || `Session ${transaction.session_id.substring(0, 8)}`,
          tutorPhoto: transaction.Sessions?.Individual_Tutor?.User?.photo_url || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.Sessions?.Individual_Tutor?.User?.name || 'Tutor')}&background=4F46E5&color=FFFFFF`,
        }));
        allPayments.push(...transformedIndividualPayments);
      }

      // Transform mass class payments
      if (massData && (activeTab === 'mass' || activeTab === 'all')) {
        const transformedMassPayments: MassClassPayment[] = massData.transactions.map(transaction => ({
          type: 'mass',
          id: transaction.m_payment_id,
          classId: transaction.class_id,
          amount: transaction.amount,
          currency: 'lkr',
          status: transaction.status.toLowerCase(),
          method: transaction.method || 'Online Payment',
          createdAt: new Date(transaction.payment_time).toISOString(),
          paidMonth: transaction.paidMonth,
          paymentDate: new Date(transaction.payment_time).toISOString().split('T')[0],
          className: transaction.Class?.title || `Class ${transaction.class_id?.substring(0, 8)}`,
          subject: 'Mass Class', // Will be updated when we get the actual subject from API
          tutorName: transaction.Class?.Mass_Tutor?.User?.name || 'Mass Tutor',
          tutorPhoto: transaction.Class?.Mass_Tutor?.User?.photo_url || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.Class?.Mass_Tutor?.User?.name || 'Tutor')}&background=4F46E5&color=FFFFFF`,
        }));
        allPayments.push(...transformedMassPayments);
      }

      // Sort all payments by date (most recent first)
      allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Update payment summary stats
      const combinedStats: PaymentSummaryStats = {
        totalAmount: (individualData?.totalAmount || 0) + (massData?.totalAmount || 0),
        totalPayments: allPayments.length,
        successfulPaymentsCount: (individualData?.successfulPaymentsCount || 0) + (massData?.successfulPaymentsCount || 0),
        individual: {
          completedSessionCount: individualData?.completedSessionCount || 0,
          ScheduledSessionCount: individualData?.ScheduledSessionCount || 0,
          canceledSessionCount: individualData?.canceledSessionCount || 0,
          totalAmount: individualData?.totalAmount || 0,
        },
        massClass: {
          totalClasses: massData?.totalClasses || 0,
          totalMonthsPaid: massData?.totalMonthsPaid || 0,
          totalAmount: massData?.totalAmount || 0,
        }
      };

      setPaymentSummary(combinedStats);
      setPayments(allPayments);
      setTotalItems(allPayments.length);
      setTotalPages(Math.ceil(allPayments.length / 10));
      
      if (allPayments.length > 0) {
        const massPaymentCount = allPayments.filter(p => p.type === 'mass').length;
        const individualPaymentCount = allPayments.filter(p => p.type === 'individual').length;
        
        let message = `✅ Loaded ${allPayments.length} payment records successfully!`;
        if (activeTab === 'all' && massPaymentCount > 0 && individualPaymentCount > 0) {
          message += ` (${individualPaymentCount} individual, ${massPaymentCount} mass class)`;
        } else if (activeTab === 'mass' && massPaymentCount > 0) {
          message = `✅ Loaded ${massPaymentCount} mass class payments successfully!`;
        } else if (activeTab === 'individual' && individualPaymentCount > 0) {
          message = `✅ Loaded ${individualPaymentCount} individual session payments successfully!`;
        }
        
        showToast('success', message);
      } else if (studentId) {
        const tabName = activeTab === 'all' ? 'payment' : activeTab === 'mass' ? 'mass class payment' : 'individual session payment';
        showToast('info', `ℹ️ No ${tabName} records found`);
      }
      
    } catch (err) {
      setError('Failed to fetch payment history');
      console.error('Error fetching payment history:', err);
      
      // Clear data on error
      setPayments([]);
      setPaymentSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'refund':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'refunded':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'refund':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter payments based on current filters
  const getFilteredPayments = () => {
    let filtered = payments;

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Search term filter (search in title, tutor name, subject)
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => {
        const title = getPaymentTitle(payment).toLowerCase();
        const tutorName = payment.tutorName.toLowerCase();
        const subject = payment.subject.toLowerCase();
        
        return title.includes(searchLower) || 
               tutorName.includes(searchLower) || 
               subject.includes(searchLower);
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          // Set to start of today
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          // Set to 7 days ago from start of today
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          // Set to 30 days ago from start of today
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          // Set to 365 days ago from start of today
          startDate.setDate(now.getDate() - 365);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(payment => {
        const paymentDateStr = getPaymentDate(payment);
        const paymentDate = new Date(paymentDateStr);
        
        // Reset payment date to start of day for comparison
        paymentDate.setHours(0, 0, 0, 0);
        
        return paymentDate >= startDate;
      });
    }

    return filtered;
  };

  // Get current page payments
  const getCurrentPagePayments = () => {
    const filteredPayments = getFilteredPayments();
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredPayments.slice(startIndex, endIndex);
  };

  // Update pagination info based on filtered results
  const getFilteredPaginationInfo = () => {
    const filteredPayments = getFilteredPayments();
    const filteredTotalPages = Math.ceil(filteredPayments.length / 10);
    return {
      totalItems: filteredPayments.length,
      totalPages: filteredTotalPages,
      currentPagePayments: getCurrentPagePayments()
    };
  };

  // Helper function to get payment title
  const getPaymentTitle = (payment: PaymentHistory) => {
    if (payment.type === 'individual') {
      return payment.title;
    } else {
      return payment.className;
    }
  };

  // Helper function to get payment details
  const getPaymentDetails = (payment: PaymentHistory) => {
    if (payment.type === 'individual') {
      return `${payment.sessionTime} • ${payment.duration}h`;
    } else {
      return `${payment.paidMonth}`;
    }
  };

  // Helper function to get payment date
  const getPaymentDate = (payment: PaymentHistory) => {
    if (payment.type === 'individual') {
      return payment.sessionDate;
    } else {
      return payment.paymentDate;
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // Implement receipt download functionality
    console.log('Downloading receipt for payment:', paymentId);
    alert('Receipt download feature would be implemented here');
  };

  const getTotalSpent = () => {
    if (activeTab === 'individual') return paymentSummary?.individual.totalAmount || 0;
    if (activeTab === 'mass') return paymentSummary?.massClass.totalAmount || 0;
    return paymentSummary?.totalAmount || 0;
  };

  const getCompletedSessions = () => {
    if (activeTab === 'mass') return paymentSummary?.massClass.totalMonthsPaid || 0;
    return paymentSummary?.individual.completedSessionCount || 0;
  };

  const getScheduledSessions = () => {
    if (activeTab === 'mass') return paymentSummary?.massClass.totalClasses || 0;
    return paymentSummary?.individual.ScheduledSessionCount || 0;
  };

  const getCanceledSessions = () => {
    if (activeTab === 'mass') return 0; // Mass classes don't have canceled concept
    return paymentSummary?.individual.canceledSessionCount || 0;
  };

  const getSuccessfulPayments = () => {
    return paymentSummary?.successfulPaymentsCount || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`
            rounded-lg shadow-lg p-4 max-w-sm min-w-[300px] flex items-center gap-3
            ${toast.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 
              toast.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' : 
              'bg-blue-100 border border-blue-200 text-blue-800'}
          `}>
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ show: false, type: 'info', message: '' })}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">Track all your tutoring session payments and transactions</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'individual'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Individual Sessions
              </button>
              <button
                onClick={() => setActiveTab('mass')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mass'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mass Classes
              </button>
            </nav>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={`grid gap-6 mb-8 ${
          activeTab === 'mass' 
            ? 'grid-cols-1 md:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-5'
        }`}>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalSpent())}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {activeTab === 'mass' ? 'Months Paid' : 'Completed Sessions'}
                </p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{getCompletedSessions()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {activeTab === 'mass' ? 'Total Classes' : 'Scheduled Sessions'}
                </p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{getScheduledSessions()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Only show canceled sessions for individual or all tabs */}
          {activeTab !== 'mass' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Canceled Sessions</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{getCanceledSessions()}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Successful Payments</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{getSuccessfulPayments()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tutor, subject..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refund">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: 'all', dateRange: 'all', searchTerm: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchPaymentHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : getCurrentPagePayments().length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {getFilteredPayments().length === 0 && payments.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No Payment History</h3>
                  <p className="text-gray-400 mb-6">You haven't made any payments for tutoring sessions yet.</p>
                  <div className="text-sm text-gray-500 mb-6">
                    <p>• Book sessions with individual tutors</p>
                    <p>• Enroll in mass classes</p>
                    <p>• Make secure payments online</p>
                    <p>• Track your payment history here</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/find-tutors'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Tutors
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No Results Found</h3>
                  <p className="text-gray-400 mb-6">No payments match your current search criteria.</p>
                  <button 
                    onClick={() => setFilters({ status: 'all', dateRange: 'all', searchTerm: '' })}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentPagePayments().map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getPaymentTitle(payment)}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{getPaymentDetails(payment)}</span>
                            {payment.type === 'mass' && (
                              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                Mass Class
                              </span>
                            )}
                            {payment.type === 'individual' && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Individual
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={payment.tutorPhoto} 
                            alt={payment.tutorName}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900">{payment.tutorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 ${getStatusBadge(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(getPaymentDate(payment))}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const paginationInfo = getFilteredPaginationInfo();
            return paginationInfo.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, paginationInfo.totalItems)} of {paginationInfo.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {paginationInfo.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(paginationInfo.totalPages, currentPage + 1))}
                    disabled={currentPage === paginationInfo.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      <Footer />
    </div>
  );
}