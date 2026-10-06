import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../auth/AuthContext';
import DrivingScene from '../../components/DrivingScene';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Car, CheckCircle2 } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().required('Required'),
}).required();

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      const authData = res.data.data;
      login(authData.token, { name: authData.name, email: authData.email, role: authData.role });
      if (authData.role === 'CUSTOMER') {
        navigate('/overview');
      } else {
        navigate('/staff/dashboard');
      }
      toast.success(`Welcome back, ${authData.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left hero panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-12 pt-12 pb-60"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #1e3a8a 0%, #0f172a 55%, #020617 100%)' }}
      >
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <DrivingScene compact />
        <div className="relative max-w-md animate-in">
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
            Manage every policy, claim, and payment in one place.
          </h2>
          <p className="text-slate-400 mb-8">Sign in to pick up right where you left off.</p>
          <ul className="space-y-3">
            {['Instant policy & claims tracking', 'Secure document vault', 'Digital payment receipts'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-10"
        style={{ background: 'radial-gradient(ellipse at 60% 0%, #1e3a8a 0%, #0f172a 55%, #020617 100%)' }}
      >
        {/* Decorative blobs (mobile only, hero panel covers this on desktop) */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none lg:hidden" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none lg:hidden" />

        <div className="w-full max-w-md animate-in">
        {/* Logo (mobile only) */}
        <div className="text-center mb-8 lg:hidden">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-900/60 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">MotorGuard</h1>
          <p className="text-slate-400 mt-1 text-sm">Vehicle Insurance Management System</p>
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} MotorGuard. All rights reserved.
        </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
