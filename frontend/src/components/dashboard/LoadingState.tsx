import React from 'react';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  title = "Loading Dashboard...", 
  description = "Please wait while we fetch your data" 
}) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default LoadingState;