import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set axios default headers
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      await loadUser();
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['x-auth-token'];
    toast.info('You have been logged out');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, userData);
      setUser(res.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;