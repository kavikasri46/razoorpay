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
    <div className="flex min-h-screen bg-[#02040a] items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Premium ambient light glow spots */}
      <div className="absolute top-[-25%] right-[-25%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[-25%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Decorative subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/40 border border-slate-900 backdrop-blur-2xl rounded-2xl p-8 shadow-[0_0_80px_rgba(99,102,241,0.06)] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Razor<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Pay</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Intelligent Payments. Smarter Decisions.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
