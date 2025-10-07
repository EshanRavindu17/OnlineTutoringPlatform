import React, { useState, useEffect } from 'react';
import { adminApi } from './api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinanceData {
  commission: {
    rate: number;
    created_at: string | null;
    updated_by_name: string | null;
  };
  summary: {
    totalRevenue: number;
    platformRevenue: number;
    individualRevenue: number;
    massRevenue: number;
    totalTransactions: number;
    individualTransactions: number;
    massTransactions: number;
  };
  paymentMethods: Record<string, number>;
  monthlyRevenue: Array<{
    month: string;
    individual: number;
    mass: number;
    total: number;
    commission: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'individual' | 'mass';
    amount: number;
    date: string;
    method: string;
    student: string;
    tutor: string;
    subject: string;
  }>;
}

export default function Finance() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCommission, setEditingCommission] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const analytics = await adminApi.getFinanceAnalytics();
      setData(analytics);
    } catch (e: any) {
      setError(e.message || 'Failed to load finance data');
      console.error('Error loading finance data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCommission = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Commission rate must be between 0 and 100');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      await adminApi.updateCommission(rate);
      await loadData();
      setEditingCommission(false);
      setNewRate('');
    } catch (e: any) {
      setError(e.message || 'Failed to update commission');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <div className="text-gray-500">Loading finance data...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Revenue 💰</h1>
          <p className="text-gray-600">Manage commission and track platform revenue</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Commission Management */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Platform Commission Rate</h3>
            <p className="text-sm text-gray-600 mb-3">
              Percentage of revenue retained by the platform from all transactions
            </p>
            {!editingCommission ? (
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{data.commission.rate}%</div>
                {data.commission.updated_by_name && (
                  <p className="text-xs text-gray-500">
                    Last updated by {data.commission.updated_by_name}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Enter new rate (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                />
                <button
                  onClick={handleUpdateCommission}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingCommission(false);
                    setNewRate('');
                    setError('');
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {!editingCommission && (
            <button
              onClick={() => {
                setEditingCommission(true);
                setNewRate(data.commission.rate.toString());
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Edit Rate
            </button>
          )}
        </div>
      </div>

      {/* Revenue Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.summary.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.summary.totalTransactions} transactions</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Platform Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(data.summary.platformRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.commission.rate}% commission</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Individual Sessions</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(data.summary.individualRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.summary.individualTransactions} payments</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Mass Classes</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(data.summary.massRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.summary.massTransactions} payments</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar dataKey="individual" fill="#3b82f6" name="Individual Sessions" />
            <Bar dataKey="mass" fill="#8b5cf6" name="Mass Classes" />
            <Bar dataKey="commission" fill="#10b981" name="Platform Commission" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-900 p-4">Type</th>
                <th className="text-left font-semibold text-gray-900 p-4">Student</th>
                <th className="text-left font-semibold text-gray-900 p-4">Tutor</th>
                <th className="text-left font-semibold text-gray-900 p-4">Subject</th>
                <th className="text-left font-semibold text-gray-900 p-4">Amount</th>
                <th className="text-left font-semibold text-gray-900 p-4">Method</th>
                <th className="text-left font-semibold text-gray-900 p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-6xl mb-4">💸</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500">Successful payments will appear here</p>
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        txn.type === 'individual' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {txn.student}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {txn.tutor}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 truncate max-w-[150px]">
                        {txn.subject}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(txn.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {txn.method}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(txn.date)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
