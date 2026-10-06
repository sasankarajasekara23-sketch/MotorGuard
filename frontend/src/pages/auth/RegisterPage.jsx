import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { register as registerApi } from '../../api/authApi';
import { useAuth } from '../../auth/AuthContext';
import DrivingScene from '../../components/DrivingScene';
import {
  Shield, User, Mail, Lock, Phone, MapPin,
  CreditCard, ChevronDown, ArrowRight, Eye, EyeOff, Car, CheckCircle2
} from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Required'),
  phone: yup.string()
    .required('Required')
    .matches(/^[0-9]+$/, 'Digits only')
    .max(10, 'Max 10 digits')
    .min(7, 'Min 7 digits'),
  address: yup.string().required('Required'),
  nationalId: yup.string().required('Required'),
  role: yup.string().required('Required'),
}).required();

const roles = [
  { value: 'CUSTOMER',           label: 'Customer',            desc: 'Manage your vehicles & policies' },
  { value: 'SUPERVISOR',         label: 'Supervisor',          desc: 'Oversee all operations' },
  { value: 'CLAIMS_OFFICER',     label: 'Claims Officer',      desc: 'Process insurance claims' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Manager',  desc: 'Manage vehicles & policies' },
  { value: 'BRANCH_MANAGER',     label: 'Branch Manager',      desc: 'Monitor branch activity' },
  { value: 'FINANCE_EXECUTIVE',  label: 'Finance Executive',   desc: 'Access financial reports' },
];

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'CUSTOMER' },
    mode: 'onBlur',
  });
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = watch('password') || '';
  const strengthScore = [
    passwordValue.length >= 6,
    passwordValue.length >= 10,
    /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue),
    /[0-9]/.test(passwordValue) && /[^A-Za-z0-9]/.test(passwordValue),
  ].filter(Boolean).length;
  const strengthMeta = [
    { label: 'Too short', color: 'bg-slate-700', text: 'text-slate-500' },
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' },
  ][strengthScore];
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const res = await registerApi(data);
      const authData = res.data.data;
      login(authData.token, { name: authData.name, email: authData.email, role: authData.role });
      navigate(authData.role === 'CUSTOMER' ? '/overview' : '/staff/dashboard');
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left hero panel (desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden items-center justify-center px-12 pt-12 pb-60 flex-shrink-0"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #1e3a8a 0%, #0f172a 55%, #020617 100%)' }}
      >
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <DrivingScene compact />
        <div className="relative max-w-sm animate-in">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-900/60">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">MotorGuard</span>
          </Link>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-6">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Join MotorGuard in minutes.
          </h2>
          <p className="text-slate-400 mb-8">Create an account to register your vehicle and start protecting it today.</p>
          <ul className="space-y-3">
            {['Free account, no hidden fees', 'Three coverage tiers to choose from', 'Digital claims & document storage'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 0%, #1e3a8a 0%, #0f172a 55%, #020617 100%)' }}
      >
        <div className="absolute top-[-15%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none lg:hidden" />
        <div className="absolute bottom-[-15%] left-[-5%] w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none lg:hidden" />

      <div className="w-full max-w-lg animate-in">
        {/* Logo (mobile only) */}
        <div className="text-center mb-8 lg:hidden">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-900/60 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join MotorGuard today</p>
        </div>

        <div className="card-glass p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row: Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <InputWrapper icon={User}>
                  <input {...register('name')} id="reg-name" type="text" placeholder="Alice Johnson"
                    className="input-field pl-10" />
                </InputWrapper>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <InputWrapper icon={Mail}>
                  <input {...register('email')} id="reg-email" type="email" placeholder="you@example.com"
                    className="input-field pl-10" />
                </InputWrapper>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('password')} id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= strengthScore ? strengthMeta.color : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold mt-1 ${strengthMeta.text}`}>Password strength: {strengthMeta.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Row: Phone + National ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                <InputWrapper icon={Phone}>
                  <input {...register('phone')} id="reg-phone" type="tel" inputMode="numeric" maxLength={10} placeholder="0771234567"
                    className="input-field pl-10" />
                </InputWrapper>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">National ID</label>
                <InputWrapper icon={CreditCard}>
                  <input {...register('nationalId')} id="reg-national-id" type="text" placeholder="900101-14-5678"
                    className="input-field pl-10" />
                </InputWrapper>
                {errors.nationalId && <p className="text-red-400 text-xs mt-1">{errors.nationalId.message}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
              <InputWrapper icon={MapPin}>
                <input {...register('address')} id="reg-address" type="text" placeholder="Your full address"
                  className="input-field pl-10" />
              </InputWrapper>
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <div className="relative">
                <select {...register('role')} id="reg-role" className="input-field appearance-none pr-10">
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>

            {/* Submit */}
            <button id="reg-submit" type="submit" disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RegisterPage;
