import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Car, X, ShieldCheck, ShieldAlert, Hash } from 'lucide-react';
import { getMyVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../api/vehicleApi';
import { getMyPolicies } from '../../api/policyApi';
import { PLAN_META, daysUntil, vehicleAge } from '../../utils/insurance';
import NumberPlate from '../../components/NumberPlate';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const VehiclesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getMyVehicles();
      setVehicles(res.data.data || []);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
    // Cover status is a nice-to-have; the vehicle list must work without it.
    try {
      const polRes = await getMyPolicies();
      setPolicies(polRes.data.data || []);
    } catch { setPolicies([]); }
  };

  const onSubmit = async (data) => {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data);
        toast.success('Vehicle updated successfully');
        setEditingVehicle(null);
      } else {
        await addVehicle(data);
        toast.success('Vehicle added successfully');
        setShowAdd(false);
      }
      reset();
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.message || (editingVehicle ? 'Failed to update vehicle' : 'Failed to add vehicle');
      toast.error(msg);
    }
  };

  const startEdit = (v) => {
    setEditingVehicle(v);
    setShowAdd(true);
    setValue('registrationNo', v.registrationNo);
    setValue('make', v.make);
    setValue('model', v.model);
    setValue('year', v.year);
    setValue('chassisNo', v.chassisNo);
  };

  const handleCancelForm = () => {
    setShowAdd(false);
    setEditingVehicle(null);
    reset();
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(deleteId);
      toast.success('Vehicle removed');
      setDeleteId(null);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete vehicle';
      toast.error(msg);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Vehicles</h1>
          <p className="text-slate-500 text-sm mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button 
          id="add-vehicle-btn" 
          onClick={() => {
            if (showAdd && !editingVehicle) {
              handleCancelForm();
            } else {
              setEditingVehicle(null);
              reset({ registrationNo: '', make: '', model: '', year: '', chassisNo: '' });
              setShowAdd(true);
            }
          }} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <div className="card animate-in border border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">
              {editingVehicle ? `Edit Vehicle (${editingVehicle.registrationNo})` : 'Register New Vehicle'}
            </h2>
            <button onClick={handleCancelForm} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Registration No.</label>
              <input {...register('registrationNo')} required placeholder="e.g. WXY-1234" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Make</label>
              <input {...register('make')} required placeholder="e.g. Toyota" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Model</label>
              <input {...register('model')} required placeholder="e.g. Camry" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Year</label>
              <input type="number" {...register('year')} required placeholder="e.g. 2021" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Chassis No.</label>
              <input {...register('chassisNo')} required placeholder="e.g. JT2BF22K1W0123456" className="input-field" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  editingVehicle ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                )}
                {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
              </button>
              <button type="button" onClick={handleCancelForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Cards */}
      {vehicles.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No vehicles registered</p>
          <p className="text-slate-600 text-sm mt-1">Add your first vehicle to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map(v => {
            const cover = policies.find(p => p.vehicleId === v.id && p.status === 'ACTIVE');
            const daysLeft = cover ? daysUntil(cover.endDate) : null;
            const age = vehicleAge(v.year);
            return (
            <div key={v.id} className="card card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => startEdit(v)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Edit vehicle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <NumberPlate value={v.registrationNo} />
              <p className="text-white font-semibold mt-3">{v.make} {v.model}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">{v.year}</span>
                {age && <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">{age}</span>}
              </div>
              <p className="text-slate-500 text-xs mt-3 font-mono flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> Chassis {v.chassisNo}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800">
                {cover ? (
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><ShieldCheck className="w-4 h-4" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-400">Insured · {PLAN_META[cover.policyType]?.label || cover.policyType}</p>
                      <p className="text-xs text-slate-500">
                        {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} of cover left` : 'Cover ends today'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><ShieldAlert className="w-4 h-4" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-400">Not insured</p>
                      <Link to="/policies" className="text-xs text-blue-400 hover:text-blue-300">Get a policy →</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle? All associated policies may be affected."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default VehiclesPage;
