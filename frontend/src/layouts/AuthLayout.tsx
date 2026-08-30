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
    <div className="flex min-h-screen bg-[#f8fafc] items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Premium ambient light glow spots */}
      <div className="absolute top-[-25%] right-[-25%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[-25%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-cyan-500/5 via-blue-500/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_15px_45px_rgba(99,102,241,0.06)] relative z-10">
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
            <span className="text-2xl font-black tracking-tight text-slate-900 font-outfit">
              Razor<span className="text-violet-600 font-extrabold">Pay</span>
            </span>
          </div>
          <p className="text-xs text-slate-450 font-semibold tracking-wide">Intelligent Payments. Smarter Decisions.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
