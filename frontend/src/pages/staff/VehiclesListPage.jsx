import React, { useEffect, useState } from 'react';
import { Search, Car, Hash, ShieldCheck, Gauge } from 'lucide-react';
import { getAllVehicles } from '../../api/vehicleApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const VehiclesListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicles();
      const list = res.data.data || [];
      setVehicles(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const t = e.target.value.toLowerCase();
    setSearchTerm(t);
    setFiltered(vehicles.filter(v => 
      (v.registrationNo && v.registrationNo.toLowerCase().includes(t)) || 
      (v.customerName && v.customerName.toLowerCase().includes(t)) ||
      (v.make && v.make.toLowerCase().includes(t)) ||
      (v.model && v.model.toLowerCase().includes(t)) ||
      (v.chassisNo && v.chassisNo.toLowerCase().includes(t))
    ));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Car className="w-6 h-6" />
            </span>
            Vehicle Fleet Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Master asset registry of all insured and registered automobiles across policyholders
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <Gauge className="w-4 h-4 text-blue-400" />
          <span>{vehicles.length} Vehicles Inspected</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-glass border border-slate-800 p-2 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Search by license plate, vehicle make, model, owner, or VIN chassis number..."
          className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(''); setFiltered(vehicles); }}
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
                <th className="table-header">License Plate</th>
                <th className="table-header">Make & Model</th>
                <th className="table-header">Model Year</th>
                <th className="table-header">Registered Owner</th>
                <th className="table-header">VIN / Chassis Number</th>
                <th className="table-header text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(v => (
                <tr key={v.id} className="table-row">
                  <td className="table-cell">
                    <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {v.registrationNo}
                    </span>
                  </td>
                  <td className="table-cell">
                    <p className="font-semibold text-white">{v.make} {v.model}</p>
                  </td>
                  <td className="table-cell text-sm text-slate-300">
                    {v.year}
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-slate-200">{v.customerName}</span>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-slate-400">
                      {v.chassisNo || '—'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="badge-green">Registered</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">
                    No vehicles found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehiclesListPage;
