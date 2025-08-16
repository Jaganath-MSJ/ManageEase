import React, { useState, useEffect } from 'react';
import { ButtonLoading } from '../common/Loading';

const EditProfile = ({ user, onSave, onCancel, isModal = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || ''
      });
    }
  }, [user]);

  useEffect(() => {
    // Check if there are any changes
    if (user) {
      const hasChanged = 
        formData.name !== (user.name || '') ||
        formData.email !== (user.email || '') ||
        formData.contact !== (user.contact || '');
      setHasChanges(hasChanged);
    }
  }, [formData, user]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Contact validation (optional)
    if (formData.contact && !/^\+?[\d\s\-\(\)]+$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid phone number';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      if (onCancel) onCancel();
      return;
    }

    setLoading(true);
    
    try {
      const updatedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        contact: formData.contact.trim() || undefined
      };

      await onSave(updatedData);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific validation errors
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path) {
            serverErrors[err.path] = err.msg;
          }
        });
        setErrors(prev => ({ ...prev, ...serverErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || ''
      });
      setErrors({});
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className={`
            w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.name 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
          disabled={loading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          className={`
            w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.email 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
          disabled={loading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Contact Field */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (Optional)
        </label>
        <input
          id="contact"
          name="contact"
          type="tel"
          autoComplete="tel"
          value={formData.contact}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          className={`
            w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.contact 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
          disabled={loading}
        />
        {errors.contact && (
          <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Include country code for international numbers (e.g., +1 555-123-4567)
        </p>
      </div>

      {/* Profile Picture Upload (Placeholder) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Change Photo
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 2MB)</p>
          </div>
        </div>
      </div>

      {/* Change Indicator */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <svg className="flex-shrink-0 w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                You have unsaved changes. Make sure to save your changes before leaving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Buttons */}
      <div className={`flex ${isModal ? 'justify-end' : 'justify-between'} space-x-3 pt-4`}>
        {hasChanges && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            disabled={loading}
          >
            Reset
          </button>
        )}
        
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className={`
              px-6 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${hasChanges 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <ButtonLoading text="Saving..." size="small" />
            ) : hasChanges ? (
              'Save Changes'
            ) : (
              'No Changes'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <p className="text-gray-600 mt-1">Update your personal information</p>
        </div>
        {content}
      </div>
    </div>
  );
};

export default EditProfile;