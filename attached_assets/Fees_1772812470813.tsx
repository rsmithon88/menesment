

import React, { useState, useMemo } from 'react';
import { Fee, Student, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';


interface FeesProps {
  fees: Fee[];
  students: Student[];
  addFee: (record: Omit<Fee, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateFee: (record: Fee) => void;
  deleteFee: (recordId: string) => void;
  addMultipleFees: (records: Omit<Fee, 'id'>[]) => void;
  hasPermission: (page: Page) => boolean;
  classOptions: string[];
}

const BENGALI_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const Fees: React.FC<FeesProps> = ({ fees, students, addFee, updateFee, deleteFee, addMultipleFees, hasPermission, classOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<Fee | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Fee | null>(null);
  
  const [newRecord, setNewRecord] = useState({ studentId: '', amount: '', dueDate: '', status: 'অপরিশোধিত' as 'পরিশোধিত' | 'অপরিশোধিত' | 'বকেয়া', category: '' });
  const [generateOptions, setGenerateOptions] = useState({ class: '', amount: '', category: 'মাসিক বেতন', dueDate: '' });
  const [filterClass, setFilterClass] = useState('সমস্ত');
  const [modalSelectedClass, setModalSelectedClass] = useState('');

  const studentMap = new Map<string, Student>(students.map(s => [s.id, s]));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateOptionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGenerateOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.studentId || !newRecord.amount || !newRecord.dueDate || !newRecord.category) return;
    addFee({ 
        ...newRecord, 
        amount: parseFloat(newRecord.amount)
    });
    setNewRecord({ studentId: '', amount: '', dueDate: '', status: 'অপরিশোধিত', category: '' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!recordToEdit) return;
    const { name, value } = e.target;
    setRecordToEdit({ ...recordToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;
    updateFee({ 
        ...recordToEdit, 
        amount: parseFloat(String(recordToEdit.amount))
    });
    setIsEditModalOpen(false);
    setRecordToEdit(null);
  };
  
  const handleDelete = () => {
    if (!recordToDelete) return;
    deleteFee(recordToDelete.id);
    setRecordToDelete(null);
  };

  const handleGenerateFees = (e: React.FormEvent) => {
    e.preventDefault();
    const { class: selectedClass, amount, category, dueDate } = generateOptions;
    if (!selectedClass || !amount || !category || !dueDate) {
        alert("অনুগ্রহ করে সকল তথ্য পূরণ করুন।");
        return;
    }
    
    const targetStudents = students.filter(s => s.class === selectedClass && s.status === 'active');
    
    // Check for existing fees to prevent duplicates
    const monthYear = new Date(dueDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    const existingFeesForMonth = new Set(
        fees.filter(f => f.category === category && new Date(f.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' }) === monthYear)
            .map(f => f.studentId)
    );

    const newFeesToGenerate: Omit<Fee, 'id'>[] = [];
    targetStudents.forEach(student => {
        if (!existingFeesForMonth.has(student.id)) {
            newFeesToGenerate.push({
                studentId: student.id,
                amount: parseFloat(amount),
                dueDate,
                status: 'অপরিশোধিত',
                category,
                addedBy: 'সিস্টেম',
                generatedBy: 'auto',
            });
        }
    });

    if (newFeesToGenerate.length > 0) {
      addMultipleFees(newFeesToGenerate);
    } else {
      alert("এই শ্রেণীর সকল শিক্ষার্থীর জন্য এই মাসের ফি ইতিমধ্যে তৈরি করা হয়েছে।");
    }

    setIsGenerateModalOpen(false);
    setGenerateOptions({ class: '', amount: '', category: 'মাসিক বেতন', dueDate: '' });
  };
  
  const filteredFees = useMemo(() => {
    if (filterClass === 'সমস্ত') {
        return fees;
    }
    return fees.filter(fee => {
        const student = studentMap.get(fee.studentId);
        return student && student.class === filterClass;
    });
  }, [fees, filterClass, studentMap]);

  const studentsForModal = useMemo(() => {
    if (!modalSelectedClass) {
        return [];
    }
    return students.filter(s => s.class === modalSelectedClass);
  }, [students, modalSelectedClass]);

  const openAddModal = () => {
    setNewRecord({ studentId: '', amount: '', dueDate: '', status: 'অপরিশোধিত', category: '' });
    setModalSelectedClass('');
    setIsModalOpen(true);
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">ফি-এর রেকর্ড</h2>
        <div className="flex items-center space-x-4">
            <div>
                <label htmlFor="classFilter" className="sr-only">শ্রেণী অনুযায়ী ফিল্টার</label>
                <select
                    id="classFilter"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                    <option value="সমস্ত">সমস্ত শ্রেণী</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            {hasPermission('ফি ব্যবস্থাপনা') && (
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsGenerateModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                        মাসিক ফি তৈরি করুন
                    </button>
                    <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap">
                        ফি রেকর্ড যোগ করুন
                    </button>
                </div>
            )}
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থীর নাম</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শ্রেণী</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শেষ তারিখ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থা</th>
              {hasPermission('ফি ব্যবস্থাপনা') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFees.map(record => {
              const student = studentMap.get(record.studentId);
              const isDue = record.status === 'অপরিশোধিত' || record.status === 'বকেয়া';
              return (
              <tr key={record.id} className={isDue ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student?.name || 'অজানা'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.class || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳{record.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'পরিশোধিত' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status}
                    </span>
                </td>
                 {hasPermission('ফি ব্যবস্থাপনা') && (
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
            )})}
          </tbody>
        </table>
      </div>

      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">স্বয়ংক্রিয়ভাবে মাসিক ফি তৈরি করুন</h3>
                    <button onClick={() => setIsGenerateModalOpen(false)}><XIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleGenerateFees} className="space-y-4">
                    <select name="class" value={generateOptions.class} onChange={handleGenerateOptionsChange} className="w-full px-4 py-2 border rounded-lg" required>
                        <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                        {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" name="category" value={generateOptions.category} onChange={handleGenerateOptionsChange} placeholder="ফি-এর ধরণ" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="number" name="amount" value={generateOptions.amount} onChange={handleGenerateOptionsChange} placeholder="পরিমাণ" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="date" name="dueDate" value={generateOptions.dueDate} onChange={handleGenerateOptionsChange} className="w-full px-4 py-2 border rounded-lg" required />
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">তৈরি করুন</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ফি রেকর্ড যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <select 
                    value={modalSelectedClass} 
                    onChange={(e) => {
                        setModalSelectedClass(e.target.value);
                        setNewRecord(prev => ({ ...prev, studentId: '' }));
                    }}
                    className="w-full px-4 py-2 border rounded-lg" 
                    required
                >
                    <option value="" disabled>প্রথমে শ্রেণী নির্বাচন করুন</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

               <select name="studentId" value={newRecord.studentId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required disabled={!modalSelectedClass}>
                  <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                  {studentsForModal.map(s => <option key={s.id} value={s.id}>{s.name} - রোল {s.rollNumber}</option>)}
               </select>

                <select 
                    onChange={(e) => {
                        const month = e.target.value;
                        setNewRecord(prev => ({
                            ...prev,
                            category: month ? `${month} মাসের বেতন` : ''
                        }));
                    }} 
                    className="w-full px-4 py-2 border rounded-lg"
                >
                    <option value="">মাস নির্বাচন করুন (ঐচ্ছিক)</option>
                    {BENGALI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

               <input type="text" name="category" value={newRecord.category} onChange={handleInputChange} placeholder="ফি-এর ধরণ (যেমন, মাসিক ফি)" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="number" name="amount" value={newRecord.amount} onChange={handleInputChange} placeholder="পরিমাণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="date" name="dueDate" value={newRecord.dueDate} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
               <select name="status" value={newRecord.status} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="অপরিশোধিত">অপরিশোধিত</option>
                  <option value="পরিশোধিত">পরিশোধিত</option>
                  <option value="বকেয়া">বকেয়া</option>
               </select>
               <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">রেকর্ড যোগ করুন</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && recordToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ফি রেকর্ড সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
               <select name="studentId" value={recordToEdit.studentId} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.class}</option>)}
               </select>
               <input type="text" name="category" value={recordToEdit.category} onChange={handleEditInputChange} placeholder="ফি-এর ধরণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="number" name="amount" value={recordToEdit.amount} onChange={handleEditInputChange} placeholder="পরিমাণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="date" name="dueDate" value={recordToEdit.dueDate} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required />
               <select name="status" value={recordToEdit.status} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="অপরিশোধিত">অপরিশোধিত</option>
                  <option value="পরিশোধিত">পরিশোধিত</option>
                  <option value="বকেয়া">বকেয়া</option>
               </select>
               <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">আপডেট করুন</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই ফি রেকর্ডটি মুছে ফেলতে চান?</p>
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

export default Fees;