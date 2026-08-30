import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Brain, 
  LineChart, 
  Cpu, 
  ArrowRight, 
  Play, 
  Check,
  Fingerprint,
  Activity,
  GitBranch,
  Sparkles,
  Zap,
  Lock,
  Layers
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const stats = [
    { label: 'Total Reconciled', value: '$ 2.4B+' },
    { label: 'Corporate Accounts', value: '10K+' },
    { label: 'Secure & Trusted', value: '99.9%' },
    { label: 'Payment Channels', value: '150+' },
    { label: 'Customer Support', value: '24/7' }
  ];

  const features = [
    {
      title: 'AI-Powered Reconciliation',
      desc: 'Automatic transaction matching and anomaly explanation powered by Groq Llama 3.1.',
      icon: Brain,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      title: 'Ledger Audit Trails',
      desc: 'Maintains complete evidence logs showing files mapped, exceptions isolated, and resolved states.',
      icon: LineChart,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Multi-Gateway Feeds',
      desc: 'Sync bank statements directly alongside Stripe, PayPal, Razorpay, or local ledger CSVs.',
      icon: Cpu,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Fraud & Exception Alerts',
      desc: 'Flag potential billing errors, mismatched values, duplicate references, and speed deviations.',
      icon: ShieldCheck,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ];

  const steps = [
    { num: '01', title: 'Register Profile', desc: 'Create your secure company profile and workspace parameters.' },
    { num: '02', title: 'Upload Ledgers', desc: 'Import bank feeds or invoice ledgers via manual file upload or direct API sync.' },
    { num: '03', title: 'Match Statements', desc: 'Run the matching algorithm to automatically pair ledger balances and flag anomalies.' },
    { num: '04', title: 'AI Audit Report', desc: 'Review isolated exceptions, download AI-generated discrepancy summaries, and audit.' }
  ];

  const testimonials = [
    {
      name: 'Sarah J.',
      role: 'Accounting Lead',
      quote: 'RazorPay helped us save hundreds of hours of manual statement audits. The AI-powered discrepancy logs are amazing!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      name: 'David K.',
      role: 'VP of Finance',
      quote: 'Super easy to parse CSV and match ledgers. Now we close our monthly books in hours, not weeks.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      name: 'Michael T.',
      role: 'Finance Controller',
      quote: 'Reconciling gateway payouts and direct bank statements has never been this accurate.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  ];

  const pricing = [
    {
      name: 'Free Plan',
      price: '$0',
      popular: false,
      features: ['100 Reconciliations / Mo', 'Basic CSV Parser', 'Manual Mapping Adjustments', 'Standard Exception Logs']
    },
    {
      name: 'Pro Plan',
      price: '$49',
      popular: true,
      features: ['5,000 Reconciliations / Mo', 'AI Anomaly Auditing', 'Multi-Gateway Feeds Sync', 'Priority Email Support']
    },
    {
      name: 'Premium Plan',
      price: '$149',
      popular: false,
      features: ['Unlimited Reconciliations', 'Multi-User Workspace Seats', 'Advanced Fraud Alerts', '24/7 Dedicated Support Officer']
    }
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-850 min-h-screen font-sans antialiased">
      {/* Navbar */}
      <nav className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-4.5 w-4.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-outfit">
              Razor<span className="text-violet-600">Pay</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
            {['Home', 'Features', 'Solutions', 'Pricing', 'Resources', 'Company'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-violet-600 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-bold tracking-wide uppercase border border-violet-100">
            <Badge variant="info" className="py-0.5 px-1.5 bg-violet-600 text-white uppercase text-[8px]">New</Badge>
            AI-Powered Ledger Reconciliation for Enterprises
          </span>
          
          <h1 className="text-4xl md:text-5.5xl font-black text-slate-900 tracking-tight leading-[1.1] font-outfit">
            Reconcile Accounts <br/>
            <span className="text-violet-600">Smartly</span>. Close Books.
          </h1>
          
          <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed font-medium">
            Enterprise-grade financial reconciliation engine to track payouts, match statements, identify exceptions, and generate AI-powered audit logs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/register" className="px-6 py-3.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-violet-600/20 text-center flex items-center justify-center gap-1.5">
              Get Started for Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/login" className="px-6 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
              <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center"><Play className="h-2 w-2 text-slate-700 fill-slate-700" /></div>
              Watch Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img 
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover" 
                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000}?w=100`} 
                  alt="user" 
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">200K+</p>
              <p className="text-[10px] text-slate-400 font-semibold">Happy Users Worldwide</p>
            </div>
          </div>
        </div>

        {/* Hero Right: Mock Dashboard Image Frame */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Tiny ambient glows */}
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-violet-500/10 rounded-full blur-2xl" />
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Overview</span>
                <h4 className="text-xs font-bold text-slate-900">Total Balance</h4>
              </div>
              <Badge variant="success" className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px]">
                + 12.5%
              </Badge>
            </div>

            {/* Balance Amount */}
            <div className="py-4">
              <h2 className="text-2xl font-black text-slate-900 font-outfit">$ 28,743.50</h2>
              <p className="text-[10px] text-slate-400 mt-1">vs last month</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 pb-4">
              {['Send', 'Receive', 'Top-up'].map(act => (
                <div key={act} className="bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 text-center cursor-pointer transition-colors">
                  <span className="text-[10px] font-bold text-slate-700">{act}</span>
                </div>
              ))}
            </div>

            {/* Simulated Chart preview */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Spending Overview</span>
              <div className="h-28 bg-gradient-to-t from-violet-50/20 to-violet-500/10 rounded-xl border border-slate-50 flex items-end justify-between p-3 gap-1">
                {[40, 60, 35, 75, 50, 90, 65].map((h, idx) => (
                  <div key={idx} className="flex-1 bg-violet-600 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-100 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 font-outfit">{s.value}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center space-y-16">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Features</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-outfit max-w-lg mx-auto leading-tight">
            Everything You Need <br/>
            in <span className="text-violet-600">One Reconciliation App</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <Card key={idx} className="bg-white border-slate-100 p-6 text-left flex flex-col justify-between hover:shadow-xl hover:shadow-slate-100 transition-all duration-350 rounded-2xl">
              <div>
                <div className={`h-11 w-11 rounded-xl ${f.bgColor} ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 font-outfit">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION A: Audit & Integrity (Finova mockup style) */}
      <section className="bg-white border-b border-slate-100 py-20 relative z-10 text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold tracking-wide uppercase border border-indigo-100">
              <Fingerprint className="h-3 w-3" /> Secure Verification System
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight font-outfit leading-tight">
              Audit trails with <br/>
              <span className="text-indigo-600">Deterministic Integrity</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Every financial record trace requires cryptographic ledger mapping, ensuring that bank logs and invoices are correlated exactly without room for discrepancies.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Zero-Trust Audit Logs', desc: 'Maintain complete platform records showing login times, upload batches, and system changes.', icon: Lock },
                { title: 'AI-Powered Anomaly Alerts', desc: 'Identify velocities, duplicate references, and outsized transactions automatically.', icon: Sparkles }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-outfit border-b border-slate-200/60 pb-3">Reconciliation Checklist</h4>
            <div className="space-y-3.5">
              {[
                { check: 'Verification matches transaction reference format', ok: true },
                { check: 'Isolate currency types (INR/USD/EUR/SGD)', ok: true },
                { check: 'Inspect duplicate transaction references', ok: true },
                { check: 'Flag negative transaction amounts', ok: true },
                { check: 'Cross-link payments with Gateway settlements', ok: true }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <div className="h-5.5 w-5.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{item.check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Sync & Gateways */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-left grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-b border-slate-100">
        <div className="order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Razorpay API', desc: 'Automatic payout logs syncing', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Direct Feeds', desc: 'Sync direct bank statements', icon: GitBranch, color: 'text-purple-500', bg: 'bg-purple-50' },
            { title: 'Gateway Sync', desc: 'Link Stripe, PayPal, and more', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
            { title: 'Invoice Ledger', desc: 'Sync internal ERP records', icon: Layers, color: 'text-pink-500', bg: 'bg-pink-50' }
          ].map((item, idx) => (
            <Card key={idx} className="bg-white border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all shadow-sm">
              <div>
                <div className={`h-9 w-9 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-900 font-outfit">{item.title}</h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="order-1 lg:order-2 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[10px] font-bold tracking-wide uppercase border border-pink-100">
            <Zap className="h-3 w-3" /> Multi-Gateway Support
          </span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight font-outfit leading-tight">
            Connect systems with <br/>
            <span className="text-pink-600">Zero Configuration</span>
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Forget custom script setups or manual imports. Simply upload your direct banking settlement feed, Stripe payments log, or standard invoice CSV, and let our mapping algorithms auto-link your data instantly.
          </p>
          <div className="pt-2">
            <Link to="/register" className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md">
              Start Syncing Ledger Data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="solutions" className="bg-white border-b border-slate-100 py-20 text-center space-y-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">How It Works</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-outfit max-w-lg mx-auto leading-tight">
              Simple Steps to <br/>
              Perfect <span className="text-violet-600">Reconciliation</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="text-left space-y-3 relative">
                <span className="text-3xl font-black text-violet-100 font-outfit">{s.num}</span>
                <h4 className="text-xs font-bold text-slate-900 font-outfit">{s.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & Take Control Card */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Take Control Banner */}
          <div className="bg-[#081325] text-white p-8 rounded-3xl flex flex-col justify-between items-start text-left relative overflow-hidden shadow-xl min-h-[350px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f2038_1px,transparent_1px),linear-gradient(to_bottom,#0f2038_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-10 pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black tracking-tight leading-tight font-outfit">
                Take Control of <br/>Your Enterprise Ledgers
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
                Join thousands of finance teams managing cash flow and matching payouts with RazorPay.
              </p>
            </div>

            <div className="space-y-4 w-full relative z-10 pt-6">
              <Link to="/register" className="inline-flex items-center gap-1.5 px-5 py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/25">
                Get Started Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              
              <div className="bg-[#0b1c34] border border-[#132c50]/65 p-3.5 rounded-xl flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">Bank-Level Security</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Testimonials Column */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="text-left space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Testimonials</span>
              <h2 className="text-2xl font-black text-slate-900 font-outfit">Loved by Thousands of Finance Teams</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mt-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="bg-white border-slate-100 p-6 text-left space-y-4 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all shadow-sm">
                  <p className="text-xs text-slate-500 italic leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                    <img className="h-9 w-9 rounded-full object-cover" src={t.avatar} alt={t.name} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-outfit">{t.name}</h4>
                      <p className="text-[9px] text-slate-400 font-semibold">{t.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white border-t border-slate-100 py-20 text-center space-y-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Pricing</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-outfit leading-tight">
              Choose the Plan That's <span className="text-violet-600">Right for Your Business</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {pricing.map((p, idx) => (
              <Card 
                key={idx} 
                className={`bg-white border p-8 text-left rounded-2xl flex flex-col justify-between relative transition-all duration-350 hover:shadow-xl ${
                  p.popular ? 'border-violet-600 shadow-md ring-1 ring-violet-600/10' : 'border-slate-200'
                }`}
              >
                {p.popular && (
                  <span className="absolute top-3 right-3 bg-violet-600 text-white text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">{p.name}</h4>
                  <div className="flex items-baseline gap-1 py-2">
                    <span className="text-3xl font-black text-slate-900 font-outfit">{p.price}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">/ month</span>
                  </div>
                  
                  <ul className="space-y-2.5 pt-6 border-t border-slate-50 mt-4 text-[11px] font-semibold text-slate-600">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-violet-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link 
                    to="/register" 
                    className={`w-full block text-center py-2.5 text-xs font-bold rounded-xl transition-all ${
                      p.popular 
                        ? 'bg-violet-600 hover:bg-violet-750 text-white shadow-lg shadow-violet-600/15' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.popular ? 'Start Free Trial' : 'Get Started'}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA Banner */}
      <section className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white py-16 text-center relative z-10">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <h3 className="text-2xl font-bold tracking-tight font-outfit">Stay Updated with RazorPay</h3>
          <p className="text-xs text-indigo-100 leading-relaxed font-medium">
            Subscribe to our newsletter for the latest platform updates, features logs, and billing cycles optimization tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-white"
            />
            <Button className="bg-white text-violet-600 hover:bg-indigo-50 font-bold border-0 py-3 rounded-xl text-xs">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Dark Slate Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 text-left relative z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 border-b border-slate-900 pb-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-4 w-4">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight font-outfit">RazorPay</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
              Enterprise-grade financial reconciliation engine to track payouts, match statements, identify exceptions, and generate AI-powered audit logs.
            </p>
          </div>

          {['Product', 'Solutions', 'Resources', 'Company'].map((title, idx) => (
            <div key={idx} className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider font-outfit">{title}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-400">
                {title === 'Product' && ['Features', 'Pricing', 'AI Insights', 'Security'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
                {title === 'Solutions' && ['Personal Finance', 'Investing', 'Expense Management', 'Budget Planning'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
                {title === 'Resources' && ['Blog', 'Guides', 'Help Center', 'FAQs'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
                {title === 'Company' && ['About Us', 'Careers', 'Press', 'Contact Us'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} RazorPay Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
