import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ButtonLoading } from '../common/Loading';
import { authAPI } from '../../services/api';

const ChangePassword = ({ onClose, isModal = false }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'New password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match new password';
    }

    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      toast.success('Password changed successfully!');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close modal if it's a modal
      if (isModal && onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      
      // Set specific error if it's about current password
      if (errorMessage.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ 
    name, 
    label, 
    placeholder, 
    showField, 
    toggleField,
    autoComplete 
  }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showField ? 'text' : 'password'}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors[name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => toggleField(toggleField.split('.')[1])}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {showField ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        name="currentPassword"
        label="Current Password"
        placeholder="Enter your current password"
        showField={showPasswords.current}
        toggleField="showPasswords.current"
        autoComplete="current-password"
      />

      <PasswordField
        name="newPassword"
        label="New Password"
        placeholder="Enter your new password"
        showField={showPasswords.new}
        toggleField="showPasswords.new"
        autoComplete="new-password"
      />

      <PasswordField
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Confirm your new password"
        showField={showPasswords.confirm}
        toggleField="showPasswords.confirm"
        autoComplete="new-password"
      />

      {/* Password requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800 font-medium mb-2">Password Requirements:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li className="flex items-center">
            <span className={`mr-2 ${formData.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}>
              {formData.newPassword.length >= 6 ? '✓' : '○'}
            </span>
            At least 6 characters long
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/[a-z]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
              {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
            </span>
            At least one lowercase letter
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
              {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
            </span>
            At least one uppercase letter
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/\d/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
              {/\d/.test(formData.newPassword) ? '✓' : '○'}
            </span>
            At least one number
          </li>
        </ul>
      </div>

      {/* Form buttons */}
      <div className={`flex ${isModal ? 'justify-end' : 'justify-between'} space-x-3 pt-4`}>
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <ButtonLoading text="Changing Password..." size="small" />
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
        {content}
      </div>
    </div>
  );
};

export default ChangePassword;