import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../context/AuthContext';

const TaskManagement = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    search: ''
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user.role === 'admin') {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to fetch users');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleCreateTask = async (values, { resetForm }) => {
    try {
      await axios.post('http://localhost:5000/api/tasks', values);
      toast.success('Task created successfully');
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (values) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${selectedTask._id}`, values);
      toast.success('Task updated successfully');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (filter.status === '' || task.status === filter.status) &&
      (filter.priority === '' || task.priority === filter.priority) &&
      (filter.search === '' || 
        task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  const taskValidationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    assignedUser: Yup.string().required('Assigned user is required'),
    priority: Yup.string().required('Priority is required'),
    status: Yup.string().required('Status is required'),
    dueDate: Yup.date()
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="task-management">
      <h1>Task Management</h1>
      
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="search-input"
        />
        
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className={`task-card priority-${task.priority}`}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <div className="task-details">
                <span className={`status status-${task.status}`}>{task.status}</span>
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                <span>Assigned to: {task.assignedUser.name}</span>
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
              <div className="task-actions">
                <button 
                  onClick={() => setSelectedTask(task)} 
                  className="btn btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTask(task._id)} 
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="task-form-container">
        <h2>{selectedTask ? 'Edit Task' : 'Create New Task'}</h2>
        <Formik
          initialValues={selectedTask || {
            title: '',
            description: '',
            assignedUser: user.role === 'admin' ? '' : user._id,
            priority: 'medium',
            status: 'pending',
            dueDate: ''
          }}
          validationSchema={taskValidationSchema}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          enableReinitialize
        >
          {({ isValid }) => (
            <Form className="task-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <Field type="text" id="title" name="title" className="form-control" />
                <ErrorMessage name="title" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Field as="textarea" id="description" name="description" className="form-control" />
                <ErrorMessage name="description" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="assignedUser">Assigned User</label>
                {user.role === 'admin' ? (
                  <Field as="select" id="assignedUser" name="assignedUser" className="form-control">
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </Field>
                ) : (
                  <Field type="text" id="assignedUser" name="assignedUser" className="form-control" disabled />
                )}
                <ErrorMessage name="assignedUser" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <Field as="select" id="priority" name="priority" className="form-control">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Field>
                <ErrorMessage name="priority" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <Field as="select" id="status" name="status" className="form-control">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Field>
                <ErrorMessage name="status" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <Field type="date" id="dueDate" name="dueDate" className="form-control" />
                <ErrorMessage name="dueDate" component="div" className="error-message" />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!isValid}
                >
                  {selectedTask ? 'Update Task' : 'Create Task'}
                </button>
                {selectedTask && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setSelectedTask(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TaskManagement;