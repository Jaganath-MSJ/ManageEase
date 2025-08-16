import React from 'react';

const Loading = ({ 
  size = 'medium', 
  color = 'blue', 
  text = '', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    green: 'border-green-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
    white: 'border-white'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-4 border-solid border-t-transparent 
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className={`
          text-sm font-medium
          ${color === 'white' ? 'text-white' : 'text-gray-600'}
        `}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

// Loading skeleton components
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-8 bg-gray-300 rounded w-20"></div>
      <div className="h-8 bg-gray-300 rounded w-24"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="p-4 border-b">
      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-gray-300 rounded ${
                colIndex === 0 ? 'w-1/4' : colIndex === 1 ? 'w-1/3' : 'w-1/6'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
      <div>
        <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Button loading state
export const ButtonLoading = ({ text = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-solid border-current border-t-transparent
          rounded-full animate-spin
        `}
      />
      <span>{text}</span>
    </div>
  );
};

// Loading dots animation
export const LoadingDots = ({ size = 'medium', color = 'gray' }) => {
  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const colorClasses = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            rounded-full animate-bounce
          `}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export default Loading;