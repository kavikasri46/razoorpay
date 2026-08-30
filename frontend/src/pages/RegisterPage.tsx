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
  const [role] = useState<'USER' | 'ADMIN'>('USER');
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5 font-outfit">
          Create workspace profile
        </h2>
        <p className="text-xs text-slate-450 font-semibold">Set up your corporate credentials below.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-3 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Full Name *"
          type="text"
          placeholder="Rahul Verma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          light={true}
        />

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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          light={true}
        />
      </div>

      <Button 
        type="submit" 
        loading={loading} 
        className="w-full mt-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 shadow-lg shadow-blue-500/10 rounded-xl font-bold py-3 text-xs"
      >
        Authenticate and Create
      </Button>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-[11px] font-semibold">
        <span className="text-slate-400">Already registered? <Link to="/login" className="text-[#0f766e] hover:text-[#0d9488] font-bold transition-colors">Sign in</Link></span>
        <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
          &larr; Return Home
        </Link>
      </div>
    </form>
  );
};
export default RegisterPage;
