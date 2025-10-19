import React, { useEffect, useState } from 'react';
import { CalendarDays, Paperclip, FileText, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface Material {
  material_id: string;
  name: string;
  url: string;
  slot_id: string;
  class_id: string;
  class_title: string;
  class_subject: string;
  slot_date: Date;
  uploaded_at: Date;
  material_index: number;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getAllMaterials();
      setMaterials(data);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (material: Material) => {
    if (!window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }

    try {
      setDeleting(material.material_id);
      await massTutorAPI.deleteMaterial(material.slot_id, material.material_index);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast.error(error.response?.data?.error || 'Failed to delete material');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.class_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.class_subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
        <p className="text-gray-500 mt-1">View and manage all uploaded materials across your classes</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search materials by name, class, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading materials...</p>
          </div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-1">
            {searchQuery ? 'No materials found' : 'No materials uploaded yet'}
          </p>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try a different search term'
              : 'Materials you upload to class sessions will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.material_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Paperclip className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{material.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{material.class_title}</p>
                        <p className="text-xs text-gray-500">{material.class_subject}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {formatDate(material.slot_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(material.uploaded_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />View
                        </a>
                        <button onClick={() => handleDelete(material)} disabled={deleting === material.material_id} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {deleting === material.material_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && materials.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-blue-700 font-medium">Total Materials</p><p className="text-2xl font-bold text-blue-900">{materials.length}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center"><Paperclip className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-purple-700 font-medium">Unique Classes</p><p className="text-2xl font-bold text-purple-900">{new Set(materials.map(m => m.class_id)).size}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center"><CalendarDays className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-green-700 font-medium">Sessions Covered</p><p className="text-2xl font-bold text-green-900">{new Set(materials.map(m => m.slot_id)).size}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
