import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface RateLimit {
  maxHourlyRate: number;
  currency: string;
  lastUpdated: string;
}

interface Policy {
  id: string;
  title: string;
  type: 'tos' | 'privacy' | 'guidelines' | 'conduct' | 'rates';
  content: string;
  lastUpdated: string;
  version: string;
  isActive: boolean;
  rateLimit?: RateLimit;
}

export default function Policies() {
  const [selectedPolicy, setSelectedPolicy] = useState<'tos' | 'privacy' | 'guidelines' | 'conduct' | 'rates'>('tos');
  const [editMode, setEditMode] = useState(false);
  
  // Mock data - replace with actual API calls
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '5',
      title: 'Tutor Rate Limits',
      type: 'rates',
      content: 'Configure the maximum hourly rates that tutors can charge on our platform.',
      lastUpdated: '2025-09-08',
      version: '1.0',
      isActive: true,
      rateLimit: {
        maxHourlyRate: 150,
        currency: 'USD',
        lastUpdated: '2025-09-08'
      }
    },
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
              {selectedPolicy === 'rates' ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Tutor Rate Configuration</h3>
                    <p className="text-sm text-blue-600 mb-4">
                      Set the maximum hourly rate that tutors can charge on the platform.
                      This helps ensure fair pricing and accessibility for students.
                    </p>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label htmlFor="maxRate" className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Hourly Rate
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="maxRate"
                            id="maxRate"
                            disabled={!editMode}
                            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            value={currentPolicy?.rateLimit?.maxHourlyRate || 0}
                            onChange={(e) => {
                              const newRate = parseFloat(e.target.value);
                              setPolicies(policies.map(p =>
                                p.type === 'rates'
                                  ? {
                                      ...p,
                                      rateLimit: {
                                        ...p.rateLimit!,
                                        maxHourlyRate: newRate,
                                        lastUpdated: new Date().toISOString().split('T')[0]
                                      }
                                    }
                                  : p
                              ));
                            }}
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">USD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Limit History</h3>
                      <div className="flow-root">
                        <ul role="list" className="-mb-8">
                          <li>
                            <div className="relative pb-8">
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                              <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 py-0">
                                  <div className="text-sm leading-8 text-gray-500">
                                    Maximum rate updated to <span className="font-medium text-gray-900">${currentPolicy?.rateLimit?.maxHourlyRate} USD</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    <time dateTime={currentPolicy?.rateLimit?.lastUpdated}>
                                      {new Date(currentPolicy?.rateLimit?.lastUpdated || '').toLocaleDateString()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                editMode ? (
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
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
