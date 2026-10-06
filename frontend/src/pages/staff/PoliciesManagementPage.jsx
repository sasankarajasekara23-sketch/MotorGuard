import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Search, Shield, Plus, X, Edit3, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { getAllPolicies, createPolicy, updatePolicy, deletePolicy, renewPolicy } from '../../api/policyApi';
import { getAllVehicles } from '../../api/vehicleApi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const statusConfig = {
  ACTIVE:  { css: 'badge-green',  icon: CheckCircle2 },
  EXPIRED: { css: 'badge-red',    icon: XCircle },
  PENDING: { css: 'badge-yellow', icon: Clock },
};

const PoliciesManagementPage = () => {
  const [policies, setPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editPolicyType, setEditPolicyType] = useState('BASIC');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [polRes, vehRes] = await Promise.all([getAllPolicies(), getAllVehicles()]);
      const list = polRes.data.data || [];
      setPolicies(list);
      setFiltered(list);
      setVehicles(vehRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(policies.filter(p =>
      (p.vehicleRegNo && p.vehicleRegNo.toLowerCase().includes(term)) ||
      (p.policyType && p.policyType.toLowerCase().includes(term)) ||
      (p.status && p.status.toLowerCase().includes(term))
    ));
  };

  const onCreate = async (data) => {
    try {
      await createPolicy(data);
      toast.success('Policy created successfully');
      setShowAdd(false);
      reset();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create policy';
      toast.error(msg);
    }
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

  const handleRenew = async (id) => {
    try {
      await renewPolicy(id);
      toast.success('Policy renewed for 1 year');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to renew policy';
      toast.error(msg);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </span>
            Policy Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, and manage insurance policies across every customer vehicle
          </p>
        </div>
        <button
          id="staff-create-policy-btn"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      {/* Create Form */}
      {showAdd && (
        <div className="card animate-in border border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Create New Policy</h2>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Vehicle</label>
              <select {...register('vehicleId')} required className="input-field">
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNo} — {v.make} {v.model} ({v.customerName})
                  </option>
                ))}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Start Date</label>
                <input type="date" {...register('startDate')} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">End Date</label>
                <input type="date" {...register('endDate')} required className="input-field" />
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Shield className="w-4 h-4" />}
                Create Policy
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card-glass border border-slate-800 p-2 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          placeholder="Search by registration number, policy type, or status..."
          className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setFiltered(policies); }}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg mr-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Policy Type</th>
                <th className="table-header">Premium</th>
                <th className="table-header">Start</th>
                <th className="table-header">Expires</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(p => {
                const sc = statusConfig[p.status] || { css: 'badge-gray', icon: Shield };
                const StatusIcon = sc.icon;
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-semibold text-white">{p.vehicleRegNo}</td>
                    <td className="table-cell">{p.policyType?.replace('_', ' ')}</td>
                    <td className="table-cell font-mono">{formatCurrency(p.premiumAmount)}</td>
                    <td className="table-cell text-xs text-slate-400">{formatDate(p.startDate)}</td>
                    <td className="table-cell text-xs text-slate-400">{formatDate(p.endDate)}</td>
                    <td className="table-cell">
                      <span className={`${sc.css} inline-flex items-center gap-1`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {p.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'EXPIRED' && (
                          <button onClick={() => handleRenew(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Renew policy">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => startEdit(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Edit policy">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete policy">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 text-sm">
                    No policies found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default PoliciesManagementPage;
