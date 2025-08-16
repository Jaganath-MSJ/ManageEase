import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';
import toast from 'react-hot-toast';

const TaskList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery(
    'tasks',
    async () => {
      const response = await api.get('/tasks');
      return response.data.tasks;
    }
  );

  const { data: users = [] } = useQuery(
    'users',
    async () => {
      const response = await api.get('/users');
      return response.data.users;
    },
    { enabled: isAdmin }
  );

  const deleteTaskMutation = useMutation(
    (taskId) => api.delete(`/tasks/${taskId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Task deleted successfully');
        setDeleteTask(null);
      }
    }
  );

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                            task.description?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getUserName = (userId) => {
    const taskUser = users.find(u => u._id === userId);
    return taskUser?.name || 'Unknown User';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedTasks.map(task => (
          <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{task.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeleteTask(task)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              {isAdmin && (
                <div>Assigned to: {getUserName(task.assignedUser)}</div>
              )}
              {task.dueDate && (
                <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
              )}
              <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks found matching your criteria.</p>
        </div>
      )}

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          users={users}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingTask(null);
            queryClient.invalidateQueries('tasks');
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTask.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteTaskMutation.mutate(deleteTask._id)}
          onCancel={() => setDeleteTask(null)}
          loading={deleteTaskMutation.isLoading}
        />
      )}
    </div>
  );
};

export default TaskList;