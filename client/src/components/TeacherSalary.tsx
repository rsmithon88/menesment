import React, { useState, useMemo } from 'react';
import { TeacherSalary as TeacherSalaryType, Teacher, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface TeacherSalaryProps {
  salaries: TeacherSalaryType[];
  teachers: Teacher[];
  addSalary: (salary: Omit<TeacherSalaryType, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateSalary: (salary: TeacherSalaryType) => void;
  deleteSalary: (salaryId: string) => void;
  hasPermission: (page: Page) => boolean;
}

const BENGALI_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

const TeacherSalary: React.FC<TeacherSalaryProps> = ({ salaries, teachers, addSalary, updateSalary, deleteSalary, hasPermission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [salaryToEdit, setSalaryToEdit] = useState<TeacherSalaryType | null>(null);
  const [salaryToDelete, setSalaryToDelete] = useState<TeacherSalaryType | null>(null);

  const initialNewSalaryState = { teacherId: '', amount: '', month: BENGALI_MONTHS[new Date().getMonth()], year: currentYear, status: 'অপরিশোধিত' as 'অপরিশোধিত' | 'পরিশোধিত', paymentDate: undefined };
  const [newSalary, setNewSalary] = useState(initialNewSalaryState);

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const stateSetter = isEditModalOpen ? setSalaryToEdit : setNewSalary;

    stateSetter((prev: any) => {
        if (!prev) return null;
        const updatedState = { ...prev, [name]: value };
        if (name === 'status' && value === 'পরিশোধিত' && !prev.paymentDate) {
            updatedState.paymentDate = new Date().toISOString().split('T')[0];
        } else if (name === 'status' && value === 'অপরিশোধিত') {
            updatedState.paymentDate = undefined;
        }
        return updatedState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalary.teacherId || !newSalary.amount || !newSalary.month || !newSalary.year) return;
    addSalary({
      ...newSalary,
      amount: parseFloat(newSalary.amount),
      year: parseInt(String(newSalary.year)),
    });
    setNewSalary(initialNewSalaryState);
    setIsModalOpen(false);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryToEdit) return;
    updateSalary({
      ...salaryToEdit,
      amount: parseFloat(String(salaryToEdit.amount)),
      year: parseInt(String(salaryToEdit.year)),
    });
    setIsEditModalOpen(false);
    setSalaryToEdit(null);
  };
  
  const handleDelete = () => {
    if (!salaryToDelete) return;
    deleteSalary(salaryToDelete.id);
    setSalaryToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">শিক্ষকদের বেতন</h2>
        {hasPermission('শিক্ষকদের বেতন') && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            বেতন যোগ করুন
            </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষকের নাম</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মাস/বছর</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ (৳)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরিশোধের তারিখ</th>
              {hasPermission('শিক্ষকদের বেতন') && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salaries.map(salary => (
              <tr key={salary.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacherMap.get(salary.teacherId) || 'অজানা শিক্ষক'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salary.month}, {salary.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-mono">{salary.amount.toLocaleString('bn-BD')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${salary.status === 'পরিশোধিত' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {salary.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString('bn-BD') : '-'}</td>
                {hasPermission('শিক্ষকদের বেতন') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => { setSalaryToEdit(salary); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setSalaryToDelete(salary)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
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

      {(isModalOpen || (isEditModalOpen && salaryToEdit)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{isEditModalOpen ? 'বেতন সম্পাদনা করুন' : 'নতুন বেতন যোগ করুন'}</h3>
              <button onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">শিক্ষক</label>
                        <select name="teacherId" value={isEditModalOpen ? salaryToEdit!.teacherId : newSalary.teacherId} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" required>
                            <option value="" disabled>শিক্ষক নির্বাচন করুন</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">বেতনের পরিমাণ</label>
                        <input type="number" name="amount" value={isEditModalOpen ? salaryToEdit!.amount : newSalary.amount} onChange={handleInputChange} placeholder="পরিমাণ" className="w-full mt-1 px-4 py-2 border rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">মাস</label>
                        <select name="month" value={isEditModalOpen ? salaryToEdit!.month : newSalary.month} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" required>
                            {BENGALI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">বছর</label>
                        <select name="year" value={isEditModalOpen ? salaryToEdit!.year : newSalary.year} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" required>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">স্ট্যাটাস</label>
                        <select name="status" value={isEditModalOpen ? salaryToEdit!.status : newSalary.status} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" required>
                            <option value="অপরিশোধিত">অপরিশোধিত</option>
                            <option value="পরিশোধিত">পরিশোধিত</option>
                        </select>
                    </div>
                     {(isEditModalOpen ? salaryToEdit!.status : newSalary.status) === 'পরিশোধিত' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">পরিশোধের তারিখ</label>
                            <input type="date" name="paymentDate" value={(isEditModalOpen ? salaryToEdit!.paymentDate : newSalary.paymentDate) || ''} onChange={handleInputChange} className="w-full mt-1 px-4 py-2 border rounded-lg" required />
                        </div>
                     )}
               </div>
               <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{isEditModalOpen ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {salaryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই বেতনের রেকর্ডটি মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setSalaryToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSalary;