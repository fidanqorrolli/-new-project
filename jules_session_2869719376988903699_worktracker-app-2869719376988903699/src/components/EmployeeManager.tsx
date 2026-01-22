import { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Trash2, Edit2, Plus, X, Save } from 'lucide-react';

export const EmployeeManager = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleEdit = (emp: { id: string, firstName: string, lastName: string }) => {
    setEditingId(emp.id);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFirstName('');
    setLastName('');
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    
    if (isAdding) {
      addEmployee(firstName, lastName);
      setIsAdding(false);
    } else if (editingId) {
      updateEmployee(editingId, firstName, lastName);
      setEditingId(null);
    }
    setFirstName('');
    setLastName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee? This will also remove all their attendance records.')) {
        deleteEmployee(id);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Manage Employees</h3>
        {!isAdding && !editingId && (
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      <div className="p-6">
        {(isAdding || editingId) && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
             <h4 className="font-medium mb-4 text-sm uppercase tracking-wide text-gray-500">{isAdding ? 'Add New Employee' : 'Edit Employee'}</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                   <input 
                     type="text" 
                     value={firstName} 
                     onChange={e => setFirstName(e.target.value)}
                     className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                   <input 
                     type="text" 
                     value={lastName} 
                     onChange={e => setLastName(e.target.value)}
                     className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                   />
                </div>
             </div>
             <div className="mt-4 flex justify-end gap-2">
               <button 
                 onClick={() => { setIsAdding(false); setEditingId(null); }}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
               >
                 <X className="w-4 h-4" /> Cancel
               </button>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
               >
                 <Save className="w-4 h-4" /> Save
               </button>
             </div>
          </div>
        )}

        <div className="space-y-4">
           {employees.length === 0 ? (
               <div className="text-center text-gray-500 py-4">No employees found.</div>
           ) : (
               employees.map(emp => (
                 <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                         {emp.firstName[0]}{emp.lastName[0]}
                       </div>
                       <div>
                          <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => handleEdit(emp)}
                         className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-full transition-colors"
                         title="Edit"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(emp.id)}
                         className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                         title="Delete"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))
           )}
        </div>
      </div>
    </div>
  );
};
