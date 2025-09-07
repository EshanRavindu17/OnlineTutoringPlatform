import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Policy {
  id: string;
  title: string;
  type: 'tos' | 'privacy' | 'guidelines' | 'conduct';
  content: string;
  lastUpdated: string;
  version: string;
  isActive: boolean;
}

export default function Policies() {
  const [selectedPolicy, setSelectedPolicy] = useState<'tos' | 'privacy' | 'guidelines' | 'conduct'>('tos');
  const [editMode, setEditMode] = useState(false);
  
  // Mock data - replace with actual API calls
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      title: 'Terms of Service',
      type: 'tos',
      content: 'These Terms of Service ("Terms") govern your access to and use of Tutorly...',
      lastUpdated: '2025-08-15',
      version: '2.1',
      isActive: true
    },
    {
      id: '2',
      title: 'Privacy Policy',
      type: 'privacy',
      content: 'At Tutorly, we take your privacy seriously. This Privacy Policy explains how we collect...',
      lastUpdated: '2025-08-10',
      version: '1.8',
      isActive: true
    },
    {
      id: '3',
      title: 'Community Guidelines',
      type: 'guidelines',
      content: 'Our community guidelines ensure a safe and productive learning environment...',
      lastUpdated: '2025-09-01',
      version: '3.2',
      isActive: true
    },
    {
      id: '4',
      title: 'Code of Conduct',
      type: 'conduct',
      content: 'The Tutorly Code of Conduct outlines the expected behavior of all participants...',
      lastUpdated: '2025-08-20',
      version: '2.0',
      isActive: true
    }
  ]);

  const currentPolicy = policies.find(p => p.type === selectedPolicy);
  const [editedContent, setEditedContent] = useState(currentPolicy?.content || '');

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save policy changes
      setPolicies(policies.map(p => 
        p.type === selectedPolicy 
          ? { ...p, content: editedContent, lastUpdated: new Date().toISOString().split('T')[0] }
          : p
      ));
      setEditMode(false);
      toast.success('Policy updated successfully');
    } catch (error) {
      toast.error('Failed to update policy');
    }
  };

  const handlePublish = async (policyId: string) => {
    try {
      // TODO: Implement API call to publish policy
      toast.success('Policy published successfully');
    } catch (error) {
      toast.error('Failed to publish policy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">System Policies</h1>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Edit Policy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Policy Types</h2>
            </div>
            <div className="p-2">
              {policies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => {
                    setSelectedPolicy(policy.type);
                    setEditMode(false);
                    setEditedContent(policy.content);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedPolicy === policy.type
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{policy.title}</div>
                  <div className="text-sm text-gray-500">
                    v{policy.version} • Updated {policy.lastUpdated}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handlePublish(currentPolicy?.id || '')}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
              >
                Publish Latest Version
              </button>
              <button
                onClick={() => {/* TODO: Implement */}}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
              >
                View Change History
              </button>
              <button
                onClick={() => {/* TODO: Implement */}}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
              >
                Download PDF Version
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{currentPolicy?.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Version {currentPolicy?.version} • Last updated on {currentPolicy?.lastUpdated}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    currentPolicy?.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentPolicy?.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[600px] p-4 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700">
                    {currentPolicy?.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
