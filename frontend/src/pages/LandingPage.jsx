import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DrivingScene from '../components/DrivingScene';
import {
  Shield, Car, FileText, CreditCard, FolderOpen, MessageSquareHeart,
  ArrowRight, CheckCircle2, Lock, Zap, Sparkles, Gauge, ChevronDown
} from 'lucide-react';

const steps = [
  { icon: Car, title: 'Register your vehicle', desc: 'Add your car details once and keep them on file.' },
  { icon: Shield, title: 'Choose a plan', desc: 'Pick Basic, Comprehensive or Third Party coverage.' },
  { icon: CreditCard, title: 'Pay your premium', desc: 'Pay online and get an instant digital receipt.' },
  { icon: FileText, title: 'Claim with confidence', desc: 'File a claim and follow it from review to payout.' },
];

const faqs = [
  { q: 'How do I get covered?', a: 'Create a free account, register your vehicle, choose a coverage plan and pay the premium. Your policy is shown in your dashboard straight away.' },
  { q: 'What does each plan include?', a: 'Basic covers essential legal requirements, Comprehensive protects against accidents, theft and damage, and Third Party covers liability for damage to others.' },
  { q: 'How do I file a claim?', a: 'Open Claims in your account, pick an active policy, describe the incident and enter the amount. You can follow its progress until it is paid.' },
  { q: 'Can I change a claim after submitting it?', a: 'Yes. You can edit or withdraw a claim until it has been paid. If staff have already started reviewing it, you will be warned first.' },
  { q: 'Is my information safe?', a: 'Accounts are protected with encrypted passwords and signed login tokens, and you can only ever see your own records.' },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-800/40 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed animate-in">{a}</p>}
    </div>
  );
};

const coveragePlans = [
  { type: 'BASIC', label: 'Basic', price: 500, color: 'from-slate-600 to-slate-500', icon: '🛡️', blurb: 'Essential legal coverage for everyday driving.' },
  { type: 'COMPREHENSIVE', label: 'Comprehensive', price: 1200, color: 'from-blue-600 to-indigo-500', icon: '⭐', blurb: 'Full protection against accidents, theft, and damage.' },
  { type: 'THIRD_PARTY', label: 'Third Party', price: 300, color: 'from-emerald-600 to-teal-500', icon: '✅', blurb: 'Covers liability for damage to others.' },
];

const features = [
  { icon: Car, title: 'Vehicle Registry', desc: 'Register and manage every vehicle you own in one place.' },
  { icon: Shield, title: 'Policy Management', desc: 'Purchase, track, and renew coverage in a few clicks.' },
  { icon: FileText, title: 'Digital Claims', desc: 'File incidents and track adjudication status in real time.' },
  { icon: CreditCard, title: 'Payments & Receipts', desc: 'Pay premiums and view every transaction with digital receipts.' },
  { icon: FolderOpen, title: 'Document Vault', desc: 'Securely store licenses, registration papers, and proof of loss.' },
  { icon: MessageSquareHeart, title: 'Feedback Loop', desc: 'Rate your experience and help us improve our service.' },
];

const trustPoints = [
  { icon: Lock, label: 'JWT-Secured Accounts' },
  { icon: Gauge, label: 'Real-Time Claim Tracking' },
  { icon: Zap, label: 'Instant Digital Receipts' },
];

const LandingPage = () => {
  const [quotePlan, setQuotePlan] = useState('COMPREHENSIVE');
  const selected = coveragePlans.find(p => p.type === quotePlan);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-slate-800" style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">MotorGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex items-center gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[32rem] h-[32rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <DrivingScene />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-64 lg:pb-72 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Digital-First Vehicle Insurance
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Built for<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Total Peace of Mind</span>
            </h1>
            <p className="text-slate-400 text-lg mt-6 max-w-lg">
              Register your vehicles, manage policies, file claims, and track every payment — all from one secure MotorGuard account.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link to="/register" id="landing-get-started" className="btn-primary text-base py-3 px-6 flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-3 px-6">Sign In</Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-blue-400" /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick coverage estimator card */}
          <div className="animate-in relative">
            <div className="card-glass border border-slate-700/60 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-6">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Gauge className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-base font-bold text-white">Coverage Estimator</h3>
                  <p className="text-xs text-slate-400">See real premium pricing before you sign up</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {coveragePlans.map(p => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => setQuotePlan(p.type)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      quotePlan === p.type
                        ? 'border-blue-500 bg-blue-500/10 text-white font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl block mb-1">{p.icon}</span>
                    <span className="text-[11px]">{p.label}</span>
                  </button>
                ))}
              </div>

              <div className={`p-5 rounded-xl bg-gradient-to-r ${selected.color} mb-6`}>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{selected.label} Coverage</p>
                <p className="text-white text-3xl font-extrabold mt-1">Rs {selected.price.toLocaleString()} <span className="text-sm font-medium text-white/70">/ year</span></p>
                <p className="text-white/80 text-xs mt-2">{selected.blurb}</p>
              </div>

              <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2">
                Continue to Sign Up <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Everything in one account</h2>
          <p className="text-slate-400 mt-3">MotorGuard brings your vehicles, policies, and claims together in a single secure dashboard.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-slate-700 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label">How it works</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">Covered in four simple steps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="card card-hover relative text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-blue-900/50">
                {i + 1}
              </span>
              <div className="w-12 h-12 mx-auto mt-2 mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="card-glass border border-slate-700/60 p-10 flex items-center justify-center aspect-square max-w-md mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-900/50">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <Car className="w-16 h-16 text-blue-400/40" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="section-label">About MotorGuard</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3 mb-5">
              A digital insurer built around your vehicle, not paperwork
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              MotorGuard replaces the phone calls, branch visits, and paper forms of traditional vehicle insurance with a single online account. From the moment you register a vehicle to the moment a claim is settled, every step happens in your dashboard.
            </p>
            <p className="text-slate-400 leading-relaxed mb-6">
              Our claims team reviews and adjudicates incidents through the same platform you use, so status updates — submitted, under review, approved, paid — are always current.
            </p>
            <ul className="space-y-3">
              {['Three coverage tiers to match any budget', 'Ownership-verified access to every record', 'Claims adjudicated by a dedicated review team'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <span className="section-label">FAQ</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-glass border border-blue-500/20 p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight relative">Ready to protect your vehicle?</h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto relative">Create your MotorGuard account and register your first vehicle in minutes.</p>
          <Link to="/register" className="btn-primary text-base py-3 px-8 inline-flex items-center gap-2 mt-8 relative">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">MotorGuard</span>
          </div>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} MotorGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
