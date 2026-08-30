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
        <h2 className="text-2xl font-extrabold tracking-tight text-white text-center mb-1">
          Welcome back
        </h2>
        <p className="text-xs text-slate-450 text-center mb-6">Enter your credentials to access your workspace</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="rahul@razorpay.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button 
        type="submit" 
        loading={loading} 
        className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/20 active:scale-[0.97]"
      >
        Sign In
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">Don't have an account? </span>
        <Link to="/register" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
          Create one
        </Link>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mt-8 pt-4 border-t border-slate-900 bg-slate-950/20 backdrop-blur-md p-4 rounded-xl border border-slate-900">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Demo Accounts</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-450 font-medium">User Account:</span>
            <span className="font-mono text-slate-300">rahul@razorpay.com / user123</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-450 font-medium">Admin Account:</span>
            <span className="font-mono text-slate-300">admin@razorpay.com / admin123</span>
          </div>
        </div>
      </div>
    </form>
  );
};
export default LoginPage;
