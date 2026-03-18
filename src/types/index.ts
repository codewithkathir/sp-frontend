export type Role = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';
export type TaskStatus = 'todo' | 'in_progress' | 'qa' | 'blocked' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: string;
  location?: string;
  status: UserStatus;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  client?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_date?: string;
  assignee_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  meta?: any;
  created_at: string;
}
