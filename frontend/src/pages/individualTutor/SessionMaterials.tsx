// import React, { useState } from 'react';

// interface Material {
//   id: number;
//   name: string;
//   type: 'document' | 'video' | 'link' | 'image';
//   url: string;
//   uploadDate: string;
// }

// interface SessionMaterialsProps {
//   sessionId: number;
//   materials: Material[];
//   onAddMaterial: (material: Omit<Material, 'id'>) => void;
//   onRemoveMaterial: (materialId: number) => void;
// }

// const SessionMaterials: React.FC<SessionMaterialsProps> = ({
//   sessionId,
//   materials,
//   onAddMaterial,
//   onRemoveMaterial
// }) => {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newMaterial, setNewMaterial] = useState({
//     name: '',
//     type: 'document' as const,
//     url: ''
//   });

//   const handleAddMaterial = () => {
//     if (newMaterial.name.trim() && newMaterial.url.trim()) {
//       onAddMaterial({
//         ...newMaterial,
//         uploadDate: new Date().toISOString().split('T')[0]
//       });
//       setNewMaterial({ name: '', type: 'document', url: '' });
//       setShowAddForm(false);
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'document': return '📄';
//       case 'video': return '🎥';
//       case 'link': return '🔗';
//       case 'image': return '🖼️';
//       default: return '📄';
//     }
//   };

//   return (
//     <div className="bg-gray-50 p-4 rounded-lg">
//       <div className="flex justify-between items-center mb-3">
//         <h4 className="font-medium text-gray-800">Session Materials</h4>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="text-blue-600 hover:text-blue-800 text-sm"
//         >
//           {showAddForm ? 'Cancel' : '+ Add Material'}
//         </button>
//       </div>

//       {showAddForm && (
//         <div className="mb-4 p-3 bg-white rounded border">
//           <div className="space-y-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Material Name
//               </label>
//               <input
//                 type="text"
//                 value={newMaterial.name}
//                 onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
//                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//                 placeholder="e.g., Calculus Chapter 5 Notes"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Type
//               </label>
//               <select
//                 value={newMaterial.type}
//                 onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
//                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//               >
//                 <option value="document">Document</option>
//                 <option value="video">Video</option>
//                 <option value="link">Link</option>
//                 <option value="image">Image</option>
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 URL/Link
//               </label>
//               <input
//                 type="url"
//                 value={newMaterial.url}
//                 onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
//                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//                 placeholder="https://drive.google.com/..."
//               />
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={handleAddMaterial}
//                 className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
//               >
//                 Add Material
//               </button>
//               <button
//                 onClick={() => setShowAddForm(false)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="space-y-2">
//         {materials.length === 0 ? (
//           <p className="text-gray-500 text-sm">No materials added yet</p>
//         ) : (
//           materials.map((material) => (
//             <div key={material.id} className="flex items-center justify-between bg-white p-3 rounded border">
//               <div className="flex items-center space-x-3">
//                 <span className="text-lg">{getTypeIcon(material.type)}</span>
//                 <div>
//                   <p className="font-medium text-gray-800 text-sm">{material.name}</p>
//                   <p className="text-gray-500 text-xs">Added on {material.uploadDate}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <a
//                   href={material.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:text-blue-800 text-sm"
//                 >
//                   View
//                 </a>
//                 <button
//                   onClick={() => onRemoveMaterial(material.id)}
//                   className="text-red-600 hover:text-red-800 text-sm"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default SessionMaterials;
