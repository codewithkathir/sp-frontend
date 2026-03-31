import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { Project } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Briefcase,
  KanbanSquare,
  Rocket,
  Layers,
  CalendarClock,
  ShieldCheck,
  Target,
  Zap,
  Wrench,
  Users2
} from 'lucide-react';

export default function Projects() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.client.get<Project[]>('/projects');
      return res.data;
    }
  });

  const [form, setForm] = useState({ name: '', description: '', client: '', priority: 'medium', status: 'planning' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'description' | 'client' | 'priority' | 'status', string>>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const validate = (payload: typeof form) => {
    const next: Partial<Record<'name' | 'description' | 'client' | 'priority' | 'status', string>> = {};
    if (!payload.name.trim()) next.name = 'Name is required';
    else if (payload.name.trim().length < 3) next.name = 'Min 3 characters';
    if (!payload.description.trim()) next.description = 'Description is required';
    if (!payload.client.trim()) next.client = 'Client is required';
    if (!['high', 'medium', 'low'].includes(payload.priority)) next.priority = 'Invalid priority';
    if (!['planning', 'in_progress', 'completed', 'on_hold'].includes(payload.status)) next.status = 'Invalid status';
    return next;
  };

  const createProject = useMutation({
    mutationFn: async () => {
      const nextErrors = validate(form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        throw new Error('validation');
      }
      if (editing) {
        await api.client.put(`/projects/${editing.id}`, { ...form });
      } else {
        await api.client.post('/projects', { ...form, owner_id: 1 });
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Project updated' : 'Project created');
      qc.invalidateQueries({ queryKey: ['projects'] });
      setForm({ name: '', description: '', client: '', priority: 'medium', status: 'planning' });
      setEditing(null);
      setModalOpen(false);
      setErrors({});
    },
    onError: (err: any) => {
      if (err?.message === 'validation') toast.error('Fix form errors');
      else toast.error('Unable to save project');
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (id: number) => api.client.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted');
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => toast.error('Unable to delete project')
  });

  const openForEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description ?? '',
      client: project.client ?? '',
      priority: project.priority,
      status: project.status
    });
    setModalOpen(true);
  };

  const cards = useMemo(() => data ?? [], [data]);
  const projectIcons = useMemo(
    () => [Briefcase, KanbanSquare, Rocket, Layers, CalendarClock, ShieldCheck, Target, Zap, Wrench, Users2],
    []
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Projects</p>
          <h2 className="text-2xl font-semibold text-slate-900">All workspaces</h2>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: '', description: '', client: '', priority: 'medium', status: 'planning' });
            setModalOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-2 shadow-lg shadow-primary/30 hover:scale-[1.01] transition"
        >
          + Add Project
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((project) => (
          <div
            key={project.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-white pointer-events-none" />
            <div className="relative p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    {(() => {
                      const Icon = projectIcons[project.id % projectIcons.length];
                      return <Icon size={18} />;
                    })()}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500">Project #{project.id}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    project.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : project.status === 'in_progress'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : project.status === 'on_hold'
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-sky-200 bg-sky-50 text-sky-700'
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-700 line-clamp-3">{project.description}</p>
              {project.client && <p className="text-xs text-slate-500">Client: {project.client}</p>}
              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${
                    project.priority === 'high'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : project.priority === 'medium'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Priority: {project.priority}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openForEdit(project)}
                    className="text-xs px-3 py-1 rounded-full border border-primary text-primary hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(project.id)}
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Project' : 'New Project'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => createProject.mutate()}
              className="px-4 py-2 rounded-lg bg-primary text-white shadow-sm hover:shadow"
              disabled={createProject.status === 'pending'}
            >
              {createProject.status === 'pending' ? 'Saving...' : editing ? 'Save changes' : 'Create'}
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
                placeholder="Project name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Client</label>
              <input
                className={`border rounded-lg px-3 py-2 w-full ${errors.client ? 'border-red-400' : ''}`}
                placeholder="Client"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
              />
              {errors.client && <p className="text-xs text-red-500">{errors.client}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Description</label>
            <textarea
              className={`border rounded-lg px-3 py-2 w-full ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Short description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Priority</label>
              <select
                className={`border rounded-lg px-3 py-2 w-full ${errors.priority ? 'border-red-400' : ''}`}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {errors.priority && <p className="text-xs text-red-500">{errors.priority}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Status</label>
              <select
                className={`border rounded-lg px-3 py-2 w-full ${errors.status ? 'border-red-400' : ''}`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete project?"
        message="This will permanently remove the project and its tasks."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteProject.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
