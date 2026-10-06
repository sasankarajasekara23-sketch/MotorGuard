import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { User, Mail, CreditCard, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../../api/customerApi';
import { useAuth } from '../../auth/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  nationalId: yup.string().required('National ID is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain digits only')
    .max(10, 'Phone number must not exceed 10 digits')
    .min(7, 'Phone number must be at least 7 digits'),
  address: yup.string().required('Address is required'),
}).required();

// Extracts a specific field-level validation message from the backend's
// { message, data: { field: reason } } error shape when present.
const extractErrorMessage = (err, fallback) => {
  const fieldErrors = err.response?.data?.data;
  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstMessage = Object.values(fieldErrors)[0];
    if (firstMessage) return firstMessage;
  }
  return err.response?.data?.message || fallback;
};

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });
  const [profileData, setProfileData] = useState(null);
  const { role, login } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfileData(res.data.data);
      reset(res.data.data);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateMyProfile({
        name: data.name,
        email: data.email,
        nationalId: data.nationalId,
        phone: data.phone,
        address: data.address,
      });
      const { customer, token } = res.data.data;
      // Email doubles as the login identifier, so refresh the stored
      // session with the reissued token whenever profile fields change.
      login(token, { name: customer.name, email: customer.email, role });
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header Banner Card */}
      <div className="card-glass border border-slate-800 p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 border-2 border-blue-400/40">
            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-500 text-white shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{profileData?.name}</h1>
            <span className="badge-green self-center md:self-auto">Verified Account</span>
          </div>
          <p className="text-sm text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" /> {profileData?.email}
          </p>
          <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" /> National ID: <span className="font-mono text-slate-400">{profileData?.nationalId}</span>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card border border-slate-800 p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Personal & Contact Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" /> Full Name
              </label>
              <input
                {...register("name")}
                className="input-field focus:border-blue-500"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="input-field focus:border-blue-500"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" /> National ID / Passport
              </label>
              <input
                {...register("nationalId")}
                className="input-field focus:border-blue-500"
              />
              {errors.nationalId && <p className="text-red-400 text-xs mt-1.5">{errors.nationalId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone Number
              </label>
              <input
                {...register("phone")}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="0771234567"
                className="input-field focus:border-blue-500"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Residential Address
              </label>
              <textarea
                {...register("address")}
                rows="3"
                placeholder="Enter complete street address, city, and zip code..."
                className="input-field focus:border-blue-500 leading-relaxed"
              ></textarea>
              {errors.address && <p className="text-red-400 text-xs mt-1.5">{errors.address.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
