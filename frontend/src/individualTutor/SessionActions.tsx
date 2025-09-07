import React, { useState } from 'react';

interface SessionAction {
  sessionId: number;
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
}

interface SessionActionsProps {
  session: SessionAction;
  onCancel: (sessionId: number, reason: string) => void;
  onReschedule: (sessionId: number, newDate: string, newTime: string, reason: string) => void;
  onClose: () => void;
}

const SessionActions: React.FC<SessionActionsProps> = ({
  session,
  onCancel,
  onReschedule,
  onClose
}) => {
  const [actionType, setActionType] = useState<'cancel' | 'reschedule' | null>(null);
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleCancel = () => {
    if (reason.trim()) {
      onCancel(session.sessionId, reason);
      setReason('');
      setActionType(null);
      onClose();
    } else {
      alert('Please provide a reason for cancellation');
    }
  };

  const handleReschedule = () => {
    if (reason.trim() && newDate && newTime) {
      onReschedule(session.sessionId, newDate, newTime, reason);
      setReason('');
      setNewDate('');
      setNewTime('');
      setActionType(null);
      onClose();
    } else {
      alert('Please fill in all fields for rescheduling');
    }
  };

  if (!actionType) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Session Actions</h3>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800">{session.subject} - {session.title}</h4>
            <p className="text-gray-600">Student: {session.studentName}</p>
            <p className="text-gray-600">{session.date} at {session.time}</p>
            <p className="text-green-600 font-medium">${session.amount}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setActionType('reschedule')}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 font-medium"
            >
              🔄 Reschedule Session
            </button>
            
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
          {actionType === 'cancel' ? 'Cancel Session' : 'Reschedule Session'}
        </h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800">{session.subject} - {session.title}</h4>
          <p className="text-gray-600">Student: {session.studentName}</p>
          <p className="text-gray-600">{session.date} at {session.time}</p>
          <p className="text-green-600 font-medium">${session.amount}</p>
        </div>

        <div className="space-y-4">
          {actionType === 'reschedule' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for {actionType === 'cancel' ? 'Cancellation' : 'Rescheduling'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Please explain why you need to ${actionType} this session...`}
            />
          </div>

          {actionType === 'cancel' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 text-sm">
                <strong>Important:</strong> Canceling this session will trigger an automatic refund to the student. 
                An email will be sent to both the student and admin for approval.
              </p>
            </div>
          )}

          {actionType === 'reschedule' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> The student will receive a notification about the reschedule request 
                and must approve the new time before it becomes final.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={actionType === 'cancel' ? handleCancel : handleReschedule}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                actionType === 'cancel'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {actionType === 'cancel' ? 'Confirm Cancellation' : 'Send Reschedule Request'}
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
