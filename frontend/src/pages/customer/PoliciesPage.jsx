import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, RefreshCw, Shield, X, CheckCircle2, XCircle, Clock, CreditCard, Edit3, Trash2 } from 'lucide-react';
import { getMyPolicies, createPolicy, updatePolicy, deletePolicy, renewPolicy } from '../../api/policyApi';
import { getMyVehicles } from '../../api/vehicleApi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { PLAN_META, daysUntil, termRemainingPercent, policyNumber } from '../../utils/insurance';
import NumberPlate from '../../components/NumberPlate';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const policyTypeInfo = {
  BASIC:        { label: 'Basic',        price: 'Rs 500 / yr',  color: 'from-slate-600 to-slate-500',    icon: '🛡️' },
  COMPREHENSIVE:{ label: 'Comprehensive',price: 'Rs 1,200 / yr', color: 'from-blue-600 to-indigo-500',   icon: '⭐' },
  THIRD_PARTY:  { label: 'Third Party',  price: 'Rs 300 / yr',  color: 'from-emerald-600 to-teal-500',  icon: '✅' },
};

const statusIcon = { ACTIVE: CheckCircle2, EXPIRED: XCircle, PENDING: Clock };
const statusColor = {
  ACTIVE:  'text-emerald-400',
  EXPIRED: 'text-red-400',
  PENDING: 'text-yellow-400',
};

const PoliciesPage = () => {
  const navigate = useNavigate();
  const [policies, setPolicies]  = useState([]);
  const [vehicles, setVehicles]  = useState([]);
  const [loading, setLoading]    = useState(true);
  const [showAdd, setShowAdd]    = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editPolicyType, setEditPolicyType] = useState('BASIC');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({ defaultValues: { policyType: 'BASIC' } });
  const selectedPlan = PLAN_META[watch('policyType')] ? watch('policyType') : 'BASIC';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [polRes, vehRes] = await Promise.all([getMyPolicies(), getMyVehicles()]);
      setPolicies(polRes.data.data);
      setVehicles(vehRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      await createPolicy(data);
      toast.success('Policy created successfully');
      setShowAdd(false);
      reset();
      fetchData();
    } catch { toast.error('Failed to create policy'); }
  };

  const handleRenew = async (id) => {
    try {
      await renewPolicy(id);
      toast.success('Policy renewed for 1 year');
      fetchData();
    } catch { toast.error('Failed to renew policy'); }
  };

  const startEdit = (p) => {
    setEditingPolicy(p);
    setEditPolicyType(p.policyType);
    setEditStartDate(p.startDate);
    setEditEndDate(p.endDate);
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await updatePolicy(editingPolicy.id, { policyType: editPolicyType, startDate: editStartDate, endDate: editEndDate });
      toast.success('Policy updated successfully');
      setEditingPolicy(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update policy';
      toast.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeletePolicy = async () => {
    try {
      await deletePolicy(deleteId);
      toast.success('Policy deleted');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete policy';
      toast.error(msg);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Policies</h1>
          <p className="text-slate-500 text-sm mt-1">{policies.filter(p => p.status === 'ACTIVE').length} active policies</p>
        </div>
        <button id="buy-policy-btn" onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Buy Policy
        </button>
      </div>

      {/* Purchase Form */}
      {showAdd && (
        <div className="card animate-in border border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Purchase New Policy</h2>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Vehicle</label>
              <select {...register('vehicleId')} required className="input-field">
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNo} — {v.make} {v.model}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Policy Type</label>
              <select {...register('policyType')} required className="input-field">
                <option value="BASIC">Basic (Rs 500 / yr)</option>
                <option value="COMPREHENSIVE">Comprehensive (Rs 1,200 / yr)</option>
                <option value="THIRD_PARTY">Third Party (Rs 300 / yr)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Start Date</label>
              <input type="date" {...register('startDate')} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">End Date</label>
              <input type="date" {...register('endDate')} required className="input-field" />
            </div>
            <div className="sm:col-span-2 rounded-xl bg-slate-800/50 border border-slate-800 p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                {PLAN_META[selectedPlan].icon} {PLAN_META[selectedPlan].label} — {PLAN_META[selectedPlan].tagline}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PLAN_META[selectedPlan].benefits.map(b => (
                  <li key={b} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Shield className="w-4 h-4" />}
                Purchase Policy
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Policy Cards */}
      {policies.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No policies yet</p>
          <p className="text-slate-600 text-sm mt-1">Purchase a policy to protect your vehicle</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {policies.map(p => {
            const typeInfo = { ...policyTypeInfo[p.policyType], ...PLAN_META[p.policyType] };
            const StatusIcon = statusIcon[p.status] || Shield;
            const vehicle = vehicles.find(v => v.id === p.vehicleId);
            const daysLeft = daysUntil(p.endDate);
            const remaining = termRemainingPercent(p.startDate, p.endDate);
            const expiringSoon = p.status === 'ACTIVE' && daysLeft !== null && daysLeft <= 30;
            return (
              <div key={p.id} className="card card-hover flex flex-col">
                {/* Certificate header */}
                <div className={`-mx-6 -mt-6 px-6 py-4 rounded-t-2xl bg-gradient-to-r ${typeInfo.color || 'from-slate-700 to-slate-600'} mb-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Certificate of Insurance</span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-950/40 ${statusColor[p.status]}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {p.status}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg mt-2 flex items-center gap-2">
                    <span className="text-2xl">{typeInfo.icon}</span> {typeInfo.label} Cover
                  </p>
                  <p className="text-white/70 text-xs font-mono mt-0.5">{policyNumber(p.id)}</p>
                </div>

                {/* Insured vehicle */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <NumberPlate value={p.vehicleRegNo} size="sm" />
                  {vehicle && <span className="text-xs text-slate-400 truncate">{vehicle.make} {vehicle.model} · {vehicle.year}</span>}
                </div>

                {/* Coverage highlights */}
                <ul className="space-y-1.5 mb-4">
                  {typeInfo.benefits?.map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>

                {/* Term progress */}
                {p.status === 'ACTIVE' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-slate-500">Policy term</span>
                      <span className={expiringSoon ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${expiringSoon ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                        style={{ width: `${remaining}%` }}
                      />
                    </div>
                    {expiringSoon && <p className="text-[11px] text-amber-400 mt-1.5">Renewal due soon.</p>}
                  </div>
                )}

                <div className="flex-1 space-y-2.5 text-sm border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Annual premium</span>
                    <span className="font-semibold text-white">{formatCurrency(p.premiumAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Period of cover</span>
                    <span className="text-slate-300 text-xs">{formatDate(p.startDate)} – {formatDate(p.endDate)}</span>
                  </div>
                </div>

                {p.status === 'ACTIVE' && (
                  <button onClick={() => navigate('/payments')} className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-xs py-2">
                    <CreditCard className="w-3.5 h-3.5" /> Pay Premium
                  </button>
                )}

                {p.status === 'EXPIRED' && (
                  <button onClick={() => handleRenew(p.id)} className="btn-success w-full flex items-center justify-center gap-2 mt-4">
                    <RefreshCw className="w-4 h-4" /> Renew Policy
                  </button>
                )}

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-800">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Edit policy"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="card w-full max-w-lg animate-in border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Policy ({editingPolicy.vehicleRegNo})</h3>
              <button onClick={() => setEditingPolicy(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdatePolicy} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Policy Type</label>
                <select value={editPolicyType} onChange={(e) => setEditPolicyType(e.target.value)} required className="input-field">
                  <option value="BASIC">Basic (Rs 500 / yr)</option>
                  <option value="COMPREHENSIVE">Comprehensive (Rs 1,200 / yr)</option>
                  <option value="THIRD_PARTY">Third Party (Rs 300 / yr)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Start Date</label>
                <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">End Date</label>
                <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} required className="input-field" />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={editSubmitting} className="btn-primary flex items-center gap-2">
                  {editSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Edit3 className="w-4 h-4" />}
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingPolicy(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Policy"
        message="Are you sure you want to delete this policy? This cannot be undone. Policies that have already been paid for or have claims against them cannot be deleted."
        onConfirm={handleDeletePolicy}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default PoliciesPage;
