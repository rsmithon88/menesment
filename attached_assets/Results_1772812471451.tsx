

import React, { useState, useMemo } from 'react';
// Fix: CLASS_OPTIONS is not exported from types, moved to constants import
import { Result, Student, Exam, Page, SubjectResult, Course } from '../types';
import { XIcon, PencilIcon, TrashIcon, EXAM_NAME_OPTIONS } from '../constants';
import { calculateOverallResult, printContent } from './utils';

interface ResultsProps {
  results: Result[];
  students: Student[];
  exams: Exam[];
  courses: Course[];
  addResult: (result: Omit<Result, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateResult: (result: Result) => void;
  deleteResult: (resultId: string) => void;
  hasPermission: (page: Page) => boolean;
  classOptions: string[];
}

const Results: React.FC<ResultsProps> = ({ results, students, exams, courses, addResult, updateResult, deleteResult, hasPermission, classOptions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [resultToEdit, setResultToEdit] = useState<Result | null>(null);
  const [resultToDelete, setResultToDelete] = useState<Result | null>(null);

  const initialNewResultState = { studentId: '', examId: '', results: [{ subject: '', marks: '', totalMarks: '100' }] as any[] };
  const [newResult, setNewResult] = useState(initialNewResultState);
  const [modalSelectedClass, setModalSelectedClass] = useState('');

  const [filterClass, setFilterClass] = useState('সমস্ত');
  const [filterExam, setFilterExam] = useState('সমস্ত');

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const examMap = useMemo(() => new Map(exams.map(e => [e.id, e.name])), [exams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const stateSetter = isEditModalOpen ? setResultToEdit : setNewResult;
    
    stateSetter(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubjectChange = (index: number, field: 'subject' | 'marks' | 'totalMarks', value: string) => {
    const stateSetter = isEditModalOpen ? setResultToEdit : setNewResult;
    stateSetter(prev => {
      if (!prev) return null;
      const updatedSubjects = [...prev.results];
      updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
      return { ...prev, results: updatedSubjects };
    });
  };

  const addSubjectRow = () => {
    const stateSetter = isEditModalOpen ? setResultToEdit : setNewResult;
    stateSetter(prev => (prev ? { ...prev, results: [...prev.results, { subject: '', marks: '', totalMarks: '100' }] } : null));
  };
  
  const removeSubjectRow = (index: number) => {
    const stateSetter = isEditModalOpen ? setResultToEdit : setNewResult;
    stateSetter(prev => {
        if (!prev || prev.results.length <= 1) return prev;
        const updatedSubjects = prev.results.filter((_, i) => i !== index);
        return { ...prev, results: updatedSubjects };
    });
  };
  
  const availableExams = useMemo(() => {
    let studentClass = '';
    if (isEditModalOpen && resultToEdit) {
      const student = studentMap.get(resultToEdit.studentId);
      studentClass = student?.class || '';
    } else {
      studentClass = modalSelectedClass;
    }

    if (!studentClass) {
        return [];
    }
    const course = courses.find(c => c.name === studentClass);
    if (!course) {
        return [];
    }
    return exams.filter(exam => exam.courseId === course.id);
  }, [isEditModalOpen, resultToEdit, modalSelectedClass, studentMap, courses, exams]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedResults: SubjectResult[] = newResult.results.map(r => ({
        subject: r.subject,
        marks: parseFloat(r.marks) || 0,
        totalMarks: parseFloat(r.totalMarks) || 100
    }));

    if (!newResult.studentId || !newResult.examId || parsedResults.some(r => !r.subject)) return;

    const { grade, status, totalObtainedMarks } = calculateOverallResult(parsedResults);

    addResult({ 
        studentId: newResult.studentId,
        examId: newResult.examId,
        results: parsedResults,
        totalMarks: totalObtainedMarks,
        grade,
        status,
    });
    setNewResult(initialNewResultState);
    setIsModalOpen(false);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultToEdit) return;
    
    const parsedResults: SubjectResult[] = resultToEdit.results.map(r => ({
        subject: r.subject,
        marks: parseFloat(String(r.marks)) || 0,
        totalMarks: parseFloat(String(r.totalMarks)) || 100,
    }));
    
    const { grade, status, totalObtainedMarks } = calculateOverallResult(parsedResults);

    updateResult({
      ...resultToEdit,
      results: parsedResults,
      totalMarks: totalObtainedMarks,
      grade,
      status,
    });
    setIsEditModalOpen(false);
    setResultToEdit(null);
  };
  
  const handleDelete = () => {
    if (!resultToDelete) return;
    deleteResult(resultToDelete.id);
    setResultToDelete(null);
  };

  const handlePrint = () => {
    printContent('print-area', 'রেজাল্ট শিট');
  }

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const student = studentMap.get(result.studentId);
      const examName = examMap.get(result.examId);
      const isClassMatch = filterClass === 'সমস্ত' || (student && student.class === filterClass);
      const isExamMatch = filterExam === 'সমস্ত' || (examName && examName === filterExam);
      return isClassMatch && isExamMatch;
    });
  }, [results, filterClass, filterExam, studentMap, examMap]);

  const openAddModal = () => {
    setNewResult(initialNewResultState);
    setModalSelectedClass('');
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">ফলাফল ব্যবস্থাপনা</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
             <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                প্রিন্ট করুন
            </button>
            {hasPermission('রেজাল্ট') && (
                <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap">
                    ফলাফল যোগ করুন
                </button>
            )}
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md no-print">
        <h3 className="text-lg font-medium mb-2 text-text-primary">ফলাফল ফিল্টার করুন</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">শ্রেণী অনুযায়ী ফিল্টার</label>
                <select id="classFilter" value={filterClass} onChange={e => setFilterClass(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="সমস্ত">সমস্ত শ্রেণী</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="examFilter" className="block text-sm font-medium text-gray-700">পরীক্ষা অনুযায়ী ফিল্টার</label>
                <select id="examFilter" value={filterExam} onChange={e => setFilterExam(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <option value="সমস্ত">সমস্ত পরীক্ষা</option>
                    {EXAM_NAME_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <div id="print-area">
            <div className="hidden print:block text-center p-4">
                 <h3 className="text-xl font-bold">রেজাল্ট শিট</h3>
                 <p>শ্রেণী: {filterClass} | পরীক্ষা: {filterExam}</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">রোল</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিক্ষার্থীর নাম</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শ্রেণী</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পরীক্ষা</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মোট নম্বর</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">গ্রেড</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                  {hasPermission('রেজাল্ট') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider no-print">কার্যক্রম</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map(result => {
                    const student = studentMap.get(result.studentId);
                    return (
                        <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student?.rollNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.class}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{examMap.get(result.examId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.totalMarks}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{result.grade}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'পাশ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {result.status}
                                </span>
                            </td>
                             {hasPermission('রেজাল্ট') && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                                    <div className="flex items-center justify-end space-x-4">
                                        <button onClick={() => { setResultToEdit(result); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => setResultToDelete(result)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    );
                })}
              </tbody>
            </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">নতুন ফলাফল যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                      value={modalSelectedClass}
                      onChange={(e) => {
                          setModalSelectedClass(e.target.value);
                          setNewResult(prev => ({ ...prev, studentId: '', examId: '' }));
                      }}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                  >
                      <option value="" disabled>প্রথমে শ্রেণী নির্বাচন করুন</option>
                      {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                      name="studentId" 
                      value={newResult.studentId} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2 border rounded-lg" 
                      required 
                      disabled={!modalSelectedClass}
                  >
                      <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                      {students
                          .filter(s => s.class === modalSelectedClass)
                          .map(s => <option key={s.id} value={s.id}>{s.name} - রোল {s.rollNumber}</option>)}
                  </select>
                  <select name="examId" value={newResult.examId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required disabled={!newResult.studentId}>
                      <option value="" disabled>পরীক্ষা নির্বাচন করুন</option>
                      {availableExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
              </div>
              <hr />
              <div>
                  <h4 className="text-lg font-medium mb-2">বিষয় ও নম্বর</h4>
                  {newResult.results.map((res: any, index: number) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                          <input type="text" placeholder="বিষয়" value={res.subject} onChange={e => handleSubjectChange(index, 'subject', e.target.value)} className="col-span-5 w-full px-3 py-2 border rounded-lg" required />
                          <input type="number" placeholder="প্রাপ্ত নম্বর" value={res.marks} onChange={e => handleSubjectChange(index, 'marks', e.target.value)} className="col-span-3 w-full px-3 py-2 border rounded-lg" required />
                          <input type="number" placeholder="মোট নম্বর" value={res.totalMarks} onChange={e => handleSubjectChange(index, 'totalMarks', e.target.value)} className="col-span-3 w-full px-3 py-2 border rounded-lg" required />
                          <button type="button" onClick={() => removeSubjectRow(index)} className="col-span-1 text-red-500 hover:text-red-700" title="সারি মুছুন">
                              <TrashIcon className="h-5 w-5" />
                          </button>
                      </div>
                  ))}
                  <button type="button" onClick={addSubjectRow} className="mt-2 text-sm text-primary hover:underline">+ আরও বিষয় যোগ করুন</button>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && resultToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ফলাফল সম্পাদনা করুন</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="studentId" value={resultToEdit.studentId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-gray-100" required disabled>
                      <option value="" disabled>শিক্ষার্থী নির্বাচন করুন</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.class}</option>)}
                  </select>
                  <select name="examId" value={resultToEdit.examId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                      <option value="" disabled>পরীক্ষা নির্বাচন করুন</option>
                      {availableExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
              </div>
              <hr />
              <div>
                  <h4 className="text-lg font-medium mb-2">বিষয় ও নম্বর</h4>
                  {resultToEdit.results.map((res, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                          <input type="text" placeholder="বিষয়" value={res.subject} onChange={e => handleSubjectChange(index, 'subject', e.target.value)} className="col-span-5 w-full px-3 py-2 border rounded-lg" required />
                          <input type="number" placeholder="প্রাপ্ত নম্বর" value={res.marks} onChange={e => handleSubjectChange(index, 'marks', e.target.value)} className="col-span-3 w-full px-3 py-2 border rounded-lg" required />
                          <input type="number" placeholder="মোট নম্বর" value={res.totalMarks} onChange={e => handleSubjectChange(index, 'totalMarks', e.target.value)} className="col-span-3 w-full px-3 py-2 border rounded-lg" required />
                          <button type="button" onClick={() => removeSubjectRow(index)} className="col-span-1 text-red-500 hover:text-red-700" title="সারি মুছুন">
                              <TrashIcon className="h-5 w-5" />
                          </button>
                      </div>
                  ))}
                  <button type="button" onClick={addSubjectRow} className="mt-2 text-sm text-primary hover:underline">+ আরও বিষয় যোগ করুন</button>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আপডেট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {resultToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই ফলাফলটি মুছে ফেলতে চান? এই প্রক্রিয়াটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setResultToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;