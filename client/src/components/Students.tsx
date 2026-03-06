

import React, { useState, useRef, useMemo } from 'react';
import { Student, Page, Course, Exam } from '../types';
import { XIcon, PencilIcon, TrashIcon, IdentificationIcon, CogIcon } from '../constants';

interface StudentsProps {
  students: Student[];
  exams: Exam[];
  courses: Course[];
  addStudent: (student: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  addMultipleStudents: (students: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>[]) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  hasPermission: (page: Page) => boolean;
  onViewInfo: (student: Student) => void;
  classOptions: string[];
  addCourse: (course: Omit<Course, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  deleteCourse: (courseId: string) => void;
}

const Students: React.FC<StudentsProps> = ({ students, exams, courses, addStudent, addMultipleStudents, updateStudent, deleteStudent, hasPermission, onViewInfo, classOptions, addCourse, deleteCourse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClassManageModalOpen, setIsClassManageModalOpen] = useState(false);

  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [filterClass, setFilterClass] = useState('সমস্ত');

  const [newStudent, setNewStudent] = useState({ name: '', fatherName: '', motherName: '', rollNumber: '', class: '', age: '', parentContact: '', address: '', gender: 'male' as 'male' | 'female', status: 'active' as 'active' | 'inactive' });
  const [newClassName, setNewClassName] = useState('');

  const [parsedData, setParsedData] = useState<Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({ ...newStudent, age: parseInt(newStudent.age), rollNumber: parseInt(newStudent.rollNumber) });
    setNewStudent({ name: '', fatherName: '', motherName: '', rollNumber: '', class: '', age: '', parentContact: '', address: '', gender: 'male', status: 'active' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!studentToEdit) return;
    const { name, value } = e.target;
    setStudentToEdit({ ...studentToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;
    updateStudent({ ...studentToEdit, age: parseInt(String(studentToEdit.age)), rollNumber: parseInt(String(studentToEdit.rollNumber))});
    setIsEditModalOpen(false);
    setStudentToEdit(null);
  };
  
  const handleDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
  };

  const handleAddClass = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = newClassName.trim();
      if (!trimmedName) return;
      if (classOptions.includes(trimmedName)) {
          alert("এই শ্রেণীটি ইতিমধ্যে তালিকায় আছে।");
          return;
      }
      addCourse({
          name: trimmedName,
          instructor: 'অনির্ধারিত',
          duration: 'অনির্ধারিত',
      });
      setNewClassName('');
  };

  const handleDeleteClass = (className: string) => {
      const courseToDelete = courses.find(c => c.name === className);
      if (confirm(`আপনি কি নিশ্চিত যে আপনি "${className}" শ্রেণীটি মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`)) {
          if (courseToDelete) {
              deleteCourse(courseToDelete.id);
          } else {
              alert("একটি ত্রুটি ঘটেছে। শ্রেণীটি খুঁজে পাওয়া যায়নি।");
          }
      }
  };


  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setParsedData([]);
    setImportError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setParsedData([]);

    if (file.type !== 'text/csv') {
        setImportError("অবৈধ ফাইল টাইপ। অনুগ্রহ করে একটি .csv ফাইল আপলোড করুন।");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.trim().split(/\r\n|\n/);
            if (lines.length <= 1) {
                setImportError("CSV ফাইলটি খালি বা শুধুমাত্র একটি হেডার সারি আছে।");
                return;
            }

            const headerLine = lines.shift()!;
            const header = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
            const requiredHeaders = ['rollnumber', 'name', 'fathername', 'mothername', 'class', 'age', 'parentcontact'];
            
            const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
            if (missingHeaders.length > 0) {
                setImportError(`CSV ফাইলে প্রয়োজনীয় কলাম অনুপস্থিত: ${missingHeaders.join(', ')}`);
                return;
            }

            const rollNumberIndex = header.indexOf('rollnumber');
            const nameIndex = header.indexOf('name');
            const fatherNameIndex = header.indexOf('fathername');
            const motherNameIndex = header.indexOf('mothername');
            const classIndex = header.indexOf('class');
            const ageIndex = header.indexOf('age');
            const parentContactIndex = header.indexOf('parentcontact');
            const genderIndex = header.indexOf('gender');
            
            const data: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>[] = lines.map((line, index) => {
                const values = line.split(',');
                const age = parseInt(values[ageIndex]?.trim());
                const rollNumber = parseInt(values[rollNumberIndex]?.trim());
                if (isNaN(age) || isNaN(rollNumber)) {
                    throw new Error(`সারি ${index + 2}-এ বয়স বা রোল নম্বর একটি সংখ্যা নয়।`);
                }

                const parsedGender = genderIndex !== -1 ? values[genderIndex]?.trim().toLowerCase() : undefined;
                const gender: 'male' | 'female' = parsedGender === 'female' ? 'female' : 'male';
                
                return {
                    rollNumber: rollNumber,
                    name: values[nameIndex]?.trim(),
                    fatherName: values[fatherNameIndex]?.trim(),
                    motherName: values[motherNameIndex]?.trim(),
                    class: values[classIndex]?.trim(),
                    age: age,
                    parentContact: values[parentContactIndex]?.trim(),
                    gender: gender,
                    status: 'active' as const,
                };
            }).filter(d => !isNaN(d.rollNumber) && d.name && d.fatherName && d.motherName && d.class && !isNaN(d.age) && d.parentContact);

            if (data.length === 0) {
                setImportError("CSV ফাইলে কোনো বৈধ ডেটা পাওয়া যায়নি।");
                return;
            }
            setParsedData(data);
        } catch (err: any) {
            setImportError(`ফাইল পার্স করতে ত্রুটি: ${err.message}`);
        }
    };
    reader.onerror = () => {
        setImportError("ফাইল পড়তে ব্যর্থ হয়েছে।");
    };
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    if (parsedData.length > 0) {
      addMultipleStudents(parsedData);
      closeImportModal();
    }
  };

  const filteredStudents = useMemo(() => {
    const filtered = students.filter(student => 
      filterClass === 'সমস্ত' || student.class === filterClass
    );

    if (filterClass !== 'সমস্ত') {
      return filtered.sort((a, b) => a.rollNumber - b.rollNumber);
    }
    
    return filtered;
  }, [students, filterClass]);


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">শিক্ষার্থীদের তালিকা</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <div>
                <label htmlFor="classFilter" className="sr-only">
                    শ্রেণী অনুযায়ী ফিল্টার করুন
                </label>
                <select
                    id="classFilter"
                    name="classFilter"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                    <option value="সমস্ত">সমস্ত শ্রেণী</option>
                    {classOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
             {hasPermission('শিক্ষার্থীরা') && (
                <div className="flex items-center space-x-2 flex-wrap gap-2 sm:gap-0">
                    <button onClick={() => setIsClassManageModalOpen(true)} className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap flex items-center">
                        <CogIcon className="h-5 w-5 mr-1" /> শ্রেণী ব্যবস্থাপনা
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                        CSV ইম্পোর্ট
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors whitespace-nowrap">
                        শিক্ষার্থী যোগ
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">রোল নং</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">নাম</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শ্রেণী</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বয়স</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অভিভাবকের যোগাযোগ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অবস্থা</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">বিস্তারিত</th>
              {hasPermission('শিক্ষার্থীরা') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {filterClass === 'সমস্ত' ? student.rollNumber : index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.parentContact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.lastModifiedBy || student.addedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => onViewInfo(student)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors" title="বিস্তারিত দেখুন">
                        <IdentificationIcon className="h-6 w-6" />
                    </button>
                </td>
                {hasPermission('শিক্ষার্থীরা') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => { setStudentToEdit(student); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setStudentToDelete(student)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
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
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">নতুন শিক্ষার্থী যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input type="text" name="name" value={newStudent.name} onChange={handleInputChange} placeholder="পুরো নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="fatherName" value={newStudent.fatherName} onChange={handleInputChange} placeholder="বাবার নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="motherName" value={newStudent.motherName} onChange={handleInputChange} placeholder="মায়ের নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="number" name="rollNumber" value={newStudent.rollNumber} onChange={handleInputChange} placeholder="রোল নম্বর" className="w-full px-4 py-2 border rounded-lg" required />
                <select name="class" value={newStudent.class} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled> শ্রেণী নির্বাচন করুন</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" name="age" value={newStudent.age} onChange={handleInputChange} placeholder="বয়স" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="parentContact" value={newStudent.parentContact} onChange={handleInputChange} placeholder="অভিভাবকের যোগাযোগ" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="address" value={newStudent.address} onChange={handleInputChange} placeholder="ঠিকানা" className="w-full px-4 py-2 border rounded-lg" />
                <select name="gender" value={newStudent.gender} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="male">ছাত্র</option>
                    <option value="female">ছাত্রী</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">শিক্ষার্থী যোগ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && studentToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">শিক্ষার্থীর তথ্য সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <input type="text" name="name" value={studentToEdit.name} onChange={handleEditInputChange} placeholder="পুরো নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="fatherName" value={studentToEdit.fatherName} onChange={handleEditInputChange} placeholder="বাবার নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="motherName" value={studentToEdit.motherName} onChange={handleEditInputChange} placeholder="মায়ের নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="number" name="rollNumber" value={studentToEdit.rollNumber} onChange={handleEditInputChange} placeholder="রোল নম্বর" className="w-full px-4 py-2 border rounded-lg" required />
                <select name="class" value={studentToEdit.class} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" name="age" value={studentToEdit.age} onChange={handleEditInputChange} placeholder="বয়স" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="parentContact" value={studentToEdit.parentContact} onChange={handleEditInputChange} placeholder="অভিভাবকের যোগাযোগ" className="w-full px-4 py-2 border rounded-lg" required />
                <input type="text" name="address" value={studentToEdit.address} onChange={handleEditInputChange} placeholder="ঠিকানা" className="w-full px-4 py-2 border rounded-lg" />
                <select name="gender" value={studentToEdit.gender} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="male">ছাত্র</option>
                    <option value="female">ছাত্রী</option>
                </select>
                 <select name="status" value={studentToEdit.status} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg">
                    <option value="active">সক্রিয়</option>
                    <option value="inactive">নিষ্ক্রিয়</option>
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

       {isClassManageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">শ্রেণী ব্যবস্থাপনা</h3>
                <button onClick={() => setIsClassManageModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddClass} className="mb-6 flex gap-2">
                  <input 
                    type="text" 
                    value={newClassName} 
                    onChange={(e) => setNewClassName(e.target.value)} 
                    placeholder="নতুন শ্রেণীর নাম" 
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      যোগ করুন
                  </button>
              </form>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <ul className="divide-y divide-gray-200">
                      {classOptions.map((cls) => (
                          <li key={cls} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                              <span className="text-gray-700">{cls}</span>
                              <button onClick={() => handleDeleteClass(cls)} className="text-red-500 hover:text-red-700 p-1" title="মুছে ফেলুন">
                                  <TrashIcon className="h-5 w-5" />
                              </button>
                          </li>
                      ))}
                      {classOptions.length === 0 && (
                          <li className="px-4 py-3 text-center text-gray-500">কোনো শ্রেণী পাওয়া যায়নি।</li>
                      )}
                  </ul>
              </div>
              
              <div className="mt-6 text-right">
                  <button onClick={() => setIsClassManageModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                      বন্ধ করুন
                  </button>
              </div>
            </div>
          </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি শিক্ষার্থী "{studentToDelete.name}"-কে মুছে ফেলতে চান? এই প্রক্রিয়াটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setStudentToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">CSV থেকে শিক্ষার্থী ইম্পোর্ট</h3>
                    <button onClick={closeImportModal} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 rounded-r-lg">
                        <p className="font-bold">নির্দেশনা</p>
                        <p className="text-sm mt-1">
                            আপনার CSV ফাইলের প্রথম সারিতে অবশ্যই এই হেডারগুলো থাকতে হবে: 
                            <code className="bg-yellow-200 rounded px-1">rollNumber, name, fatherName, motherName, class, age, parentContact</code>.
                            ঐচ্ছিকভাবে <code className="bg-yellow-200 rounded px-1">gender</code> (male/female) কলাম যোগ করতে পারেন।
                        </p>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary"
                    />

                    {importError && <p className="text-red-600 text-sm">{importError}</p>}

                    {parsedData.length > 0 && (
                        <div className="mt-4">
                            <p className="font-semibold">{parsedData.length} জন শিক্ষার্থী ইম্পোর্টের জন্য প্রস্তুত।</p>
                            <div className="max-h-40 overflow-y-auto mt-2 border rounded-lg p-2 text-sm bg-gray-50">
                                <ul>
                                    {parsedData.slice(0, 5).map((s, i) => <li key={i}>{s.name} - {s.class}</li>)}
                                    {parsedData.length > 5 && <li>... এবং আরও {parsedData.length - 5} জন</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={closeImportModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                    <button 
                        type="button" 
                        onClick={handleImport}
                        disabled={parsedData.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                        ইম্পোর্ট করুন
                    </button>
                </div>
            </div>
         </div> 
      )}

    </div>
  );
};

export default Students;
