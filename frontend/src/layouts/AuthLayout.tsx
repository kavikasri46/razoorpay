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
    <div className="flex min-h-screen bg-[#030712] items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-cyan-500"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white">
              Laser<span className="text-cyan-500">Pay</span>
            </span>
          </div>
          <p className="text-sm text-slate-400">Intelligent Payments. Smarter Decisions.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
