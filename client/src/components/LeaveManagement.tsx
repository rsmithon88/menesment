import React, { useState, useMemo } from 'react';
import { LeaveRequest, Teacher, LoggedInUser } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface LeaveManagementProps {
  currentUser: LoggedInUser;
  teachers: Teacher[];
  leaves: LeaveRequest[];
  addLeave: (leave: Omit<LeaveRequest, 'id' | 'reviewedBy' | 'reviewDate'>) => Promise<void>;
  updateLeave: (leave: LeaveRequest) => Promise<void>;
  deleteLeave: (leaveId: string) => Promise<void>;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ currentUser, leaves, addLeave, updateLeave, deleteLeave }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [leaveToEdit, setLeaveToEdit] = useState<LeaveRequest | null>(null);
    const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
    
    const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', reason: '' });
    const [filter, setFilter] = useState<'all' | 'বিচারাধীন' | 'অনুমোদিত' | 'প্রত্যাখ্যাত'>('all');

    const sortedLeaves = useMemo(() => {
        const source = (currentUser.role === 'admin' || currentUser.role === 'super_admin')
            ? leaves 
            : leaves.filter(l => l.teacherId === currentUser.id);
        
        return source.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    }, [leaves, currentUser]);

    const filteredLeaves = useMemo(() => {
        if (filter === 'all') return sortedLeaves;
        return sortedLeaves.filter(l => l.status === filter);
    }, [sortedLeaves, filter]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewLeave(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
        if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
            alert("শেষ তারিখ শুরুর তারিখের আগে হতে পারে না।");
            return;
        }
        await addLeave({
            teacherId: currentUser.id,
            teacherName: currentUser.name,
            ...newLeave,
            status: 'বিচারাধীন',
            appliedDate: new Date().toISOString().split('T')[0],
        });
        setNewLeave({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', reason: '' });
        setIsAddModalOpen(false);
    };
    
    const openEditModal = (leave: LeaveRequest) => {
        setLeaveToEdit(leave);
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!leaveToEdit) return;
        const { name, value } = e.target;
        setLeaveToEdit(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leaveToEdit) return;
        if (new Date(leaveToEdit.startDate) > new Date(leaveToEdit.endDate)) {
            alert("শেষ তারিখ শুরুর তারিখের আগে হতে পারে না।");
            return;
        }
        await updateLeave({
            ...leaveToEdit,
            reviewedBy: currentUser.name,
            reviewDate: new Date().toISOString().split('T')[0],
        });
        setIsEditModalOpen(false);
        setLeaveToEdit(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (!leaveToDelete) return;
        await deleteLeave(leaveToDelete.id);
        setLeaveToDelete(null);
    };

    const handleStatusChange = async (leave: LeaveRequest, newStatus: 'অনুমোদিত' | 'প্রত্যাখ্যাত') => {
        if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') return;
        await updateLeave({
            ...leave,
            status: newStatus,
            reviewedBy: currentUser.name,
            reviewDate: new Date().toISOString().split('T')[0],
        });
    };

    const getStatusBadge = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'অনুমোদিত': return 'bg-green-100 text-green-800';
            case 'প্রত্যাখ্যাত': return 'bg-red-100 text-red-800';
            case 'বিচারাধীন': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">ছুটির আবেদন ব্যবস্থাপনা</h2>
        {currentUser.role === 'teacher' && (
            <button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            ছুটির জন্য আবেদন করুন
            </button>
        )}
      </div>

       {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
        <div className="mb-4 flex flex-wrap gap-2">
            {(['all', 'বিচারাধীন', 'অনুমোদিত', 'প্রত্যাখ্যাত'] as const).map(f => (
                <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-sm font-medium rounded-full ${filter === f ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                   {f === 'all' ? 'সকল' : f}
                </button>
            ))}
        </div>
       )}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষকের নাম</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">আবেদনের তারিখ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ছুটির সময়কাল</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কারণ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
              {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeaves.map(leave => (
              <tr key={leave.id}>
                {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.teacherName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.appliedDate).toLocaleDateString('bn-BD')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString('bn-BD')} - {new Date(leave.endDate).toLocaleDateString('bn-BD')}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                    </span>
                </td>
                {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                            {leave.status === 'বিচারাধীন' && (
                                <>
                                    <button onClick={() => handleStatusChange(leave, 'অনুমোদিত')} className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600">অনুমোদন</button>
                                    <button onClick={() => handleStatusChange(leave, 'প্রত্যাখ্যাত')} className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600">প্রত্যাখ্যান</button>
                                </>
                            )}
                             <button onClick={() => openEditModal(leave)} className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-gray-100 rounded-full" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setLeaveToDelete(leave)} className="p-1 text-red-600 hover:text-red-900 hover:bg-gray-100 rounded-full" title="মুছে ফেলুন">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ছুটির জন্য আবেদন</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800"><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">শুরুর তারিখ</label>
                      <input type="date" id="startDate" name="startDate" value={newLeave.startDate} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                   <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">শুরুর সময়</label>
                      <input type="time" id="startTime" name="startTime" value={newLeave.startTime} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">শেষ তারিখ</label>
                      <input type="date" id="endDate" name="endDate" value={newLeave.endDate} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                   <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">শেষ সময়</label>
                      <input type="time" id="endTime" name="endTime" value={newLeave.endTime} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">কারণ</label>
                  <textarea name="reason" rows={4} value={newLeave.reason} onChange={handleInputChange} placeholder="ছুটির কারণ সংক্ষেপে লিখুন" className="mt-1 w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আবেদন জমা দিন</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isEditModalOpen && leaveToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ছুটির আবেদন সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800"><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">শুরুর তারিখ</label>
                      <input type="date" id="startDate" name="startDate" value={leaveToEdit.startDate} onChange={handleEditInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                   <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">শুরুর সময়</label>
                      <input type="time" id="startTime" name="startTime" value={leaveToEdit.startTime} onChange={handleEditInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">শেষ তারিখ</label>
                      <input type="date" id="endDate" name="endDate" value={leaveToEdit.endDate} onChange={handleEditInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                   <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">শেষ সময়</label>
                      <input type="time" id="endTime" name="endTime" value={leaveToEdit.endTime} onChange={handleEditInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">কারণ</label>
                  <textarea name="reason" rows={4} value={leaveToEdit.reason} onChange={handleEditInputChange} placeholder="ছুটির কারণ সংক্ষেপে লিখুন" className="mt-1 w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আপডেট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {leaveToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই ছুটির আবেদনটি মুছে ফেলতে চান? এই প্রক্রিয়াটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setLeaveToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
};

export default LeaveManagement;