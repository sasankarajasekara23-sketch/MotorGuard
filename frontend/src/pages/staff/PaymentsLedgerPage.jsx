import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  DollarSign, ArrowUpRight, ArrowDownLeft, Search, Filter, 
  Receipt, ShieldCheck, Download, CreditCard, Landmark, Wallet, CheckCircle2, X 
} from 'lucide-react';
import { getAllPayments } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/LoadingSpinner';

const methodIcons = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  ONLINE_BANKING: Landmark,
  BANK_TRANSFER: Wallet,
};

const PaymentsLedgerPage = () => {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await getAllPayments();
      const list = (res.data.data || []).sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setPayments(list);
      setFiltered(list);
    } catch (err) {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = payments;
    if (typeFilter !== 'ALL') {
      list = list.filter(p => p.paymentType === typeFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => 
        (p.transactionRef && p.transactionRef.toLowerCase().includes(term)) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        (p.paymentMethod && p.paymentMethod.toLowerCase().includes(term)) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }
    setFiltered(list);
  }, [typeFilter, searchTerm, payments]);

  if (loading) return <LoadingSpinner />;

  // Aggregates
  const totalPremiums = payments
    .filter(p => p.paymentType === 'PREMIUM_PAYMENT' && p.status === 'SUCCESSFUL')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const totalPayouts = payments
    .filter(p => p.paymentType === 'CLAIM_PAYOUT' && p.status === 'SUCCESSFUL')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const netCashflow = totalPremiums - totalPayouts;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20">
              <DollarSign className="w-6 h-6" />
            </span>
            Financial Ledger & Payment Simulation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global ledger of underwritten premium revenues and authorized claim settlement disbursements
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <ShieldCheck className="w-4 h-4 text-pink-400" />
          <span>{payments.length} Simulated Transactions</span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inflow (Premiums)</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-400 mt-4 tracking-tight">
            {formatCurrency(totalPremiums)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Collected from customer policy orders</p>
        </div>

        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Outflow (Claim Payouts)</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-4 tracking-tight">
            {formatCurrency(totalPayouts)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Disbursed for approved damage claims</p>
        </div>

        <div className="card-glass border border-slate-800 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Treasury Balance</span>
            <div className={`p-2.5 rounded-xl ${netCashflow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold mt-4 tracking-tight ${netCashflow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(netCashflow)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Operating underwriting surplus</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="card-glass border border-slate-800 p-1.5 flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
          <input 
            type="text" 
            placeholder="Search by ref #, customer, method, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-xs focus:outline-none py-1.5"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded mr-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 self-stretch sm:self-auto justify-center">
          {['ALL', 'PREMIUM_PAYMENT', 'CLAIM_PAYOUT'].map(tab => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Transactions' : tab === 'PREMIUM_PAYMENT' ? 'Premiums' : 'Claim Payouts'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Transaction Ref</th>
                <th className="table-header">Type</th>
                <th className="table-header">Customer / Subject</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Method</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(p => {
                const isPremium = p.paymentType === 'PREMIUM_PAYMENT';
                const MethodIcon = methodIcons[p.paymentMethod] || CreditCard;
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        {p.transactionRef}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPremium 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isPremium ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {isPremium ? 'Premium' : 'Claim Payout'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="font-semibold text-white text-xs">{p.customerName || 'Direct Customer'}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.notes || 'Automated entry'}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`font-mono text-xs font-bold ${isPremium ? 'text-white' : 'text-emerald-400'}`}>
                        {formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MethodIcon className="w-3.5 h-3.5 text-slate-500" />
                        {p.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-slate-400">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="table-cell">
                      <span className="badge-green">{p.status}</span>
                    </td>
                    <td className="table-cell text-right">
                      <button 
                        onClick={() => setSelectedReceipt(p)}
                        className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 hover:text-blue-400"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">
                    No transactions matched the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in">
          <div className="card-glass border border-slate-700 max-w-md w-full p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Transaction Audit Record</h3>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Transaction Ref</span>
                <span className="font-mono font-bold text-white">{selectedReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Type</span>
                <span className="font-semibold text-slate-200">{selectedReceipt.paymentType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Amount</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Method</span>
                <span className="text-slate-200">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Customer Name</span>
                <span className="text-slate-200">{selectedReceipt.customerName || 'N/A'}</span>
              </div>
              {selectedReceipt.policyId && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Associated Policy ID</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{selectedReceipt.policyId}</span>
                </div>
              )}
              {selectedReceipt.claimId && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Associated Claim ID</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{selectedReceipt.claimId}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Processed By</span>
                <span className="text-slate-300">{selectedReceipt.processedByUserName || 'System Automated'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-slate-300">{formatDate(selectedReceipt.paymentDate)}</span>
              </div>
              {selectedReceipt.notes && (
                <div className="py-1.5">
                  <span className="text-slate-400 block mb-1">Transaction Notes</span>
                  <p className="text-slate-300 p-2 bg-slate-900 rounded-lg text-[11px] leading-relaxed">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsLedgerPage;
