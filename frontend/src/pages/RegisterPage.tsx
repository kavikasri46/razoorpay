import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register({ name, email, password, role });
      toast.success('Registration successful! Welcome to RazorPay.');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white text-center mb-1">
          Create an account
        </h2>
        <p className="text-xs text-slate-450 text-center mb-5">Set up your workspace parameters below</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Rahul Verma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="text-left space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace Access Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
            className="w-full bg-slate-950 border border-slate-900 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="USER">User (Personal Sandbox)</option>
            <option value="ADMIN">Admin (Platform Superuser)</option>
          </select>
        </div>
      </div>

      <Button 
        type="submit" 
        loading={loading} 
        className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/20 active:scale-[0.97]"
      >
        Register Account
      </Button>

      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">Already have an account? </span>
        <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </form>
  );
};
export default RegisterPage;
