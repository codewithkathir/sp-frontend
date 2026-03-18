import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changePassword = useMutation({
    mutationFn: async () => {
      const nextErr: Record<string, string> = {};
      if (!current) nextErr.current = 'Current password required';
      if (!next || next.length < 8) nextErr.next = 'Min 8 characters';
      if (next !== confirm) nextErr.confirm = 'Passwords do not match';
      setErrors(nextErr);
      if (Object.keys(nextErr).length) throw new Error('validation');
      await api.client.post('/auth/change-password', { currentPassword: current, newPassword: next });
    },
    onSuccess: () => {
      toast.success('Password updated');
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({});
    },
    onError: (err: any) => {
      if (err?.message === 'validation') toast.error('Fix form errors');
      else toast.error(err?.response?.data?.message || 'Unable to update password');
    }
  });

  if (!user) return null;
  return (
    <div className="mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_30%)] pointer-events-none" />
        <div className="relative p-7 flex items-center gap-5">
          <div className="h-18 w-18 min-w-[4.5rem] min-h-[4.5rem] rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center text-2xl font-semibold shadow-xl uppercase">
            {user.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Profile</p>
            <h2 className="text-2xl font-semibold text-slate-900 leading-tight">{user.name}</h2>
            <p className="text-slate-600">{user.email}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className={`text-xs px-3 py-1 rounded-full border capitalize ${
                user.role === 'admin'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                {user.role}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full border ${
                user.status === 'active'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            Member since {format(new Date(user.created_at), 'MM/dd/yyyy')}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Account Details</h3>
            <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">Secure</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500">Role</p>
                <p className="font-medium text-slate-900 capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium text-slate-900 capitalize">{user.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-3">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Current password</label>
            <input
              type="password"
              className={`border rounded-lg px-3 py-2 w-full ${errors.current ? 'border-red-400' : ''}`}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current password"
            />
            {errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">New password</label>
            <input
              type="password"
              className={`border rounded-lg px-3 py-2 w-full ${errors.next ? 'border-red-400' : ''}`}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min 8 characters"
            />
            {errors.next && <p className="text-xs text-red-500">{errors.next}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Confirm new password</label>
            <input
              type="password"
              className={`border rounded-lg px-3 py-2 w-full ${errors.confirm ? 'border-red-400' : ''}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
          </div>
          <button
            onClick={() => changePassword.mutate()}
            className="rounded-lg bg-primary text-white px-4 py-2 shadow hover:shadow-md disabled:opacity-70"
            disabled={changePassword.status === 'pending'}
          >
            {changePassword.status === 'pending' ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
