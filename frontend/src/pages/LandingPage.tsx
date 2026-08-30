import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Brain, LineChart, Cpu, Lock, Layers } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-900 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-cyan-500">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white">Laser<span className="text-cyan-500">Pay</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-sm font-semibold transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center px-6 py-20 md:py-28 flex flex-col items-center">
        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border border-cyan-500/10">
          RazorPay Hackathon Edition
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Intelligent Payments.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Smarter Decisions.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          RazorPay combines payment intelligence, real-time analytics, and AI-powered financial insights into one unified, enterprise-ready dashboard. Connect, audit, and optimize your cash flow in real-time.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
          <Link to="/register" className="flex-1 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-xl shadow-cyan-500/10 text-center">
            Create Free Account
          </Link>
          <Link to="/login" className="flex-1 px-6 py-3.5 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200 font-bold rounded-lg text-sm transition-all text-center">
            Explore Dashboard
          </Link>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Capabilities</h2>
        <h3 className="text-center text-2xl md:text-3xl font-bold text-white mb-12">Engineered for Modern Fintech</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <Brain className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">AI Financial Assistant</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask natural language queries like "How can I reduce my expenses?" and get immediate, contextual advice reading your real-time transactions.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <LineChart className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Smart Analytics</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyze monthly balances, income vs expense patterns, and category spending distributions using clean, interactive charting powered by Recharts.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <ShieldCheck className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Anomaly Detection</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transactions are evaluated automatically for velocities and outsized amounts, flagging suspicious entries as LOW, MEDIUM, or HIGH risk.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <Cpu className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Spending Health Auditor</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evaluates monthly budgets, savings rates, and subscription burdens to compute a financial health score from 0 to 100 with optimization advice.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <Lock className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Secure Role-Based Access</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strict access controls isolate USER metrics and ADMIN audit logs, powered by bcrypt hashing, JWT validation, and backend route protection.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-xl">
            <Layers className="h-8 w-8 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Cloud-Ready Stack</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engineered as a clean TypeScript monorepo with containerized setup using Docker and deployment configurations for AWS S3, CloudFront, and ECS.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-slate-900/20 border-t border-slate-900 py-16 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Take Control of Your Financial Future</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Create an account and start analyzing, budgeting, and optimizing your payments intelligently today.
        </p>
        <Link to="/register" className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-xl shadow-cyan-500/10">
          Get Started
        </Link>
        <p className="text-[10px] text-slate-600 mt-16">&copy; {new Date().getFullYear()} RazorPay Platform. Designed for the RazorPay Hackathon.</p>
      </footer>
    </div>
  );
};
export default LandingPage;
