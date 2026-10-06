import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, Users, Mail, Phone, CreditCard, UserCheck, Eye, Edit3, X, Save, MapPin, Shield } from 'lucide-react';
import { getAllCustomers, getCustomerById, updateCustomerById } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomerSearchPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Customer Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers();
      const list = res.data.data || [];
      setCustomers(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(term)) || 
      (c.email && c.email.toLowerCase().includes(term)) || 
      (c.nationalId && c.nationalId.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term))
    ));
  };

  const handleInspect = async (id) => {
    setModalLoading(true);
    setIsEditing(false);
    try {
      const res = await getCustomerById(id);
      const cust = res.data.data;
      setSelectedCustomer(cust);
      setEditName(cust.name || '');
      setEditEmail(cust.email || '');
      setEditNationalId(cust.nationalId || '');
      setEditPhone(cust.phone || '');
      setEditAddress(cust.address || '');
    } catch (err) {
      toast.error('Failed to load customer details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{7,10}$/.test(editPhone)) {
      toast.error('Phone number must be 7-10 digits, numbers only');
      return;
    }
    setSaving(true);
    try {
      const res = await updateCustomerById(selectedCustomer.id, {
        name: editName,
        email: editEmail,
        nationalId: editNationalId,
        phone: editPhone,
        address: editAddress,
      });
      toast.success('Customer details updated successfully');
      setSelectedCustomer(res.data.data);
      setIsEditing(false);
      fetchCustomers();
    } catch (err) {
      const fieldErrors = err.response?.data?.data;
      const msg = (fieldErrors && typeof fieldErrors === 'object' && Object.values(fieldErrors)[0])
        || err.response?.data?.message
        || 'Failed to update customer';
      toast.error(msg);
    } finally {
      setSaving(false);
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
              <Users className="w-6 h-6" />
            </span>
            Policyholder Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search, inspect, and verify customer identities across all regional branches
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>{customers.length} Registered Accounts</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="card-glass border border-slate-800 p-2 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Filter by customer name, email address, National ID, or contact number..."
          className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(''); setFiltered(customers); }}
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
                <th className="table-header">Policyholder</th>
                <th className="table-header">Contact Email</th>
                <th className="table-header">National Identification</th>
                <th className="table-header">Phone Number</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.address || 'Address on file'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {c.email}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                      {c.nationalId}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {c.phone || 'N/A'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="badge-green">Active</span>
                  </td>
                  <td className="table-cell text-right">
                    <button 
                      onClick={() => handleInspect(c.id)}
                      className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 hover:text-blue-400"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect / Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">
                    No customers match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in">
          <div className="card-glass border border-slate-700 max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-md">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">National ID / Passport</label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0771234567"
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">Address</label>
                  <textarea 
                    value={editAddress} 
                    onChange={(e) => setEditAddress(e.target.value)} 
                    rows="3" 
                    placeholder="Full residential / business address..."
                    className="input-field py-2 text-xs" 
                    required 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block mb-0.5">National ID</span>
                    <span className="font-mono font-semibold text-blue-400">{selectedCustomer.nationalId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Account Status</span>
                    <span className="badge-green">Verified</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Phone</span>
                    <span className="text-slate-200 font-medium">{selectedCustomer.phone || 'Not recorded'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Account ID</span>
                    <span className="font-mono text-slate-400 text-[10px] truncate block">{selectedCustomer.id}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Residential Address</span>
                  <p className="text-slate-200 leading-relaxed">{selectedCustomer.address || 'No address provided on record.'}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Information
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedCustomer(null)}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSearchPage;
