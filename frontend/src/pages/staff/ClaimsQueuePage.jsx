import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  ClipboardList, CheckCircle2, XCircle, DollarSign, 
  Clock, Eye, MessageSquare, AlertTriangle, ShieldAlert 
} from 'lucide-react';
import { getAllClaims, reviewClaim, decideClaim, payClaim } from '../../api/claimApi';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../auth/AuthContext';

const ClaimsQueuePage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SUBMITTED');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await getAllClaims();
      setClaims(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load claims queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      await reviewClaim(id);
      toast.success('Claim moved to Under Review');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDecision = async (approved) => {
    setActionLoading(true);
    try {
      await decideClaim(selectedClaim.id, { approved, notes });
      toast.success(approved ? 'Claim has been Approved' : 'Claim has been Rejected');
      setSelectedClaim(null);
      setNotes('');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to save decision');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await payClaim(id);
      toast.success('Claim payment executed successfully');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to process payment');
    }
  };

  const tabs = [
    { key: 'SUBMITTED', label: 'Submitted', color: 'blue' },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: 'yellow' },
    { key: 'APPROVED', label: 'Approved', color: 'green' },
    { key: 'REJECTED', label: 'Rejected', color: 'red' },
    { key: 'PAID', label: 'Paid', color: 'purple' },
  ];

  const filteredClaims = claims.filter(c => c.status === activeTab);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
              <ClipboardList className="w-6 h-6" />
            </span>
            Claims Adjudication Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review incidents, assess liabilities, and authorize disbursements
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{claims.length} Total Incident{claims.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Modern Status Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        {tabs.map(tab => {
          const count = claims.filter(c => c.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Claims Table Card */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Claimant</th>
                <th className="table-header">Vehicle & Policy</th>
                <th className="table-header">Claim Amount</th>
                <th className="table-header">Incident Date</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredClaims.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell">
                    <p className="font-semibold text-white">{c.submittedBy}</p>
                    <p className="text-xs text-slate-500">ID: #{c.id}</p>
                  </td>
                  <td className="table-cell">
                    <p className="font-mono text-xs font-bold text-blue-400">{c.vehicleRegNo}</p>
                    <p className="text-xs text-slate-400">{c.policyType?.replace('_', ' ')}</p>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(c.amount)}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-slate-400">
                    {formatDate(c.submittedDate)}
                  </td>
                  <td className="table-cell text-right">
                    {activeTab === 'SUBMITTED' && role === 'CLAIMS_OFFICER' && (
                      <button 
                        onClick={() => handleReview(c.id)} 
                        className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Start Review
                      </button>
                    )}
                    {activeTab === 'UNDER_REVIEW' && role === 'CLAIMS_OFFICER' && (
                      <button 
                        onClick={() => { setSelectedClaim(c); setNotes(''); }} 
                        className="btn-primary bg-gradient-to-r from-amber-600 to-yellow-600 py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Adjudicate
                      </button>
                    )}
                    {activeTab === 'APPROVED' && (role === 'CLAIMS_OFFICER' || role === 'FINANCE_EXECUTIVE') && (
                      <button 
                        onClick={() => handlePay(c.id)} 
                        className="btn-success py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Execute Payment
                      </button>
                    )}
                    {activeTab === 'REJECTED' && (
                      <span className="badge-red">Rejected</span>
                    )}
                    {activeTab === 'PAID' && (
                      <span className="badge-green">Disbursed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">
                    No claims found under {activeTab.replace('_', ' ').toLowerCase()} status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjudication Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in">
          <div className="card-glass border border-slate-700 max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Adjudicate Claim #{selectedClaim.id}
              </h3>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {formatCurrency(selectedClaim.amount)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <p><strong className="text-slate-400">Claimant:</strong> {selectedClaim.submittedBy}</p>
              <p><strong className="text-slate-400">Vehicle:</strong> {selectedClaim.vehicleRegNo} ({selectedClaim.policyType})</p>
              <p className="pt-1.5 border-t border-slate-800/80 text-slate-300 leading-relaxed">
                <strong className="text-slate-400">Incident Statement:</strong><br />
                {selectedClaim.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Assessor Notes & Rationale
              </label>
              <textarea 
                className="input-field" 
                rows="4" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain the coverage determination, assessment calculations, or policy exclusion reasons..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                disabled={actionLoading}
                onClick={() => setSelectedClaim(null)} 
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={actionLoading}
                onClick={() => handleDecision(false)} 
                className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Claim
              </button>
              <button 
                type="button" 
                disabled={actionLoading}
                onClick={() => handleDecision(true)} 
                className="btn-success text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsQueuePage;
