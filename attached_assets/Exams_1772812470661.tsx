import React, { useState, useMemo } from 'react';
import { Exam, Course, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon, EXAM_NAME_OPTIONS } from '../constants';

interface ExamsProps {
  exams: Exam[];
  courses: Course[];
  addExam: (exam: Omit<Exam, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  hasPermission: (page: Page) => boolean;
  classOptions: string[];
}

const Exams: React.FC<ExamsProps> = ({ exams, courses, addExam, updateExam, deleteExam, hasPermission, classOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  
  const [newExam, setNewExam] = useState({ name: EXAM_NAME_OPTIONS[0], courseId: '', date: '' });
  
  const [filterClass, setFilterClass] = useState('সমস্ত');
  const [filterExam, setFilterExam] = useState('সমস্ত');

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c.name])), [courses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExam(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.name || !newExam.courseId || !newExam.date) return;
    addExam({ ...newExam });
    setNewExam({ name: EXAM_NAME_OPTIONS[0], courseId: '', date: '' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!examToEdit) return;
    const { name, value } = e.target;
    setExamToEdit({ ...examToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examToEdit) return;
    updateExam({ ...examToEdit });
    setIsEditModalOpen(false);
    setExamToEdit(null);
  };
  
  const handleDelete = () => {
    if (!examToDelete) return;
    deleteExam(examToDelete.id);
    setExamToDelete(null);
  };

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const className = courseMap.get(exam.courseId);
      const isClassMatch = filterClass === 'সমস্ত' || className === filterClass;
      const isExamMatch = filterExam === 'সমস্ত' || exam.name === filterExam;
      return isClassMatch && isExamMatch;
    });
  }, [exams, filterClass, filterExam, courseMap]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">পরীক্ষার সময়সূচী</h2>
        {hasPermission('পরীক্ষা') && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            পরীক্ষা যোগ করুন
            </button>
        )}
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-2 text-text-primary">ফিল্টার করুন</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">শ্রেণী অনুযায়ী</label>
                <select id="classFilter" value={filterClass} onChange={e => setFilterClass(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="সমস্ত">সমস্ত শ্রেণী</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="examFilter" className="block text-sm font-medium text-gray-700">পরীক্ষা অনুযায়ী</label>
                <select id="examFilter" value={filterExam} onChange={e => setFilterExam(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="সমস্ত">সমস্ত পরীক্ষা</option>
                    {EXAM_NAME_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরীক্ষার নাম</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শ্রেণী</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
              {hasPermission('পরীক্ষা') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExams.map(exam => (
              <tr key={exam.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{courseMap.get(exam.courseId) || 'অজানা শ্রেণী'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.lastModifiedBy || exam.addedBy}</td>
                {hasPermission('পরীক্ষা') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => { setExamToEdit(exam); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setExamToDelete(exam)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
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
              <h3 className="text-xl font-semibold">নতুন পরীক্ষার সময়সূচী</h3>
              <button onClick={() => setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select name="name" value={newExam.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                {EXAM_NAME_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <select name="courseId" value={newExam.courseId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              <input type="date" name="date" value={newExam.date} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">যোগ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && examToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">পরীক্ষা সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <select name="name" value={examToEdit.name} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                {EXAM_NAME_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <select name="courseId" value={examToEdit.courseId} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              <input type="date" name="date" value={examToEdit.date} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required />
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">আপডেট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {examToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি পরীক্ষা "{examToDelete.name}"-কে মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setExamToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;