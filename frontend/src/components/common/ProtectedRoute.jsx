import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  redirectPath = '/login',
  fallbackComponent = null 
}) => {
  const { user, isAuthenticated, loading, checkAuth } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !loading) {
        await checkAuth();
      }
      setIsChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, loading, checkAuth]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return <Loading fullScreen text="Verifying authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // If a fallback component is provided, render it
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Otherwise, show unauthorized message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. 
              {requiredRole && (
                <span className="block mt-1">
                  Required role: <span className="font-semibold capitalize">{requiredRole}</span>
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected component
  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (WrappedComponent, requiredRole) => {
  return (props) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};

// Admin-only route component
export const AdminRoute = ({ children, fallbackComponent }) => (
  <ProtectedRoute 
    requiredRole="admin" 
    fallbackComponent={fallbackComponent}
  >
    {children}
  </ProtectedRoute>
);

// User route component (for regular users)
export const UserRoute = ({ children, fallbackComponent }) => (
  <ProtectedRoute 
    requiredRole="user" 
    fallbackComponent={fallbackComponent}
  >
    {children}
  </ProtectedRoute>
);

// Component that checks if user owns a resource
export const OwnershipRoute = ({ 
  children, 
  resourceUserId, 
  currentUserId, 
  allowAdmin = true 
}) => {
  const { user } = useContext(AuthContext);
  
  const hasAccess = 
    resourceUserId === currentUserId || 
    (allowAdmin && user?.role === 'admin');

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <svg 
                className="w-8 h-8 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Resource Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              You can only access your own resources.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;