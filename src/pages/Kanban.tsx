import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { Task, User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

const columns: { id: Task['status']; title: string; color: string; accent: string }[] = [
  { id: 'todo', title: 'Backlog', color: 'from-slate-100 to-white', accent: 'bg-slate-200 text-slate-700' },
  { id: 'in_progress', title: 'In Progress', color: 'from-amber-50 to-white', accent: 'bg-amber-200 text-amber-800' },
  { id: 'qa', title: 'QA Review', color: 'from-indigo-50 to-white', accent: 'bg-indigo-200 text-indigo-800' },
  { id: 'blocked', title: 'Blocked', color: 'from-rose-50 to-white', accent: 'bg-rose-200 text-rose-800' },
  { id: 'done', title: 'Done', color: 'from-emerald-50 to-white', accent: 'bg-emerald-200 text-emerald-800' },
];

export default function Kanban() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editState, setEditState] = useState<{assignee_id: string; status: string; priority: string}>({ assignee_id: "", status: "", priority: "medium" });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.client.get<Task[]>('/tasks');
      return res.data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.client.get<User[]>('/users');
      return res.data;
    }
  });

  const { data: comments } = useQuery({
    queryKey: ['taskComments', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await api.client.get(`/tasks/${selectedId}/comments`);
      return res.data as { id: number; content: string; user_id: number; created_at: string }[];
    }
  });

  const updateStatus = useMutation({
    mutationFn: (task: Task) => api.client.put(`/tasks/${task.id}`, { status: task.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });

  const updateTask = useMutation({
    mutationFn: async (payload: Partial<Task> & { id: number }) => {
      const { id, ...rest } = payload;
      await api.client.put(`/tasks/${id}`, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedId(null);
    }
  });

  const addComment = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: number; content: string }) => {
      await api.client.post(`/tasks/${taskId}/comments`, { task_id: taskId, content });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
      setCommentText('');
    }
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !data) return;
    const status = result.destination.droppableId as Task['status'];
    const task = data.find((t) => t.id.toString() === result.draggableId);
    if (task && task.status !== status) {
      updateStatus.mutate({ ...task, status });
    }
  };

  const selectedTask = useMemo(() => data?.find((t) => t.id === selectedId) || null, [data, selectedId]);

  if (isLoading || !data) return <LoadingSpinner />;

  const summary = {
    total: data.length,
    todo: data.filter((t) => t.status === 'todo').length,
    inProgress: data.filter((t) => t.status === 'in_progress').length,
    qa: data.filter((t) => t.status === 'qa').length,
    blocked: data.filter((t) => t.status === 'blocked').length,
    done: data.filter((t) => t.status === 'done').length
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Kanban</p>
          <h2 className="text-2xl font-semibold text-slate-900">All tasks</h2>
        </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
            {columns.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg min-h-[300px]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${col.color} pointer-events-none`} />
                    <div className="relative p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${col.accent.split(' ')[0]}`}></span>
                          <h3 className="font-semibold text-slate-900">{col.title}</h3>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-full ${col.accent}`}>
                          {data.filter((t) => t.status === col.id).length} tasks
                        </span>
                      </div>

                      {data
                        .filter((t) => t.status === col.id)
                        .map((task, index) => (
                          <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                            {(drag) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-3 space-y-1"
                              >
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-slate-900">{task.title}</p>
                                  <span
                                    className={`text-[11px] px-2 py-1 rounded-full border ${
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
                                <p className="text-xs text-slate-600 line-clamp-2">{task.description || 'No description'}</p>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                  <span>Project #{task.project_id}</span>
                                  <span>Task #{task.id}</span>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedId(task.id);
                                      setEditState({
                                        assignee_id: task.assignee_id ? String(task.assignee_id) : '',
                                        status: task.status,
                                        priority: task.priority
                                      });
                                    }}
                                    className="text-[11px] px-2 py-1 rounded-full border border-primary text-primary hover:bg-primary/10"
                                  >
                                    Open
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      {selectedId && (
        <Modal
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
          title={selectedTask?.title || 'Task'}
          footer={(
            <>
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (!selectedTask) return;
                  updateTask.mutate({
                    id: selectedTask.id,
                    status: editState.status as Task['status'],
                    priority: editState.priority as Task['priority'],
                    assignee_id: editState.assignee_id ? Number(editState.assignee_id) : undefined
                  });
                }}
                className="px-4 py-2 rounded-lg bg-primary text-white shadow-sm hover:shadow disabled:opacity-60"
                disabled={updateTask.status === 'pending'}
              >
                {updateTask.status === 'pending' ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Status</label>
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={editState.status}
                  onChange={(e) => setEditState((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="todo">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="qa">QA Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Priority</label>
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={editState.priority}
                  onChange={(e) => setEditState((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Assignee</label>
              <select
                className="border rounded-lg px-3 py-2 w-full"
                value={editState.assignee_id}
                onChange={(e) => setEditState((prev) => ({ ...prev, assignee_id: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500">Comments</label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3 bg-slate-50">
                {comments?.length ? (
                  comments.map((c) => (
                    <div key={c.id} className="text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">User #{c.user_id}</p>
                      <p>{c.content}</p>
                      <p className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Add a comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={() => selectedId && commentText && addComment.mutate({ taskId: selectedId, content: commentText })}
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm shadow hover:shadow-md disabled:opacity-60"
                  disabled={!commentText || addComment.status === 'pending' || !selectedId}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
