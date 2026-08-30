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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white text-center mb-1">Welcome back</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Enter your credentials to access your workspace</p>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg font-semibold">
          {error}
        </div>
      )}

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

      <Button type="submit" loading={loading} className="w-full mt-2">
        Sign In
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">Don't have an account? </span>
        <Link to="/register" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
          Create one
        </Link>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mt-8 pt-4 border-t border-slate-800/40 text-left bg-slate-950/40 p-4 rounded-lg">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Demo Credentials</p>
        <div className="space-y-1">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">User:</span> rahul@razorpay.com / <span className="font-mono text-slate-200">user123</span>
          </p>
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Admin:</span> admin@razorpay.com / <span className="font-mono text-slate-200">admin123</span>
          </p>
        </div>
      </div>
    </form>
  );
};
export default LoginPage;
