import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712] text-cyan-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-800 antialiased">
      {/* Left Panel: Enterprise Info (Dark Navy) */}
      <div className="w-full md:w-[45%] bg-[#081325] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f2038_1px,transparent_1px),linear-gradient(to_bottom,#0f2038_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-violet-650/10 blur-[100px] pointer-events-none" />

        {/* Logo and Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-4.5 w-4.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white font-outfit block leading-none">RazorPay</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mt-1">Enterprise Ledgers</span>
          </div>
        </div>

        {/* Content Block */}
        <div className="my-12 md:my-auto space-y-6 relative z-10 text-left">
          <span className="inline-block px-3 py-1 bg-[#10243e] text-slate-350 text-[9px] font-bold tracking-widest uppercase rounded border border-[#173052]">
            Secure Operations Layer
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15] font-outfit">
            Know where your money stands.
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
            Reconcile payments, settlements, and financial records with an evidence-first finance control layer.
          </p>

          {/* Bullet points */}
          <div className="space-y-4 pt-4">
            <div className="bg-[#0b1c34] border border-[#132c50]/60 rounded-xl p-4 flex gap-3 text-left">
              <div className="h-6 w-6 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Evidence-First Integrity</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">Every record trace requires deterministic ledger correlation and multi-factor identity authorization.</p>
              </div>
            </div>

            <div className="bg-[#0b1c34] border border-[#132c50]/60 rounded-xl p-4 flex gap-3 text-left">
              <div className="h-6 w-6 rounded-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Route Gateway Link</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">Link card settlements, direct bank feeds, invoices, and payment gateways into a unified ledger.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[9px] text-slate-500 font-semibold relative z-10 text-left">
          &copy; {new Date().getFullYear()} RazorPay Finance Controller. Built with enterprise-grade multi-tenant isolation.
        </p>
      </div>

      {/* Right Panel: Form view (Clean White) */}
      <div className="flex-1 bg-[#f8fafc] md:bg-white flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
        <div className="w-full max-w-[380px] bg-white border border-slate-100 md:border-0 rounded-2xl md:rounded-none p-6 md:p-0 shadow-xl shadow-slate-100 md:shadow-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
