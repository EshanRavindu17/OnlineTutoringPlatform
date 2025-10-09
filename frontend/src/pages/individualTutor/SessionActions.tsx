import React, { useState } from 'react';

interface SessionAction {
  sessionId: string; // Changed from number to string to match backend UUID
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  status?: string; // Added status field
}

interface SessionActionsProps {
  session: SessionAction;
  onCancel: (sessionId: string, reason: string) => void; // Changed sessionId type to string
  onClose: () => void;
}

const SessionActions: React.FC<SessionActionsProps> = ({
  session,
  onCancel,
  onClose
}) => {
  const [actionType, setActionType] = useState<'cancel' | null>(null);

  const handleCancel = () => {
    onCancel(session.sessionId, '');
    setActionType(null);
    onClose();
  };

  if (!actionType) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Session Actions</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800">{session.title}</h4>
            <h3 className="font-semibold text-green-800">{session.subject}</h3>
            <p className="text-gray-600">Student: {session.studentName}</p>
            <p className="text-gray-600">{session.date} at {session.time}</p>
            <p className="text-green-600 font-medium">LKR {session.amount}</p>
          </div>

          <div className="space-y-3">            
            <button
              onClick={() => setActionType('cancel')}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 font-medium"
            >
              ❌ Cancel Session
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Cancel Session
        </h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800">{session.title}</h4>
          <h3 className="font-semibold text-green-800">{session.subject}</h3>
          <p className="text-gray-600">Student: {session.studentName}</p>
          <p className="text-gray-600">{session.date} at {session.time}</p>
          <p className="text-green-600 font-medium">LKR {session.amount}</p>
        </div>

        <div className="space-y-4">          
          {actionType === 'cancel' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>⚠️ Important:</strong> Canceling this session will:
              </p>
              <ul className="text-red-700 text-sm mt-2 ml-4 list-disc space-y-1">
                <li>Automatically initiate a refund to the student</li>
                <li>Send notification to the student</li>
                <li>Make your time slot available again</li>
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600"
            >
              Confirm Cancellation
            </button>
            
            <button
              onClick={() => setActionType(null)}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionActions;
