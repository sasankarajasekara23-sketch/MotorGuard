import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Shield, FileText, CreditCard, FolderOpen, MessageSquareHeart,
  CheckCircle2, Circle, ArrowRight, Plus, Clock
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { getMyVehicles } from '../../api/vehicleApi';
import { getMyPolicies } from '../../api/policyApi';
import { getMyClaims } from '../../api/claimApi';
import { getMyPayments } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { PLAN_META, daysUntil } from '../../utils/insurance';
import NumberPlate from '../../components/NumberPlate';

const claimBadge = {
  SUBMITTED: 'badge-blue',
  UNDER_REVIEW: 'badge-yellow',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red',
  PAID: 'badge-purple',
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const OverviewPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ vehicles: [], policies: [], claims: [], payments: [] });

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled([
        getMyVehicles(), getMyPolicies(), getMyClaims(), getMyPayments(),
      ]);
      const pick = (r) => (r.status === 'fulfilled' ? r.value.data.data || [] : []);
      setData({
        vehicles: pick(results[0]),
        policies: pick(results[1]),
        claims: pick(results[2]),
        payments: pick(results[3]),
      });
      setLoading(false);
    };
    load();
  }, []);

  const { vehicles, policies, claims, payments } = data;
  const activePolicies = policies.filter(p => p.status === 'ACTIVE');
  const openClaims = claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(c.status));
  const premiumsPaid = payments
    .filter(p => p.paymentType === 'PREMIUM_PAYMENT' && p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const steps = [
    { label: 'Register a vehicle', done: vehicles.length > 0, to: '/vehicles' },
    { label: 'Choose a coverage plan', done: policies.length > 0, to: '/policies' },
    { label: 'Pay your premium', done: payments.some(p => p.paymentType === 'PREMIUM_PAYMENT'), to: '/payments' },
    { label: 'You are protected — file a claim any time', done: claims.length > 0, to: '/claims' },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  const stats = [
    { label: 'My Vehicles', value: vehicles.length, icon: Car, to: '/vehicles', tone: 'from-blue-600 to-blue-500' },
    { label: 'Active Policies', value: activePolicies.length, icon: Shield, to: '/policies', tone: 'from-emerald-600 to-teal-500' },
    { label: 'Open Claims', value: openClaims.length, icon: FileText, to: '/claims', tone: 'from-amber-600 to-orange-500' },
    { label: 'Premiums Paid', value: formatCurrency(premiumsPaid), icon: CreditCard, to: '/payments', tone: 'from-violet-600 to-purple-500' },
  ];

  const actions = [
    { label: 'Add Vehicle', icon: Car, to: '/vehicles' },
    { label: 'Buy Policy', icon: Shield, to: '/policies' },
    { label: 'File a Claim', icon: FileText, to: '/claims' },
    { label: 'Pay Premium', icon: CreditCard, to: '/payments' },
    { label: 'Upload Document', icon: FolderOpen, to: '/documents' },
    { label: 'Give Feedback', icon: MessageSquareHeart, to: '/feedback' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';
  const recentClaims = [...claims]
    .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
    .slice(0, 3);
  const nextExpiry = [...activePolicies].sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <div className="card-glass border border-slate-800 p-8 relative overflow-hidden animate-in">
        <div className="absolute -top-20 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-sm font-semibold text-blue-400">{greeting()}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            {loading
              ? 'Loading your account summary...'
              : nextExpiry
                ? `Your next policy renewal is ${formatDate(nextExpiry.endDate)} for ${nextExpiry.vehicleRegNo}.`
                : 'Register a vehicle and choose a plan to get covered in minutes.'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger">
        {stats.map(({ label, value, icon: Icon, to, tone }, i) => (
          <Link key={label} to={to} style={{ '--i': i }} className="card card-hover flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              {loading
                ? <div className="skeleton h-7 w-16 mt-1" />
                : <p className="text-2xl font-bold text-white truncate">{value}</p>}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Getting started */}
        <div className="card lg:col-span-2 animate-in">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">Your coverage journey</h2>
            <span className="text-xs font-semibold text-blue-400">{doneCount} of {steps.length} complete</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-2">
            {steps.map((s) => (
              <li key={s.label}>
                <Link
                  to={s.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  {s.done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    : <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />}
                  <span className={`text-sm flex-1 ${s.done ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200 font-medium'}`}>
                    {s.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="card animate-in">
          <h2 className="text-base font-bold text-white mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center"
              >
                <Icon className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles & cover */}
      {!loading && vehicles.length > 0 && (
        <div className="card animate-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Your vehicles & cover</h2>
            <Link to="/vehicles" className="text-xs font-semibold text-blue-400 hover:text-blue-300">Manage</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {vehicles.map(v => {
              const cover = activePolicies.find(p => p.vehicleId === v.id);
              const left = cover ? daysUntil(cover.endDate) : null;
              return (
                <div key={v.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="min-w-0">
                    <NumberPlate value={v.registrationNo} size="sm" />
                    <p className="text-xs text-slate-400 mt-1.5 truncate">{v.make} {v.model} · {v.year}</p>
                  </div>
                  {cover ? (
                    <div className="text-right flex-shrink-0">
                      <span className="badge-green">{PLAN_META[cover.policyType]?.label || cover.policyType}</span>
                      <p className="text-[11px] text-slate-500 mt-1">{left > 0 ? `${left} days left` : 'Ends today'}</p>
                    </div>
                  ) : (
                    <Link to="/policies" className="badge-yellow flex-shrink-0">Not insured</Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent claims */}
      <div className="card p-0 overflow-hidden animate-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-semibold text-white">Recent claims</h2>
          </div>
          <Link to="/claims" className="text-xs font-semibold text-blue-400 hover:text-blue-300">View all</Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3"><div className="skeleton h-10" /><div className="skeleton h-10" /></div>
        ) : recentClaims.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400">No claims yet — hopefully it stays that way.</p>
            <Link to="/claims" className="btn-secondary mt-4 inline-flex items-center gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> File a claim
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recentClaims.map(c => (
              <li key={c.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{c.vehicleRegNo}</p>
                  <p className="text-xs text-slate-500 truncate">{formatDate(c.submittedDate)} · {c.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-mono text-slate-300">{formatCurrency(c.amount)}</span>
                  <span className={claimBadge[c.status] || 'badge-gray'}>{c.status.replace('_', ' ')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
