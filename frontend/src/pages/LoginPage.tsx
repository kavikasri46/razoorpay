import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login({ email, password });
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5 font-outfit">
          Welcome back
        </h2>
        <p className="text-xs text-slate-450 font-semibold">Sign in to your finance workspace.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-3 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Corporate Email *"
          type="email"
          placeholder="name@finance-controller.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          light={true}
        />

        <Input
          label="Security Password *"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          light={true}
        />
      </div>

      <Button 
        type="submit" 
        loading={loading} 
        className="w-full mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 shadow-lg shadow-blue-500/10 rounded-xl font-bold py-3 text-xs"
      >
        Authenticate Securely
      </Button>

      {/* Quick Access Profiles */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Quick Access Profiles (Development)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            onClick={() => {
              setEmail('admin@razorpay.com');
              setPassword('admin123');
              toast.info('Loaded Admin profile credentials');
            }}
            className="bg-white border border-slate-100 hover:border-blue-500/30 hover:bg-slate-50 p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all shadow-sm"
          >
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">Admin Auditor</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Aditya Sharma</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-slate-400"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l-.5-.5" /></svg>
          </div>

          <div 
            onClick={() => {
              setEmail('rahul@razorpay.com');
              setPassword('user123');
              toast.info('Loaded Finance Manager profile credentials');
            }}
            className="bg-white border border-slate-100 hover:border-blue-500/30 hover:bg-slate-50 p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all shadow-sm"
          >
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">Finance Manager</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Neha Goel</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-slate-400"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l-.5-.5" /></svg>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-[11px] font-semibold">
        <span className="text-slate-400">Need access? <Link to="/register" className="text-[#0f766e] hover:text-[#0d9488] font-bold transition-colors">Create workspace profile</Link></span>
        <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
          &larr; Return Home
        </Link>
      </div>
    </form>
  );
};
export default LoginPage;
