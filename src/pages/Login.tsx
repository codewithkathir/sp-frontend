import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@sprintboard.test');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="card p-8 w-[360px] space-y-4">
        <h1 className="text-2xl font-semibold text-center">SprintBoard</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input className="border rounded px-3 py-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="border rounded px-3 py-2 w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
        <p className="text-sm text-center text-slate-500">Use seeded admin account to sign in.</p>
      </form>
    </div>
  );
}
