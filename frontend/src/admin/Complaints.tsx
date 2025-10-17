import React, { useState, useEffect } from 'react';
import { adminApi } from './api';

type ReportStatus = 'under_review' | 'solve';
type TutorType = 'individual' | 'mass';

interface Report {
  id: string;
  student_name: string;
  tutor_name: string;
  tutor_type: TutorType | null;
  reason: string | null;
  description: string | null;
  submitted_date: Date | null;
  status: ReportStatus | null;
  resolve_date: Date | null;
  response: string | null;
  resolved_by_name: string | null;
}

export default function Complaints() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'under_review' | 'solve'>('all');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    reportId: string;
    currentStatus: ReportStatus | null;
  }>({ show: false, reportId: '', currentStatus: null });
  const [processing, setProcessing] = useState(false);

  // Load reports
  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.listReports();
      setReports(data.reports || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load reports');
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Handle status toggle
  const handleToggleStatus = async () => {
    if (!confirmModal.reportId) return;

    try {
      setProcessing(true);
      await adminApi.toggleReportStatus(confirmModal.reportId);
      
      // Refresh reports after toggle
      await loadReports();
      
      // Close modal
      setConfirmModal({ show: false, reportId: '', currentStatus: null });
    } catch (e: any) {
      setError(e.message || 'Failed to update report status');
      console.error('Error toggling status:', e);
    } finally {
      setProcessing(false);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge style
  const getStatusBadge = (status: ReportStatus | null) => {
    if (status === 'solve') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Resolved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Under Review
      </span>
    );
  };

  // Stats
  const stats = {
    total: reports.length,
    underReview: reports.filter((r) => r.status === 'under_review').length,
    resolved: reports.filter((r) => r.status === 'solve').length,
  };

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Complaints 🚩</h1>
          <p className="text-gray-600">Manage student reports about tutors</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-blue-800">{stats.total}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-yellow-800">{stats.underReview}</div>
            <div className="text-xs text-yellow-600">Under Review</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-green-800">{stats.resolved}</div>
            <div className="text-xs text-green-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('under_review')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'under_review'
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Under Review ({stats.underReview})
            </button>
            <button
              onClick={() => setFilter('solve')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'solve'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Resolved ({stats.resolved})
            </button>
          </div>
          
          {/* Results Info & Refresh */}
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              <strong>{filteredReports.length}</strong> of <strong>{stats.total}</strong>
            </span>
            <button 
              onClick={loadReports}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              disabled={loading}
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-semibold text-gray-900 p-4">Student</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Tutor</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Reason & Details</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Date</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Status</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Resolved Info</th>
                  <th className="text-left font-semibold text-gray-900 p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                      <p className="text-gray-500">
                        {filter !== 'all' 
                          ? 'Try adjusting your filters'
                          : 'No student reports have been submitted yet'
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      {/* Student */}
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {report.student_name}
                        </div>
                      </td>
                      
                      {/* Tutor */}
                      <td className="p-4">
                        <div className="text-sm text-gray-900 truncate max-w-[150px]">
                          {report.tutor_name}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          report.tutor_type === 'individual' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {report.tutor_type || 'N/A'}
                        </span>
                      </td>
                      
                      {/* Reason & Description */}
                      <td className="p-4">
                        <div className="text-sm text-gray-900 max-w-[250px] truncate font-medium">
                          {report.reason || 'No reason provided'}
                        </div>
                        {report.description && (
                          <div
                            className="text-xs text-gray-500 mt-1 max-w-[250px] truncate"
                            title={report.description}
                          >
                            {report.description}
                          </div>
                        )}
                      </td>
                      
                      {/* Submitted Date */}
                      <td className="p-4">
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(report.submitted_date)}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(report.status)}
                      </td>
                      
                      {/* Resolved Info */}
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-900 truncate max-w-[120px]">
                            {report.resolved_by_name || '-'}
                          </div>
                          {report.resolve_date && (
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(report.resolve_date)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              reportId: report.id,
                              currentStatus: report.status,
                            })
                          }
                          className={`px-3 py-2 font-medium rounded-lg transition-colors text-xs whitespace-nowrap ${
                            report.status === 'solve'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {report.status === 'solve' ? '↩️ Unresolve' : '✓ Resolve'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
            <button 
              onClick={loadReports}
              className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={processing ? undefined : () => setConfirmModal({ show: false, reportId: '', currentStatus: null })} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {confirmModal.currentStatus === 'solve' ? 'Mark as Unresolved?' : 'Mark as Resolved?'}
            </h3>
            <p className="mt-2 text-gray-600 text-sm">
              Are you sure you want to mark this report as{' '}
              <strong>
                {confirmModal.currentStatus === 'solve' ? 'unresolved' : 'resolved'}
              </strong>
              ?
              {confirmModal.currentStatus !== 'solve' && (
                <span> Your name will be recorded as the resolver.</span>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, reportId: '', currentStatus: null })
                }
                disabled={processing}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={processing}
                className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  confirmModal.currentStatus === 'solve'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processing ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


