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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center mb-1 font-outfit">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6">Enter your credentials to access your workspace</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-3 rounded-xl font-semibold">
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
          light={true}
        />

        <Input
          label="Password"
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
        className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-violet-700 text-white border-0 shadow-lg shadow-violet-600/10 rounded-xl"
      >
        Sign In
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">Don't have an account? </span>
        <Link to="/register" className="text-xs text-violet-600 hover:text-violet-700 font-bold transition-colors">
          Create one
        </Link>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mt-8 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Demo Accounts</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">User:</span>
            <span className="font-mono text-slate-600">rahul@razorpay.com / user123</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">Admin:</span>
            <span className="font-mono text-slate-600">admin@razorpay.com / admin123</span>
          </div>
        </div>
      </div>
    </form>
  );
};
export default LoginPage;
