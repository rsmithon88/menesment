import React, { useState } from 'react';
import { Attendance as AttendanceType, Student, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface AttendanceProps {
  attendance: AttendanceType[];
  students: Student[];
  addAttendance: (record: Omit<AttendanceType, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateAttendance: (record: AttendanceType) => void;
  deleteAttendance: (recordId: string) => void;
  hasPermission: (page: Page) => boolean;
}

const Attendance: React.FC<AttendanceProps> = ({ attendance, students, addAttendance, updateAttendance, deleteAttendance, hasPermission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<AttendanceType | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceType | null>(null);

  const [newRecord, setNewRecord] = useState({ studentId: '', date: '', status: 'উপস্থিত' as 'উপস্থিত' | 'অনুপস্থিত' | 'বিলম্ব' });

  const studentMap = new Map(students.map(s => [s.id, s.name]));

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.studentId || !newRecord.date) return;
    addAttendance({ ...newRecord });
    setNewRecord({ studentId: '', date: '', status: 'উপস্থিত' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (!recordToEdit) return;
    const { name, value } = e.target;
    setRecordToEdit({ ...recordToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;
    updateAttendance({ ...recordToEdit });
    setIsEditModalOpen(false);
    setRecordToEdit(null);
  };
  
  const handleDelete = () => {
    if (!recordToDelete) return;
    deleteAttendance(recordToDelete.id);
    setRecordToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">হাজিরার রেকর্ড</h2>
        {hasPermission('হাজিরা') && (
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            হাজিরা নিন
          </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থীর নাম</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থা</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
              {hasPermission('হাজিরা') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map(record => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{studentMap.get(record.studentId) || 'অজানা শিক্ষার্থী'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.lastModifiedBy || record.addedBy}</td>
                 {hasPermission('হাজিরা') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => { setRecordToEdit(record); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setRecordToDelete(record)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">হাজিরা নিন</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <select name="studentId" value={newRecord.studentId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="date" name="date" value={newRecord.date} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                <select name="status" value={newRecord.status} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="উপস্থিত">উপস্থিত</option>
                    <option value="অনুপস্থিত">অনুপস্থিত</option>
                    <option value="বিলম্ব">বিলম্ব</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">রেকর্ড সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isEditModalOpen && recordToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">হাজিরা সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <select name="studentId" value={recordToEdit.studentId} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="date" name="date" value={recordToEdit.date} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                <select name="status" value={recordToEdit.status} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="উপস্থিত">উপস্থিত</option>
                    <option value="অনুপস্থিত">অনুপস্থিত</option>
                    <option value="বিলম্ব">বিলম্ব</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আপডেট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই হাজিরার রেকর্ডটি মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setRecordToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;