import React, { useState } from 'react';
import { TimetableEntry, Teacher, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface TimetableProps {
  timetable: TimetableEntry[];
  teachers: Teacher[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateTimetableEntry: (entry: TimetableEntry) => void;
  deleteTimetableEntry: (entryId: string) => void;
  hasPermission: (page: Page) => boolean;
  classOptions: string[];
}

const Timetable: React.FC<TimetableProps> = ({ timetable, teachers, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, hasPermission, classOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<TimetableEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);

  const [newEntry, setNewEntry] = useState<Omit<TimetableEntry, 'id' | 'addedBy' | 'lastModifiedBy'>>({
      day: 'সোমবার', time: '', subject: '', teacherId: '', class: ''
  });
  
  const teacherMap = new Map(teachers.map(t => [t.id, t.name]));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const setter = isEditModalOpen ? setEntryToEdit : setNewEntry;
    setter((prev: any) => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.time || !newEntry.subject || !newEntry.teacherId || !newEntry.class) return;
    addTimetableEntry(newEntry);
    setNewEntry({ day: 'সোমবার', time: '', subject: '', teacherId: '', class: '' });
    setIsModalOpen(false);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryToEdit) return;
    updateTimetableEntry(entryToEdit);
    setIsEditModalOpen(false);
    setEntryToEdit(null);
  };
  
  const handleDelete = () => {
    if (!entryToDelete) return;
    deleteTimetableEntry(entryToDelete.id);
    setEntryToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">সাপ্তাহিক সময়সূচী</h2>
        {hasPermission('সময়সূচী') && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            নতুন এন্ট্রি
            </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">দিন</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সময়</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বিষয়</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষক</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শ্রেণী</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
              {hasPermission('সময়সূচী') && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timetable.sort((a,b) => a.time.localeCompare(b.time)).map(entry => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.day}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacherMap.get(entry.teacherId) || 'অজানা'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.lastModifiedBy || entry.addedBy}</td>
                {hasPermission('সময়সূচী') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => { setEntryToEdit(entry); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setEntryToDelete(entry)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
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

      {(isModalOpen || (isEditModalOpen && entryToEdit)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{isEditModalOpen ? 'এন্ট্রি সম্পাদনা' : 'সময়সূচীতে নতুন এন্ট্রি'}</h3>
              <button onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-4">
                <select name="day" value={isEditModalOpen ? entryToEdit!.day : newEntry.day} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                    <option>সোমবার</option><option>মঙ্গলবার</option><option>বুধবার</option><option>বৃহস্পতিবার</option><option>শুক্রবার</option>
                </select>
                <input type="time" name="time" value={isEditModalOpen ? entryToEdit!.time : newEntry.time} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="subject" value={isEditModalOpen ? entryToEdit!.subject : newEntry.subject} onChange={handleInputChange} placeholder="বিষয়" className="w-full px-4 py-2 border rounded-lg" required />
                <select name="class" value={isEditModalOpen ? entryToEdit!.class : newEntry.class} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="teacherId" value={isEditModalOpen ? entryToEdit!.teacherId : newEntry.teacherId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>শিক্ষক নির্বাচন করুন</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{isEditModalOpen ? 'আপডেট করুন' : 'যোগ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই সময়সূচী এন্ট্রিটি মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setEntryToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;