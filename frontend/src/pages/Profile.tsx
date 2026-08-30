import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and Email are required.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name,
        email,
        ...(password && { password }),
      });
      toast.success('Profile updated successfully.');
      setPassword(''); // Clear password field
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl text-left">
      <div>
        <h2 className="text-xl font-bold text-white">Profile Workspace</h2>
        <p className="text-xs text-slate-450 mt-1">Configure account details, change passwords, and check workspace settings.</p>
      </div>

      <Card className="bg-slate-900 border-slate-850 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar and meta */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800/40">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=LP"} 
              alt={user?.name} 
              className="h-16 w-16 rounded-full border border-slate-700 object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="mt-2">
                <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  {user?.role} Workspace Role
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="border-t border-slate-800/20 pt-4 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Change Password</h4>
            <Input
              label="New Password"
              type="password"
              placeholder="Leave blank to keep current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} className="px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default Profile;
