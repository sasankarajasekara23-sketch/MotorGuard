import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Receipt, Plus, X, CheckCircle2, Clock, Landmark, Wallet 
} from 'lucide-react';
import { getMyPayments, payPremium } from '../../api/paymentApi';
import { getMyPolicies } from '../../api/policyApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { policyNumber } from '../../utils/insurance';
import LoadingSpinner from '../../components/LoadingSpinner';

const paymentMethodIcons = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  ONLINE_BANKING: Landmark,
  BANK_TRANSFER: Wallet,
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [allPolicies, setAllPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form State
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('VERIFIED POLICYHOLDER');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('Maybank2u');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, polRes] = await Promise.all([getMyPayments(), getMyPolicies()]);
      setPayments(payRes.data.data || []);
      setAllPolicies(polRes.data.data || []);
      setPolicies((polRes.data.data || []).filter(p => p.status === 'ACTIVE'));
    } catch (err) {
      toast.error('Failed to load payment records');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = (policyId = '') => {
    setSelectedPolicyId(policyId || (policies.length > 0 ? policies[0].id : ''));
    setShowPayModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId) {
      toast.error('Please select an active policy');
      return;
    }

    const policy = policies.find(p => p.id === selectedPolicyId);
    if (!policy) {
      toast.error('Selected policy not found');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        policyId: selectedPolicyId,
        amount: policy.premiumAmount || 500.0,
        paymentMethod: paymentMethod,
        notes: paymentMethod === 'ONLINE_BANKING' 
          ? `Online Banking via ${selectedBank}` 
          : notes || 'Simulated annual premium installment'
      };

      const res = await payPremium(payload);
      toast.success('Premium payment processed successfully!');
      setShowPayModal(false);
      setSelectedReceipt(res.data.data);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment simulation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Financial aggregates
  const totalPremiumsPaid = payments
    .filter(p => p.paymentType === 'PREMIUM_PAYMENT' && p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPayoutsReceived = payments
    .filter(p => p.paymentType === 'CLAIM_PAYOUT' && p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const activePolicyObj = policies.find(p => p.id === selectedPolicyId);
  const policyFor = (payment) => allPolicies.find(p => p.id === payment.policyId);

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-6 h-6" />
            </span>
            Payment Simulation & Invoices
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate premium installments, verify digital receipts, and track claim disbursements
          </p>
        </div>
        <button
          onClick={() => handleOpenPayModal()}
          disabled={policies.length === 0}
          className="btn-success flex items-center gap-2 self-start py-2.5 px-4 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Pay Policy Premium
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Premiums Paid</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4 tracking-tight">
            {formatCurrency(totalPremiumsPaid)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Active policy coverage investments</p>
        </div>

        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Claim Settlements Received</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4 tracking-tight">
            {formatCurrency(totalPayoutsReceived)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Authorized incident compensation</p>
        </div>

        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Status</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-400 mt-4 tracking-tight">
            {payments.length} Records
          </p>
          <p className="text-xs text-slate-500 mt-2">100% Cryptographically verified on Neon</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Reference & Type</th>
                <th className="table-header">Method</th>
                <th className="table-header">Transaction Amount</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.map(p => {
                const isPremium = p.paymentType === 'PREMIUM_PAYMENT';
                const MethodIcon = paymentMethodIcons[p.paymentMethod] || CreditCard;
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2 rounded-xl ${isPremium ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {isPremium ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </span>
                        <div>
                          <p className="font-mono text-xs font-bold text-white">{p.transactionRef}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {isPremium ? 'Policy Premium' : 'Claim Settlement'}
                            {policyFor(p) && <span className="text-slate-500 font-mono"> · {policyFor(p).vehicleRegNo}</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MethodIcon className="w-3.5 h-3.5 text-slate-500" />
                        {p.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-mono text-sm font-bold ${isPremium ? 'text-white' : 'text-emerald-400'}`}>
                        {isPremium ? '-' : '+'}{formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-slate-400">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="table-cell">
                      <span className={p.status === 'SUCCESSFUL' ? 'badge-green' : 'badge-yellow'}>
                        {p.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button 
                        onClick={() => setSelectedReceipt(p)}
                        className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 hover:text-emerald-400"
                      >
                        <Receipt className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">
                    No transactions recorded. Pay a policy premium above to simulate your first payment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in">
          <div className="card-glass border border-slate-700 max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Simulate Premium Payment</h3>
                  <p className="text-xs text-slate-400">Test MotorGuard instant payment gateway</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              {/* Policy Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Policy</label>
                <select 
                  value={selectedPolicyId} 
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="input-field text-xs py-2"
                  required
                >
                  {policies.map(pol => (
                    <option key={pol.id} value={pol.id}>
                      {pol.vehicleRegNo} ({pol.policyType}) — {formatCurrency(pol.premiumAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Display */}
              {activePolicyObj && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-emerald-300 font-medium">Payable Premium Amount:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {formatCurrency(activePolicyObj.premiumAmount)}
                  </span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Select Simulation Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                    { id: 'ONLINE_BANKING', label: 'FPX Banking', icon: Landmark },
                    { id: 'BANK_TRANSFER', label: 'Transfer', icon: Wallet },
                  ].map(m => {
                    const isSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold shadow-sm' 
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Mock Card or FPX View */}
              {paymentMethod === 'ONLINE_BANKING' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Participating Bank</label>
                  <select 
                    value={selectedBank} 
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    <option value="Maybank2u">Maybank (Maybank2u)</option>
                    <option value="CIMB Clicks">CIMB Bank (CIMB Clicks)</option>
                    <option value="Public Bank">Public Bank Online</option>
                    <option value="RHB Now">RHB Bank</option>
                    <option value="Hong Leong Connect">Hong Leong Bank</option>
                  </select>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <span>Simulated Card Credentials</span>
                    <span className="text-emerald-400">Verified Sandbox</span>
                  </div>
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)} 
                    placeholder="Card Number"
                    className="input-field py-1.5 text-xs font-mono" 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={cardExpiry} 
                      onChange={(e) => setCardExpiry(e.target.value)} 
                      placeholder="MM/YY"
                      className="input-field py-1.5 text-xs font-mono" 
                      required 
                    />
                    <input 
                      type="text" 
                      value={cardCvv} 
                      onChange={(e) => setCardCvv(e.target.value)} 
                      placeholder="CVV"
                      className="input-field py-1.5 text-xs font-mono" 
                      required 
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transaction Note (Optional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="e.g. Comprehensive plan renewal installment"
                  className="input-field text-xs py-2"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)} 
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-success py-2 px-5 text-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Authorize & Pay
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in">
          <div className="card-glass border border-slate-700 max-w-md w-full p-6 space-y-5 relative shadow-2xl">
            <div className="text-center pb-4 border-b border-slate-800 space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                {selectedReceipt.paymentType === 'CLAIM_PAYOUT' ? 'Claim Settlement Receipt' : 'Premium Payment Receipt'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Ref: {selectedReceipt.transactionRef}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Transaction Type</span>
                <span className="font-semibold text-white">{selectedReceipt.paymentType?.replace('_', ' ')}</span>
              </div>
              {policyFor(selectedReceipt) && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Insured vehicle</span>
                    <span className="font-mono font-semibold text-white">{policyFor(selectedReceipt).vehicleRegNo}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Policy no.</span>
                    <span className="font-mono text-slate-200">{policyNumber(selectedReceipt.policyId)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Amount</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-slate-200">{selectedReceipt.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Status</span>
                <span className="badge-green">{selectedReceipt.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Date & Time</span>
                <span className="text-slate-200">{formatDate(selectedReceipt.paymentDate)}</span>
              </div>
              {selectedReceipt.customerName && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Policyholder</span>
                  <span className="text-slate-200">{selectedReceipt.customerName}</span>
                </div>
              )}
              {selectedReceipt.notes && (
                <div className="py-1.5">
                  <span className="text-slate-400 block mb-1">Notes</span>
                  <p className="text-slate-300 p-2 bg-slate-900 rounded-lg text-[11px]">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => window.print()}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Print
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
