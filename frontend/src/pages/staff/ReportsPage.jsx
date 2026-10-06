import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  ShieldCheck, AlertCircle, PieChart, Activity 
} from 'lucide-react';
import { getAllPolicies } from '../../api/policyApi';
import { getAllClaims } from '../../api/claimApi';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      const [polRes, claimRes] = await Promise.all([getAllPolicies(), getAllClaims()]);
      const policies = polRes.data.data || [];
      const claims = claimRes.data.data || [];

      // Policy Sales
      const sales = { BASIC: 0, COMPREHENSIVE: 0, THIRD_PARTY: 0 };
      let totalPremium = 0;
      policies.forEach(p => {
        if (p.status === 'ACTIVE') {
          sales[p.policyType] = (sales[p.policyType] || 0) + 1;
          totalPremium += (p.premiumAmount || 0);
        }
      });

      // Claims Processing
      const claimCounts = { SUBMITTED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, PAID: 0 };
      let totalPaid = 0;
      claims.forEach(c => {
        claimCounts[c.status] = (claimCounts[c.status] || 0) + 1;
        if (c.status === 'PAID') totalPaid += (c.amount || 0);
      });

      setReport({ sales, totalPremium, claimCounts, totalPaid });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!report) return <div className="text-slate-400 p-8">Failed to generate financial statement.</div>;

  const netBalance = report.totalPremium - report.totalPaid;
  const isPositive = netBalance >= 0;
  const totalPolicies = Object.values(report.sales).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </span>
            Financial & Operational Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time underwriting revenue, loss ratio analysis, and claims payout settlements
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Premiums */}
        <div className="card-glass border border-slate-800 relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Premiums Incurred</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4 tracking-tight">
            {formatCurrency(report.totalPremium)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Active policy book collection</p>
        </div>

        {/* Claims Paid */}
        <div className="card-glass border border-slate-800 relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Claims Disbursed</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-4 tracking-tight">
            {formatCurrency(report.totalPaid)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Paid settlement liabilities</p>
        </div>

        {/* Net Underwriting Result */}
        <div className="card-glass border border-slate-800 relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Underwriting Margin</span>
            <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold mt-4 tracking-tight ${isPositive ? 'text-blue-400' : 'text-red-400'}`}>
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Surplus capital reserve balance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Distribution */}
        <div className="card border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <PieChart className="w-4 h-4 text-blue-400" />
            Active Underwritten Policies ({totalPolicies})
          </h3>
          <div className="space-y-4">
            {Object.entries(report.sales).map(([type, count]) => {
              const pct = totalPolicies > 0 ? ((count / totalPolicies) * 100).toFixed(0) : 0;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{type.replace('_', ' ')}</span>
                    <span className="text-slate-400">{count} policies ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claims Pipeline Distribution */}
        <div className="card border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-amber-400" />
            Claims Status Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(report.claimCounts).map(([status, count]) => {
              const colorMap = {
                SUBMITTED: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
                UNDER_REVIEW: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
                APPROVED: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
                REJECTED: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
                PAID: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
              };
              return (
                <div key={status} className={`p-4 rounded-xl border ${colorMap[status] || 'border-slate-800 bg-slate-900'} text-center`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-black">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
