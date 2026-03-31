import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  BarChart3,
  Activity,
  Calendar,
  Target
} from 'lucide-react';

interface SummaryResponse {
  projectStats: { status: string; count: number; }[];
  taskStats: { status: string; count: number; }[];
  priorityStats: { priority: string; count: number; }[];
  activity: { id: number; action: string; entity_type: string; created_at: string; meta?: any; }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await api.client.get<SummaryResponse>('/analytics/summary');
      return res.data;
    }
  });

  if (isLoading || !data) return <LoadingSpinner />;

  // Calculate totals
  const totalProjects = data.projectStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalTasks = data.taskStats.reduce((sum, stat) => sum + stat.count, 0);
  const completedTasks = data.taskStats.find(stat => stat.status === 'done')?.count || 0;
  const inProgressTasks = data.taskStats.find(stat => stat.status === 'in_progress')?.count || 0;
  const highPriorityTasks = data.priorityStats.find(stat => stat.priority === 'high')?.count || 0;

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Progress bar component
  const ProgressBar = ({ percentage, color = 'bg-primary' }: { percentage: number; color?: string }) => (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-300`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done': return <CheckSquare size={20} />;
      case 'in_progress': return <Clock size={20} />;
      case 'planning': return <Target size={20} />;
      case 'on_hold': return <AlertTriangle size={20} />;
      case 'todo': return <BarChart3 size={20} />;
      case 'qa': return <Activity size={20} />;
      case 'blocked': return <AlertTriangle size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'qa': return 'bg-indigo-100 text-indigo-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your projects today.</p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-slate-500">Current Time</p>
              <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
            <Calendar className="text-primary" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FolderKanban className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="text-green-500 mr-1" size={16} />
            <span className="text-green-600 font-medium">Active projects</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalTasks}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckSquare className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-600">{completedTasks} completed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{inProgressTasks}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-600">Active tasks</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">High Priority</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{highPriorityTasks}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">Needs attention</span>
          </div>
        </div>
      </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">Progress Overview</h2>
            <Target className="text-slate-400" size={20} />
          </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Task Completion</span>
              <span className="text-sm text-slate-500">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <ProgressBar percentage={completionRate} color="bg-green-500" />
            <p className="text-xs text-slate-500 mt-1">{completionRate.toFixed(1)}% complete</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{data.taskStats.find(s => s.status === 'todo')?.count || 0}</div>
              <div className="text-sm text-slate-600">To Do</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-900">{inProgressTasks}</div>
              <div className="text-sm text-amber-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{completedTasks}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Project Status Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">Project Status</h2>
              <BarChart3 className="text-slate-400" size={20} />
            </div>
            <div className="space-y-4">
              {data.projectStats.map((stat) => (
                <div key={stat.status} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(stat.status)}`}>
                      {getStatusIcon(stat.status)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{stat.status.replace('_', ' ')}</p>
                      <p className="text-sm text-slate-500">{stat.count} projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                    <p className="text-sm text-slate-500">{((stat.count / totalProjects) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/projects')}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                <span>New Project</span>
              </button>
              <button 
                onClick={() => navigate('/tasks')}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <CheckSquare size={18} />
                <span>New Task</span>
              </button>
              <button 
                onClick={() => navigate('/users')}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Users size={18} />
                <span>Invite Team</span>
              </button>
            </div>
          </div>

          {/* Task Priority Breakdown */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Task Priorities</h2>
            <div className="space-y-3">
              {data.priorityStats.map((stat) => (
                <div key={stat.priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stat.priority === 'high' ? 'bg-red-500' :
                      stat.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">{stat.priority}</span>
                  </div>
                  <span className="text-sm font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">Recent Activity</h2>
          <Activity className="text-slate-400" size={20} />
        </div>
        <div className="space-y-4">
          {data.activity.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Activity size={16} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {item.action} <span className="text-slate-600">on {item.entity_type}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {data.activity.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
