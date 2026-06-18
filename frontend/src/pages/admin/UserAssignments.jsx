import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldX, AlertTriangle, Filter, Search, AlertCircle, X } from 'lucide-react';

const UserAssignments = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Changed from multiple checkboxes to a single string value for mutually exclusive selection
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  
  // Toast notification state
  const [toast, setToast] = useState({ isOpen: false, message: '' });

  // Modal state structure
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    facultyId: null,
    facultyName: '',
    role: '',
    actionType: '' // 'assign' | 'revoke'
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        setToast({ isOpen: false, message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.isOpen]);

  const fetchFaculties = () => {
    fetch('/api/faculty')
      .then((res) => res.json())
      .then((data) => {
        const facultyArray = Array.isArray(data) ? data : (data.faculties || data.data || []);
        setFaculties(facultyArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching directory:', err);
        setLoading(false);
      });
  };

  const showWarning = (message) => {
    setToast({ isOpen: true, message });
  };

  const initiateToggleRole = (faculty, roleToToggle, currentRoles) => {
    const hasRole = currentRoles.includes(roleToToggle);
    
    // Guard Clause: Prevent a single faculty from occupying both HOD and Coordinator positions
    if (!hasRole) {
      if (roleToToggle === 'hod' && currentRoles.includes('coordinator')) {
        showWarning(`Operation Denied: ${faculty.name} is already a Coordinator. A user cannot be both an HOD and a Coordinator.`);
        return;
      }
      if (roleToToggle === 'coordinator' && currentRoles.includes('hod')) {
        showWarning(`Operation Denied: ${faculty.name} is already an HOD. A user cannot be both an HOD and a Coordinator.`);
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      facultyId: faculty._id,
      facultyName: faculty.name,
      role: roleToToggle,
      actionType: hasRole ? 'revoke' : 'assign'
    });
  };

  const handleExecuteToggle = async () => {
    const { facultyId, role, actionType } = confirmModal;
    const targetedFaculty = faculties.find((f) => f._id === facultyId);
    if (!targetedFaculty) return;

    const currentRoles = targetedFaculty.roles || ['faculty'];
    
    let updatedRoles = actionType === 'revoke'
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    if (updatedRoles.length === 0) updatedRoles.push('faculty');

    try {
      const response = await fetch(`/api/faculty/${facultyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: updatedRoles }),
      });

      if (response.ok) {
        setFaculties((prev) =>
          prev.map((f) => (f._id === facultyId ? { ...f, roles: updatedRoles } : f))
        );
      }
    } catch (error) {
      console.error('Failed processing access modification request:', error);
    } finally {
      setConfirmModal({ isOpen: false, facultyId: null, facultyName: '', role: '', actionType: '' });
    }
  };

  // Filter and Search computation layer (Refactored for Exclusive Radio Selection)
  const filteredFaculties = faculties.filter((faculty) => {
    const assignedRoles = faculty.roles || ['faculty'];
    
    let matchesRole = true;
    if (selectedRoleFilter !== 'all') {
      if (selectedRoleFilter === 'faculty') {
        // Strict check: baseline faculty shouldn't possess elevated access credentials
        matchesRole = assignedRoles.includes('faculty') && 
                      !assignedRoles.includes('coordinator') && 
                      !assignedRoles.includes('hod');
      } else {
        matchesRole = assignedRoles.includes(selectedRoleFilter);
      }
    }

    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm font-bold uppercase tracking-wider text-slate-400 animate-pulse">
          Loading Assignment Control Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Notification Element */}
      {toast.isOpen && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-slate-950 text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start space-x-3 animate-slideIn">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-black uppercase tracking-wider text-amber-500">Conflict </h5>
            <p className="text-[11px] font-medium text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast({ isOpen: false, message: '' })}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">User Assignments Control Panel</h3>
            <p className="text-xs text-slate-400 mt-0.5">Modify workspace authorization levels by designating or revoking operational roles.</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name..."
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Radio Button Filtering Section */}
        <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-2 text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-wider">Role-Based Filter:</span>
          </div>
          
          <div className="flex flex-wrap gap-5 items-center">
            {['all', 'faculty', 'coordinator', 'hod'].map((role) => (
              <label key={role} className="inline-flex items-center space-x-2 cursor-pointer select-none group">
                <input
                  type="radio"
                  name="roleFilter"
                  value={role}
                  checked={selectedRoleFilter === role}
                  onChange={() => setSelectedRoleFilter(role)}
                  className="w-4 h-4 border-slate-300 text-indigo-600 focus:ring-indigo-500/30 transition-all cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-slate-900 transition-colors">
                  {role === 'all' ? 'All Users' : role === 'hod' ? 'HOD' : role}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Faculty Member</th>
                <th className="px-6 py-4">Department Space</th>
                <th className="px-6 py-4">Authorization State</th>
                <th className="px-6 py-4 text-right">Alter Assignments</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
              {filteredFaculties.map((faculty) => {
                const assignedRoles = faculty.roles || ['faculty'];
                const isCoordinator = assignedRoles.includes('coordinator');
                const isHOD = assignedRoles.includes('hod');

                return (
                  <tr key={faculty._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{faculty.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">ID: {faculty.facultyId}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide">
                      {faculty.department || 'CSE'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {assignedRoles.map((role) => (
                          <span
                            key={role}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                              role === 'hod' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              role === 'coordinator' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {role === 'hod' ? 'HOD' : role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => initiateToggleRole(faculty, 'coordinator', assignedRoles)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all border ${
                          isCoordinator
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-md shadow-blue-600/10'
                        }`}
                      >
                        {isCoordinator ? (
                          <><ShieldX className="w-3.5 h-3.5" /><span>Revoke Coordinator Role</span></>
                        ) : (
                          <><UserCheck className="w-3.5 h-3.5" /><span>Assign Coordinator Role</span></>
                        )}
                      </button>

                      <button
                        onClick={() => initiateToggleRole(faculty, 'hod', assignedRoles)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all border ${
                          isHOD
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-purple-600 text-white border-transparent hover:bg-purple-700 shadow-md shadow-purple-600/10'
                        }`}
                      >
                        {isHOD ? (
                          <><ShieldX className="w-3.5 h-3.5" /><span>Revoke HOD Role</span></>
                        ) : (
                          <><UserCheck className="w-3.5 h-3.5" /><span>Assign HOD Role</span></>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredFaculties.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    No faculty records match your search query or role filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal Container */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 transition-all">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                confirmModal.actionType === 'revoke' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Confirm Assignment Action</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to <span className="font-bold text-slate-800">{confirmModal.actionType}</span> the role of{' '}
                  <span className="font-extrabold uppercase text-slate-900 px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                    {confirmModal.role === 'hod' ? 'HOD' : confirmModal.role}
                  </span>{' '}
                  for <span className="font-bold text-slate-800">{confirmModal.facultyName}</span>?
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">This workspace modification initializes context alterations immediately across dependent portals.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, facultyId: null, facultyName: '', role: '', actionType: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteToggle}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm ${
                  confirmModal.actionType === 'revoke' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                }`}
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssignments;