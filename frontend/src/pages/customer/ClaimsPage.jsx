import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Eye, X, FileText, AlertCircle, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { getMyClaims, submitClaim, updateClaim, deleteClaim } from '../../api/claimApi';
import { getMyPolicies } from '../../api/policyApi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { INCIDENT_TYPES, withTag, splitTag } from '../../utils/insurance';
import NumberPlate from '../../components/NumberPlate';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const INCIDENT_KEYS = INCIDENT_TYPES.map(t => t.key);
const incidentIcon = (tag) => INCIDENT_TYPES.find(t => t.key === tag)?.icon;

const statusConfig = {
  SUBMITTED:    { label: 'Submitted',    css: 'badge-blue' },
  UNDER_REVIEW: { label: 'Under Review', css: 'badge-yellow' },
  APPROVED:     { label: 'Approved',     css: 'badge-green' },
  REJECTED:     { label: 'Rejected',     css: 'badge-red' },
  PAID:         { label: 'Paid',         css: 'badge-purple' },
};

const ClaimTimeline = ({ status }) => {
  const rejected = status === 'REJECTED';
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'DECISION', label: rejected ? 'Rejected' : 'Approved' },
    { key: 'PAID', label: 'Paid' },
  ];
  const reached = { SUBMITTED: 0, UNDER_REVIEW: 1, APPROVED: 2, REJECTED: 2, PAID: 3 }[status] ?? 0;

  return (
    <div className="flex items-start justify-between py-4">
      {steps.map((s, i) => {
        const done = i <= reached;
        const failed = rejected && i === 2;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-2 w-16 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                failed ? 'bg-red-500/20 border-red-500 text-red-400'
                  : done ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}>
                {failed ? '✕' : done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${failed ? 'text-red-400' : done ? 'text-slate-200' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 rounded ${i < reached ? 'bg-blue-500' : 'bg-slate-800'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ClaimsPage = () => {
  const [claims, setClaims]       = useState([]);
  const [policies, setPolicies]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [editingClaim, setEditingClaim] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [incidentType, setIncidentType] = useState('Accident');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [claimRes, polRes] = await Promise.all([getMyClaims(), getMyPolicies()]);
      setClaims(claimRes.data.data);
      setPolicies(polRes.data.data.filter(p => p.status === 'ACTIVE'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    try {
      await submitClaim({ ...data, description: withTag(incidentType, data.description) });
      toast.success('Claim submitted successfully');
      setShowAdd(false);
      setIncidentType('Accident');
      reset();
      fetchData();
    } catch { toast.error('Failed to submit claim'); }
  };

  const startEdit = (claim) => {
    setEditingClaim(claim);
    setEditAmount(claim.amount);
    setEditDescription(claim.description);
  };

  const handleUpdateClaim = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await updateClaim(editingClaim.id, { amount: editAmount, description: editDescription });
      toast.success('Claim updated successfully');
      setEditingClaim(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update claim';
      toast.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteClaim = async () => {
    try {
      await deleteClaim(deleteId);
      toast.success('Claim withdrawn');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete claim';
      toast.error(msg);
    }
  };

  const deletingClaim = claims.find(c => c.id === deleteId);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Claims</h1>
          <p className="text-slate-500 text-sm mt-1">{claims.length} claim{claims.length !== 1 ? 's' : ''} filed</p>
        </div>
        <button id="file-claim-btn" onClick={() => setShowAdd(!showAdd)} className="btn-danger flex items-center gap-2">
          <Plus className="w-4 h-4" /> File a Claim
        </button>
      </div>

      {/* Claim Form */}
      {showAdd && (
        <div className="card animate-in border border-red-500/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">File New Claim</h2>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          {policies.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">You have no active policies to claim against. Purchase a policy first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Active Policy</label>
                  <select {...register('policyId')} required className="input-field">
                    <option value="">Select policy</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.vehicleRegNo} — {p.policyType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Claim Amount (Rs)</label>
                  <input type="number" step="0.01" min="0" {...register('amount')} required placeholder="e.g. 5000.00" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">What happened?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCIDENT_TYPES.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setIncidentType(t.key)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        incidentType === t.key
                          ? 'border-red-500/60 bg-red-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span>
                        <span className={`block text-xs font-semibold ${incidentType === t.key ? 'text-white' : 'text-slate-300'}`}>{t.key}</span>
                        <span className="block text-[10px] text-slate-500">{t.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description of Incident</label>
                <textarea {...register('description')} required rows={4} placeholder="When and where did it happen? Who was involved? What was damaged?" className="input-field resize-none" />
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-400 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-slate-200">Tip:</span> report accidents and theft to the police, take photos of the damage and the scene,
                  then upload them in <span className="text-blue-400">Documents</span> so the claims team can assess your claim faster.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={isSubmitting} className="btn-danger flex items-center gap-2">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <FileText className="w-4 h-4" />}
                  Submit Claim
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Claims Table */}
      <div className="card p-0 overflow-hidden">
        {claims.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No claims filed</p>
            <p className="text-slate-600 text-sm mt-1">File a claim when you need to report an incident</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => {
                  const sc = statusConfig[c.status] || { label: c.status, css: 'badge-gray' };
                  const { tag } = splitTag(c.description, INCIDENT_KEYS);
                  return (
                    <tr key={c.id} className="table-row">
                      <td className="table-cell">
                        <NumberPlate value={c.vehicleRegNo} size="sm" />
                        {tag && <p className="text-[11px] text-slate-400 mt-1.5">{incidentIcon(tag)} {tag}</p>}
                      </td>
                      <td className="table-cell">{formatDate(c.submittedDate)}</td>
                      <td className="table-cell">{formatCurrency(c.amount)}</td>
                      <td className="table-cell"><span className={sc.css}>{sc.label}</span></td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedClaim(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status !== 'PAID' && (
                            <>
                              <button onClick={() => startEdit(c)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                title="Edit claim">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteId(c.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Withdraw claim">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Claim Details</h3>
              <button onClick={() => setSelectedClaim(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <ClaimTimeline status={selectedClaim.status} />
            <div className="space-y-3 text-sm">
              {[
                ['Vehicle', selectedClaim.vehicleRegNo],
                ['Policy Type', selectedClaim.policyType],
                ['Amount', formatCurrency(selectedClaim.amount)],
                ['Submitted', formatDate(selectedClaim.submittedDate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500">Status</span>
                <span className={(statusConfig[selectedClaim.status] || {}).css || 'badge-gray'}>
                  {(statusConfig[selectedClaim.status] || {}).label || selectedClaim.status}
                </span>
              </div>
              {(() => {
                const { tag, body } = splitTag(selectedClaim.description, INCIDENT_KEYS);
                return (
                  <>
                    {tag && (
                      <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-500">Incident type</span>
                        <span className="text-slate-200 font-medium">{incidentIcon(tag)} {tag}</span>
                      </div>
                    )}
                    <div className="py-2">
                      <p className="text-slate-500 mb-2">Description</p>
                      <p className="text-slate-300 text-sm p-3 bg-slate-800/60 rounded-xl whitespace-pre-wrap leading-relaxed">{body}</p>
                    </div>
                  </>
                );
              })()}
              {selectedClaim.reviewerNotes && (
                <div className="py-2">
                  <p className="text-slate-500 mb-2">Reviewer Notes</p>
                  <p className="text-blue-300 text-sm p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl whitespace-pre-wrap leading-relaxed">{selectedClaim.reviewerNotes}</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setSelectedClaim(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Claim</h3>
              <button onClick={() => setEditingClaim(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>

            {editingClaim.status !== 'SUBMITTED' && (
              <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">This claim has already been reviewed by staff (status: {editingClaim.status.replace('_', ' ')}). Editing it now may affect the ongoing review.</p>
              </div>
            )}

            <form onSubmit={handleUpdateClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Claim Amount (Rs)</label>
                <input type="number" step="0.01" min="0" value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description of Incident</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                  required rows={4} className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={editSubmitting} className="btn-primary flex items-center gap-2">
                  {editSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Edit3 className="w-4 h-4" />}
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingClaim(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Withdraw Claim"
        message={
          deletingClaim && deletingClaim.status !== 'SUBMITTED'
            ? `This claim has already been reviewed by staff (status: ${deletingClaim.status.replace('_', ' ')}). Are you sure you want to withdraw it?`
            : 'Are you sure you want to withdraw this claim? This cannot be undone.'
        }
        onConfirm={handleDeleteClaim}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ClaimsPage;
