import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { format } from 'date-fns';
import { MapPin, Briefcase } from 'lucide-react';

export default function Users() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.client.get<User[]>('/users');
      return res.data;
    }
  });

  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    department: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name required';
    if (!form.email.trim()) next.email = 'Email required';
    if (!['admin', 'user'].includes(form.role)) next.role = 'Invalid role';
    if (!['active', 'inactive'].includes(form.status)) next.status = 'Invalid status';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateUser = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (!validate()) throw new Error('validation');
      await api.client.put(`/users/${editing.id}`, {
        name: form.name,
        role: form.role,
        status: form.status as User['status'],
        department: form.department,
        location: form.location
      });
    },
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditing(null);
    },
    onError: (err: any) => {
      if (err?.message === 'validation') toast.error('Fix form errors');
      else toast.error('Unable to update user');
    }
  });

  const createUser = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('validation');
      await api.client.post('/users', {
        name: form.name,
        email: form.email,
        password: form.password || 'Password@123',
        role: form.role,
        status: form.status,
        department: form.department,
        location: form.location
      });
    },
    onSuccess: () => {
      toast.success('User created');
      qc.invalidateQueries({ queryKey: ['users'] });
      setForm({ name: '', email: '', password: '', role: 'user', status: 'active', department: '', location: '' });
      setCreating(false);
    },
    onError: (err: any) => {
      if (err?.message === 'validation') toast.error('Fix form errors');
      else toast.error('Unable to create user');
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => api.client.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Unable to delete user')
  });

  const initials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const gradientById = (id: number) =>
    id % 2 === 0 ? 'from-primary to-indigo-500' : 'from-emerald-500 to-teal-400';

  const isModalOpen = creating || !!editing;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Team</p>
          <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setForm({ name: '', email: '', password: '', role: 'user', status: 'active', department: '', location: '' });
            setErrors({});
          }}
          className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-2 shadow-lg shadow-primary/30 hover:scale-[1.01] transition"
        >
          + Add User
        </button>
      </div>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((user) => (
          <div
            key={user.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.08),transparent_30%)] pointer-events-none" />
            <div className="relative p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradientById(
                      user.id
                    )} text-white flex items-center justify-center shadow-lg shadow-primary/40 uppercase`}
                  >
                    {initials(user.name)}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">User #{user.id}</p>
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border capitalize ${
                      user.role === 'admin'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      user.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <Briefcase size={14} className="text-primary" />
                <span>{user.department || 'No department'}</span>
              </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <MapPin size={14} className="text-primary" />
                  <span>{user.location || 'Remote'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-500">Joined {format(new Date(user.created_at), 'MM/dd/yyyy')}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(user);
                      setCreating(false);
                      setForm({
                        name: user.name,
                        email: user.email,
                        password: '',
                        role: user.role,
                        status: user.status,
                        department: user.department || '',
                        location: user.location || ''
                      });
                      setErrors({});
                    }}
                    className="text-xs px-3 py-1 rounded-full border border-primary text-primary hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(user.id)}
                    className="text-xs px-3 py-1 rounded-full border border-red-400 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? 'Edit User' : 'Add User'}
        footer={
          <>
            <button
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => (editing ? updateUser.mutate() : createUser.mutate())}
              className="px-4 py-2 rounded-lg bg-primary text-white shadow-sm hover:shadow"
              disabled={updateUser.status === 'pending' || createUser.status === 'pending'}
            >
              {updateUser.status === 'pending' || createUser.status === 'pending'
                ? 'Saving...'
                : editing
                ? 'Save'
                : 'Create'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Name</label>
              <input
                className={`border rounded-lg px-3 py-2 w-full ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Email</label>
              <input
                className={`border rounded-lg px-3 py-2 w-full ${errors.email ? 'border-red-400' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                readOnly={!!editing}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>
          {!editing && (
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Password</label>
              <input
                type="password"
                className={`border rounded-lg px-3 py-2 w-full ${errors.password ? 'border-red-400' : ''}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Role</label>
              <select
                className={`border rounded-lg px-3 py-2 w-full ${errors.role ? 'border-red-400' : ''}`}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Status</label>
              <select
                className={`border rounded-lg px-3 py-2 w-full ${errors.status ? 'border-red-400' : ''}`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Department</label>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Location</label>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete user?"
        message="This will permanently remove the user from the system."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteUser.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
