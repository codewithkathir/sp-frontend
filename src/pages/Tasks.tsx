import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { Task, Project, User as AppUser } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Clock, User, Flag, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

type TaskForm = {
  project_id: string;
  title: string;
  description: string;
  assignee_id: string;
  due_date: string;
  priority: string;
  status: string;
};

export default function Tasks() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.client.get<Task[]>('/tasks');
      return res.data;
    }
  });
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.client.get<Project[]>('/projects');
      return res.data;
    }
  });
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.client.get<AppUser[]>('/users');
      return res.data;
    }
  });

  const [form, setForm] = useState<TaskForm>({
    project_id: '',
    title: '',
    description: '',
    assignee_id: '',
    due_date: '',
    priority: 'medium',
    status: 'todo'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const validate = (payload: TaskForm) => {
    const next: Partial<Record<keyof TaskForm, string>> = {};
    if (!payload.project_id.trim()) next.project_id = 'Project ID required';
    if (!payload.title.trim()) next.title = 'Title required';
    if (!payload.description.trim()) next.description = 'Description required';
    if (!['high', 'medium', 'low'].includes(payload.priority)) next.priority = 'Invalid priority';
    if (!['todo', 'in_progress', 'done'].includes(payload.status)) next.status = 'Invalid status';
    return next;
  };

  const saveTask = useMutation({
    mutationFn: async () => {
      const nextErrors = validate(form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) throw new Error('validation');
      const payload = {
        project_id: Number(form.project_id),
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : undefined,
        due_date: form.due_date || undefined
      };
      if (editing) {
        await api.client.put(`/tasks/${editing.id}`, payload);
      } else {
        await api.client.post('/tasks', payload);
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Task updated' : 'Task created');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setForm({
        project_id: '',
        title: '',
        description: '',
        assignee_id: '',
        due_date: '',
        priority: 'medium',
        status: 'todo'
      });
      setEditing(null);
      setModalOpen(false);
      setErrors({});
    },
    onError: (err: any) => {
      if (err?.message === 'validation') toast.error('Fix form errors');
      else toast.error('Unable to save task');
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => api.client.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Task deleted');
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Unable to delete task')
  });

  const openForEdit = (task: Task) => {
    setEditing(task);
    setForm({
      project_id: task.project_id.toString(),
      title: task.title,
      description: task.description ?? '',
      assignee_id: task.assignee_id ? task.assignee_id.toString() : '',
      due_date: formatDateForInput(task.due_date),
      priority: task.priority,
      status: task.status
    });
    setModalOpen(true);
  };

  const cards = useMemo(() => data ?? [], [data]);
  const formatDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return format(d, 'MM/dd/yyyy');
  };

  const formatDateForInput = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return format(d, 'yyyy-MM-dd');
  };
  const assigneeName = (id?: number) => {
    if (!id || !users) return null;
    const found = users.find((u) => u.id === id);
    return found?.name;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Tasks</p>
          <h2 className="text-2xl font-semibold text-slate-900">All tasks</h2>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ project_id: '', title: '', description: '', assignee_id: '', due_date: '', priority: 'medium', status: 'todo' });
            setModalOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-2 shadow-lg shadow-primary/30 hover:scale-[1.01] transition"
        >
          + Add Task
        </button>
      </div>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((task) => (
          <div
            key={task.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.08),transparent_30%)] pointer-events-none" />
            <div className="relative p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Task #{task.id}</p>
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight">{task.title}</h3>
                    {task.project_id && <p className="text-xs text-slate-500 mt-1">Project #{task.project_id}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      task.status === 'done'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : task.status === 'in_progress'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">Created {formatDate(task.created_at)}</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">{task.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <Flag size={14} className="text-primary" />
                  <span
                    className={`px-2 py-1 rounded-full border ${
                      task.priority === 'high'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : task.priority === 'medium'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <Clock size={14} className="text-primary" />
                  <span>{task.due_date ? formatDate(task.due_date) : 'No due date'}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <User size={14} className="text-primary" />
                  <span>
                    {task.assignee_id ? assigneeName(task.assignee_id) || `Assignee #${task.assignee_id}` : 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-primary/70" />
                  <span>Updated {formatDate(task.updated_at) ?? formatDate(task.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openForEdit(task)}
                    className="text-xs px-3 py-1 rounded-full border border-primary text-primary hover:bg-primary/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(task.id)}
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
        title={editing ? 'Edit Task' : 'New Task'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => saveTask.mutate()}
              className="px-4 py-2 rounded-lg bg-primary text-white shadow-sm hover:shadow"
              disabled={saveTask.status === 'pending'}
            >
              {saveTask.status === 'pending' ? 'Saving...' : editing ? 'Save changes' : 'Create'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Project</label>
              <select
                className={`border rounded-lg px-3 py-2 w-full ${errors.project_id ? 'border-red-400' : ''}`}
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              >
                <option value="">Select project</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.project_id && <p className="text-xs text-red-500">{errors.project_id}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Assignee</label>
              <select
                className="border rounded-lg px-3 py-2 w-full"
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Title</label>
            <input
              className={`border rounded-lg px-3 py-2 w-full ${errors.title ? 'border-red-400' : ''}`}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Description</label>
            <textarea
              className={`border rounded-lg px-3 py-2 w-full ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Task details"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="qa">QA Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Due date</label>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete task?"
        message="This will permanently remove the task."
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteTask.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
