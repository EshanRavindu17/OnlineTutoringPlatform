import React, { useState, useEffect } from 'react';
import { adminApi } from './api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PaymentRate {
  id: string;
  type: 'individual_hourly' | 'mass_monthly';
  value: number;
  status: 'active' | 'inactive';
  description: string | null;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

interface FinanceData {
  commission: {
    rate: number;
    created_at: string | null;
    updated_by_name: string | null;
  };
  paymentRates?: PaymentRate[];
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
  const [editingRate, setEditingRate] = useState<'individual_hourly' | 'mass_monthly' | null>(null);
  const [newPaymentRate, setNewPaymentRate] = useState('');
  const [paymentRateDescription, setPaymentRateDescription] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [analytics, ratesResponse] = await Promise.all([
        adminApi.getFinanceAnalytics(),
        adminApi.getPaymentRates()
      ]);
      setData({ ...analytics, paymentRates: ratesResponse.rates });
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

  const handleCreatePaymentRate = async (type: 'individual_hourly' | 'mass_monthly') => {
    const value = parseFloat(newPaymentRate);
    if (isNaN(value) || value <= 0) {
      setError('Rate must be a positive number');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      await adminApi.createPaymentRate(type, value, paymentRateDescription || undefined);
      await loadData();
      setEditingRate(null);
      setNewPaymentRate('');
      setPaymentRateDescription('');
    } catch (e: any) {
      setError(e.message || 'Failed to create payment rate');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentRate = async (type: 'individual_hourly' | 'mass_monthly') => {
    const value = parseFloat(newPaymentRate);
    if (isNaN(value) || value <= 0) {
      setError('Rate must be a positive number');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      await adminApi.updatePaymentRate(type, value, paymentRateDescription || undefined);
      await loadData();
      setEditingRate(null);
      setNewPaymentRate('');
      setPaymentRateDescription('');
    } catch (e: any) {
      setError(e.message || 'Failed to update payment rate');
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading finance data...</div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance & Revenue 💰</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage commission and track platform revenue</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 dark:text-red-400 mr-2">⚠️</span>
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Commission Management */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-blue-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Platform Commission Rate</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Percentage of revenue retained by the platform from all transactions
            </p>
            {!editingCommission ? (
              <div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{data.commission.rate}%</div>
                {data.commission.updated_by_name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 w-48"
                />
                <button
                  onClick={handleUpdateCommission}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
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
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
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
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
            >
              Edit Rate
            </button>
          )}
        </div>
      </div>

      {/* Payment Rates Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Individual Hourly Rate */}
        {data.paymentRates?.find(r => r.type === 'individual_hourly') ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-green-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Individual Hourly Rate 💼</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Payment threshold for individual tutoring sessions (per hour)
                </p>
                {editingRate !== 'individual_hourly' ? (
                  <div>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      LKR {data.paymentRates.find(r => r.type === 'individual_hourly')?.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated by {data.paymentRates.find(r => r.type === 'individual_hourly')?.created_by_name}
                    </p>
                    {data.paymentRates.find(r => r.type === 'individual_hourly')?.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                        "{data.paymentRates.find(r => r.type === 'individual_hourly')?.description}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    <input
                      type="number"
                      value={newPaymentRate}
                      onChange={(e) => setNewPaymentRate(e.target.value)}
                      placeholder="Enter new rate (LKR)"
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                    />
                    <input
                      type="text"
                      value={paymentRateDescription}
                      onChange={(e) => setPaymentRateDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdatePaymentRate('individual_hourly')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRate(null);
                          setNewPaymentRate('');
                          setPaymentRateDescription('');
                          setError('');
                        }}
                        disabled={updating}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {editingRate !== 'individual_hourly' && (
                <button
                  onClick={() => {
                    setEditingRate('individual_hourly');
                    const currentRate = data.paymentRates?.find(r => r.type === 'individual_hourly');
                    setNewPaymentRate(currentRate?.value.toString() || '');
                    setPaymentRateDescription('');
                  }}
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm font-medium"
                >
                  Edit Rate
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-green-200 dark:border-gray-700 p-6">
            {editingRate !== 'individual_hourly' ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Individual Hourly Rate Not Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No payment threshold configured for individual tutoring sessions
                </p>
                <button
                  onClick={() => {
                    setEditingRate('individual_hourly');
                    setNewPaymentRate('3000');
                    setPaymentRateDescription('Initial hourly rate for individual tutoring sessions');
                  }}
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm font-medium"
                >
                  Set Initial Rate
                </button>
              </div>
            ) : (
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Individual Hourly Rate 💼</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Payment threshold for individual tutoring sessions (per hour)
                </p>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={newPaymentRate}
                    onChange={(e) => setNewPaymentRate(e.target.value)}
                    placeholder="Enter rate (LKR)"
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                  />
                  <input
                    type="text"
                    value={paymentRateDescription}
                    onChange={(e) => setPaymentRateDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCreatePaymentRate('individual_hourly')}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Creating...' : 'Create Rate'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRate(null);
                        setNewPaymentRate('');
                        setPaymentRateDescription('');
                        setError('');
                      }}
                      disabled={updating}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mass Monthly Rate */}
        {data.paymentRates?.find(r => r.type === 'mass_monthly') ? (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-orange-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Mass Monthly Rate 👥</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Payment threshold for mass class subscriptions (per month)
                </p>
                {editingRate !== 'mass_monthly' ? (
                  <div>
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      LKR {data.paymentRates.find(r => r.type === 'mass_monthly')?.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated by {data.paymentRates.find(r => r.type === 'mass_monthly')?.created_by_name}
                    </p>
                    {data.paymentRates.find(r => r.type === 'mass_monthly')?.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                        "{data.paymentRates.find(r => r.type === 'mass_monthly')?.description}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    <input
                      type="number"
                      value={newPaymentRate}
                      onChange={(e) => setNewPaymentRate(e.target.value)}
                      placeholder="Enter new rate (LKR)"
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400"
                    />
                    <input
                      type="text"
                      value={paymentRateDescription}
                      onChange={(e) => setPaymentRateDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdatePaymentRate('mass_monthly')}
                        disabled={updating}
                        className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRate(null);
                          setNewPaymentRate('');
                          setPaymentRateDescription('');
                          setError('');
                        }}
                        disabled={updating}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {editingRate !== 'mass_monthly' && (
                <button
                  onClick={() => {
                    setEditingRate('mass_monthly');
                    const currentRate = data.paymentRates?.find(r => r.type === 'mass_monthly');
                    setNewPaymentRate(currentRate?.value.toString() || '');
                    setPaymentRateDescription('');
                  }}
                  className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 text-sm font-medium"
                >
                  Edit Rate
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-orange-200 dark:border-gray-700 p-6">
            {editingRate !== 'mass_monthly' ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Mass Monthly Rate Not Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No payment threshold configured for mass class subscriptions
                </p>
                <button
                  onClick={() => {
                    setEditingRate('mass_monthly');
                    setNewPaymentRate('8000');
                    setPaymentRateDescription('Initial monthly rate for mass class subscriptions');
                  }}
                  className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 text-sm font-medium"
                >
                  Set Initial Rate
                </button>
              </div>
            ) : (
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Mass Monthly Rate 👥</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Payment threshold for mass class subscriptions (per month)
                </p>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={newPaymentRate}
                    onChange={(e) => setNewPaymentRate(e.target.value)}
                    placeholder="Enter rate (LKR)"
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400"
                  />
                  <input
                    type="text"
                    value={paymentRateDescription}
                    onChange={(e) => setPaymentRateDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCreatePaymentRate('mass_monthly')}
                      disabled={updating}
                      className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
                    >
                      {updating ? 'Creating...' : 'Create Rate'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRate(null);
                        setNewPaymentRate('');
                        setPaymentRateDescription('');
                        setError('');
                      }}
                      disabled={updating}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revenue Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(data.summary.totalRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.summary.totalTransactions} transactions</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">Platform Revenue</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(data.summary.platformRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.commission.rate}% commission</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">Individual Sessions</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(data.summary.individualRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.summary.individualTransactions} payments</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">Mass Classes</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(data.summary.massRevenue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.summary.massTransactions} payments</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Revenue (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: 'rgb(31, 41, 55)', 
                border: '1px solid rgb(75, 85, 99)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            <Bar dataKey="individual" fill="#3b82f6" name="Individual Sessions" radius={[8, 8, 0, 0]} />
            <Bar dataKey="mass" fill="#8b5cf6" name="Mass Classes" radius={[8, 8, 0, 0]} />
            <Bar dataKey="commission" fill="#10b981" name="Platform Commission" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Type</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Student</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Tutor</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Subject</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Amount</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Method</th>
                <th className="text-left font-semibold text-gray-900 dark:text-gray-100 p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-6xl mb-4">💸</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No transactions yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Successful payments will appear here</p>
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        txn.type === 'individual' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                        {txn.student}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                        {txn.tutor}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {txn.subject}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(txn.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {txn.method}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
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
