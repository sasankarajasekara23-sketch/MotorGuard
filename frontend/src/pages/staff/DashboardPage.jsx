import React, { useEffect, useState } from 'react';
import { Users, Shield, FileText, Car, TrendingUp, Clock } from 'lucide-react';
import { getAllClaims } from '../../api/claimApi';
import { getAllCustomers } from '../../api/customerApi';
import { getAllPolicies } from '../../api/policyApi';
import { getAllVehicles } from '../../api/vehicleApi';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const statusColors = {
  SUBMITTED:    'badge-blue',
  UNDER_REVIEW: 'badge-yellow',
  APPROVED:     'badge-green',
  REJECTED:     'badge-red',
  PAID:         'badge-purple',
};

const statusHex = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  PAID: '#a855f7',
};

const roleTitles = {
  SUPERVISOR: 'Supervisor',
  CLAIMS_OFFICER: 'Claims Officer',
  OPERATIONS_MANAGER: 'Operations Manager',
  BRANCH_MANAGER: 'Branch Manager',
  FINANCE_EXECUTIVE: 'Finance Executive',
};

const DonutChart = ({ counts }) => {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No claims to chart yet.</p>;
  }
  let acc = 0;
  const stops = entries.map(([status, n]) => {
    const start = (acc / total) * 100;
    acc += n;
    return `${statusHex[status] || '#64748b'} ${start}% ${(acc / total) * 100}%`;
  }).join(', ');

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-36 flex-shrink-0">
        <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${stops})` }} />
        <div className="absolute inset-4 rounded-full bg-slate-900 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Claims</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1 w-full">
        {entries.map(([status, n]) => (
          <li key={status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: statusHex[status] }} />
              {status.replace('_', ' ')}
            </span>
            <span className="font-semibold text-white">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PolicyBars = ({ counts }) => {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (total === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No active policies to chart yet.</p>;
  }
  return (
    <div className="space-y-4">
      {Object.entries(counts).map(([type, n]) => {
        const pct = Math.round((n / total) * 100);
        return (
          <div key={type}>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">{type.replace('_', ' ')}</span>
              <span className="text-slate-400">{n} ({pct}%)</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DashboardPage = () => {
  const { role, user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, policies: 0, claims: 0, vehicles: 0, recentClaims: [], claimCounts: {}, policyCounts: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let claims = [], customers = [], policies = [], vehicles = [];
        try { claims    = (await getAllClaims()).data.data;    } catch(e){}
        try { customers = (await getAllCustomers()).data.data; } catch(e){}
        try { policies  = (await getAllPolicies()).data.data;  } catch(e){}
        try { vehicles  = (await getAllVehicles()).data.data;  } catch(e){}

        const claimCounts = {};
        claims.forEach(c => { claimCounts[c.status] = (claimCounts[c.status] || 0) + 1; });
        const policyCounts = {};
        policies.filter(p => p.status === 'ACTIVE').forEach(p => {
          policyCounts[p.policyType] = (policyCounts[p.policyType] || 0) + 1;
        });

        setStats({
          claimCounts,
          policyCounts,
          customers: customers.length,
          policies:  policies.filter(p => p.status === 'ACTIVE').length,
          claims:    claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length,
          vehicles:  vehicles.length,
          recentClaims: [...claims].sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)).slice(0, 6),
        });
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Customers',      value: stats.customers, icon: Users,     gradient: 'from-blue-600 to-blue-500',    glow: 'shadow-blue-900/40' },
    { title: 'Active Policies',      value: stats.policies,  icon: Shield,    gradient: 'from-emerald-600 to-teal-500', glow: 'shadow-emerald-900/40' },
    { title: 'Pending Claims',       value: stats.claims,    icon: FileText,  gradient: 'from-amber-600 to-orange-500', glow: 'shadow-amber-900/40' },
    { title: 'Registered Vehicles',  value: stats.vehicles,  icon: Car,       gradient: 'from-violet-600 to-purple-500', glow: 'shadow-violet-900/40' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-glass border border-slate-800 p-7 relative overflow-hidden animate-in">
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{roleTitles[role] || 'Staff'} Portal</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Here's what's happening across MotorGuard today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
        {cards.map((card, i) => (
          <div key={i} style={{ '--i': i }} className="card card-hover flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.glow}`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-16 h-7 bg-slate-800 rounded-lg animate-pulse" />
                ) : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-in">
          <h2 className="text-base font-semibold text-white mb-5">Claims by status</h2>
          {loading ? <div className="skeleton h-36" /> : <DonutChart counts={stats.claimCounts} />}
        </div>
        <div className="card animate-in">
          <h2 className="text-base font-semibold text-white mb-5">Active policies by type</h2>
          {loading ? <div className="skeleton h-36" /> : <PolicyBars counts={stats.policyCounts} />}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-semibold text-white">Recent Claims</h2>
          </div>
          <span className="badge badge-gray">{stats.recentClaims.length} records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : stats.recentClaims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="table-header">Customer</th>
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Policy</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentClaims.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell-bold">{c.submittedBy}</td>
                    <td className="table-cell">{c.vehicleRegNo}</td>
                    <td className="table-cell">{c.policyType}</td>
                    <td className="table-cell">{formatCurrency(c.amount)}</td>
                    <td className="table-cell">
                      <span className={statusColors[c.status] || 'badge-gray'}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">{formatDate(c.submittedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm">No claims data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
