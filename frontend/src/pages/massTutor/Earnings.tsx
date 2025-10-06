import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, AlertCircle } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface EarningData {
  month: string;
  gross: number;
  commission: number;
  commissionAmount: number;
  payout: number;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningData[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await massTutorAPI.getEarnings();
      setEarnings(response.earnings || []);
      setCommissionRate(response.commissionRate || 20);
    } catch (error: any) {
      console.error('Failed to fetch earnings:', error);
      toast.error(error.response?.data?.error || 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalGross = earnings.reduce((sum, e) => sum + e.gross, 0);
  const totalCommission = earnings.reduce((sum, e) => sum + e.commissionAmount, 0);
  const totalPayout = earnings.reduce((sum, e) => sum + e.payout, 0);

  // Format currency in LKR
  const formatLKR = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Earnings
              </h1>
              <p className="text-gray-600 mt-1">Track your earnings, commission, and payouts</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900">{formatLKR(totalGross)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{commissionRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commission</p>
                <p className="text-2xl font-bold text-red-600">-{formatLKR(totalCommission)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payout</p>
                <p className="text-2xl font-bold text-blue-600">{formatLKR(totalPayout)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-xl font-semibold text-white">Monthly Breakdown</h2>
          </div>

          {earnings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Month</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Gross Earnings</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Commission Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Commission Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {earnings.map((earning, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{earning.month}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">{formatLKR(earning.gross)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                          {earning.commission}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-600 font-medium">-{formatLKR(earning.commissionAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-bold text-lg">{formatLKR(earning.payout)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr className="font-semibold">
                    <td className="px-6 py-4 text-gray-900">Total</td>
                    <td className="px-6 py-4 text-green-600">{formatLKR(totalGross)}</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-red-600">-{formatLKR(totalCommission)}</td>
                    <td className="px-6 py-4 text-blue-600 text-lg">{formatLKR(totalPayout)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Earnings Yet</h3>
              <p className="text-gray-500">
                You haven't received any payments yet. Start teaching to earn!
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        {earnings.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">About Your Earnings</h3>
                <p className="text-sm text-blue-700">
                  The platform charges a {commissionRate}% commission on all earnings. Your net payout is the amount you'll receive after commission deduction. 
                  Payments are processed monthly and transferred to your registered bank account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
