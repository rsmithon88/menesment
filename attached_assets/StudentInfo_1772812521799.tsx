import React, { useState, useEffect, useMemo } from 'react';
import { Student, Fee, Attendance, Result, Exam } from '../types';
import { IdentificationIcon, CurrencyDollarIcon, ClipboardListIcon, DocumentTextIcon } from '../constants';
import { getGradeForMarks, printContent } from './utils';

interface StudentInfoProps {
  students: Student[];
  fees: Fee[];
  attendance: Attendance[];
  results: Result[];
  exams: Exam[];
  madrasahName: string;
  madrasahAddress: string;
  initialStudent?: Student | null;
  classOptions: string[];
}

type ActiveTab = 'details' | 'fees' | 'attendance' | 'results';

const Marksheet: React.FC<{ student: Student, result: Result, exam: Exam, madrasahName: string, madrasahAddress: string }> = ({ student, result, exam, madrasahName, madrasahAddress }) => {
    return (
        <div id="marksheet-print-area" className="p-6 bg-white border-2 border-gray-300">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-primary">{madrasahName}</h1>
                <p className="text-sm text-text-secondary">{madrasahAddress}</p>
                <h2 className="text-xl font-semibold mt-2 underline">একাডেমিক ট্রান্সক্রিপ্ট</h2>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">{exam.name} - {new Date(exam.date).getFullYear()}</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <p><span className="font-semibold w-24 inline-block">শিক্ষার্থীর নাম</span>: {student.name}</p>
                    <p><span className="font-semibold w-24 inline-block">বাবার নাম</span>: {student.fatherName}</p>
                    <p><span className="font-semibold w-24 inline-block">রোল নম্বর</span>: {student.rollNumber}</p>
                    <p><span className="font-semibold w-24 inline-block">শ্রেণী</span>: {student.class}</p>
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">বিষয়</th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-700">মোট নম্বর</th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-700">প্রাপ্ত নম্বর</th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-700">গ্রেড</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {result.results.map((res, i) => (
                        <tr key={i}>
                            <td className="px-4 py-2">{res.subject}</td>
                            <td className="px-4 py-2 text-center">{res.totalMarks}</td>
                            <td className="px-4 py-2 text-center">{res.marks}</td>
                            <td className="px-4 py-2 text-center">{getGradeForMarks(res.marks, res.totalMarks)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                    <tr>
                        <td className="px-4 py-2 text-right" colSpan={2}>সর্বমোট প্রাপ্ত নম্বর:</td>
                        <td className="px-4 py-2 text-center">{result.totalMarks}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-6 flex justify-around items-center bg-gray-50 p-3 rounded-lg border">
                <div className="text-center">
                    <p className="text-sm text-gray-600">ফলাফল</p>
                    <p className={`font-bold text-lg ${result.status === 'পাশ' ? 'text-green-600' : 'text-red-600'}`}>{result.status}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-gray-600">প্রাপ্ত গ্রেড</p>
                    <p className="font-bold text-lg text-primary">{result.grade}</p>
                </div>
            </div>

            <div className="mt-20 flex justify-between items-end text-sm">
                <p className="border-t-2 border-dotted border-gray-700 w-48 text-center pt-1"> শ্রেণি শিক্ষকের স্বাক্ষর</p>
                <p className="border-t-2 border-dotted border-gray-700 w-48 text-center pt-1">মুহতামিমের স্বাক্ষর</p>
            </div>
        </div>
    );
};


const StudentInfoCard: React.FC<{ student: Student, fees: Fee[], attendance: Attendance[], results: Result[], exams: Exam[], madrasahName: string, madrasahAddress: string, allStudents: Student[] }> = ({ student, fees, attendance, results, exams, madrasahName, madrasahAddress, allStudents }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    
    const sequentialRollNumber = useMemo(() => {
        if (!student) return null;
        const studentsInClass = allStudents
            .filter(s => s.class === student.class)
            .sort((a, b) => a.rollNumber - b.rollNumber);
        
        const index = studentsInClass.findIndex(s => s.id === student.id);
        
        return index !== -1 ? index + 1 : student.rollNumber;
    }, [student, allStudents]);

    const studentFees = useMemo(() => fees.filter(f => f.studentId === student.id).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()), [fees, student.id]);
    const studentAttendance = useMemo(() => attendance.filter(a => a.studentId === student.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [attendance, student.id]);
    
    const studentResults = useMemo(() => results.filter(r => r.studentId === student.id), [results, student.id]);
    const examMap = useMemo(() => new Map(exams.map(e => [e.id, e])), [exams]);
    
    const availableExamsForStudent = useMemo(() => 
        studentResults.map(r => examMap.get(r.examId)).filter((e): e is Exam => !!e)
    , [studentResults, examMap]);

    const selectedResult = useMemo(() => 
        studentResults.find(r => r.examId === selectedExamId)
    , [studentResults, selectedExamId]);
    
    const selectedExam = useMemo(() => examMap.get(selectedExamId), [examMap, selectedExamId]);


    const feeSummary = useMemo(() => {
        const totalDue = studentFees.reduce((sum, f) => sum + f.amount, 0);
        const totalPaid = studentFees.filter(f => f.status === 'পরিশোধিত').reduce((sum, f) => sum + f.amount, 0);
        const totalPending = totalDue - totalPaid;
        return { totalDue, totalPaid, totalPending };
    }, [studentFees]);
    
    const handlePrint = () => {
        printContent('marksheet-print-area', 'মার্কশিট');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
            <div className="bg-primary p-4 text-white flex items-center space-x-4">
                <IdentificationIcon className="h-10 w-10"/>
                <div>
                    <h3 className="text-2xl font-bold">{student.name}</h3>
                    <p className="text-sm opacity-90">রোল: {sequentialRollNumber} (মূল: {student.rollNumber}) | শ্রেণী: {student.class}</p>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('details')} className={`flex items-center space-x-2 shrink-0 py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <IdentificationIcon className="h-5 w-5"/> <span>বিস্তারিত</span>
                    </button>
                    <button onClick={() => setActiveTab('fees')} className={`flex items-center space-x-2 shrink-0 py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='fees' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <CurrencyDollarIcon className="h-5 w-5"/> <span>ফি-এর ইতিহাস</span>
                    </button>
                    <button onClick={() => setActiveTab('attendance')} className={`flex items-center space-x-2 shrink-0 py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='attendance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <ClipboardListIcon className="h-5 w-5"/> <span>হাজিরা</span>
                    </button>
                    <button onClick={() => setActiveTab('results')} className={`flex items-center space-x-2 shrink-0 py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='results' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <DocumentTextIcon className="h-5 w-5"/> <span>রেজাল্ট কার্ড</span>
                    </button>
                </nav>
            </div>
            
            <div className="p-6">
                {activeTab === 'details' && (
                    <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-4 border-b pb-2">বিস্তারিত তথ্য</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-text-secondary">
                            <div><span className="font-semibold text-text-primary">বাবার নাম:</span> {student.fatherName}</div>
                            <div><span className="font-semibold text-text-primary">মায়ের নাম:</span> {student.motherName}</div>
                            <div><span className="font-semibold text-text-primary">বয়স:</span> {student.age} বছর</div>
                            <div><span className="font-semibold text-text-primary">লিঙ্গ:</span> {student.gender === 'male' ? 'ছাত্র' : 'ছাত্রী'}</div>
                            <div><span className="font-semibold text-text-primary">অভিভাবকের যোগাযোগ:</span> {student.parentContact}</div>
                            <div>
                                <span className="font-semibold text-text-primary">অবস্থা:</span> 
                                <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'fees' && (
                    <div>
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-800">মোট ধার্য</p><p className="font-bold text-lg text-blue-900">৳{feeSummary.totalDue.toLocaleString('bn-BD')}</p></div>
                            <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-800">মোট পরিশোধিত</p><p className="font-bold text-lg text-green-900">৳{feeSummary.totalPaid.toLocaleString('bn-BD')}</p></div>
                            <div className="p-3 bg-red-50 rounded-lg"><p className="text-sm text-red-800">মোট বকেয়া</p><p className="font-bold text-lg text-red-900">৳{feeSummary.totalPending.toLocaleString('bn-BD')}</p></div>
                        </div>
                         <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">বিবরণ</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">শেষ তারিখ</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">অবস্থা</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentFees.map(fee => (
                                        <tr key={fee.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">{fee.category}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{new Date(fee.dueDate).toLocaleDateString('bn-BD')}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right font-mono">৳{fee.amount.toLocaleString('bn-BD')}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fee.status === 'পরিশোধিত' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                 {activeTab === 'attendance' && (
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">অবস্থা</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {studentAttendance.map(att => (
                                    <tr key={att.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{new Date(att.date).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${att.status === 'উপস্থিত' ? 'bg-green-100 text-green-800' : (att.status === 'অনুপস্থিত' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')}`}>
                                                {att.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'results' && (
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end no-print">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="examSelect" className="block text-sm font-medium text-gray-700">পরীক্ষা নির্বাচন করুন</label>
                                <select id="examSelect" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">-- পরীক্ষা নির্বাচন --</option>
                                    {availableExamsForStudent.map(exam => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedExamId && (
                                <button onClick={handlePrint} className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors">
                                    প্রিন্ট করুন
                                </button>
                            )}
                        </div>
                        {selectedResult && selectedExam ? (
                            <Marksheet student={student} result={selectedResult} exam={selectedExam} madrasahName={madrasahName} madrasahAddress={madrasahAddress} />
                        ) : (
                            <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
                                <p className="text-text-secondary">
                                    {studentResults.length > 0 ? 'মার্কশিট দেখতে একটি পরীক্ষা নির্বাচন করুন।' : 'এই শিক্ষার্থীর জন্য কোনো ফলাফল পাওয়া যায়নি।'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}


const StudentInfo: React.FC<StudentInfoProps> = ({ students, fees, attendance, results, exams, madrasahName, madrasahAddress, initialStudent, classOptions }) => {
  const [rollNumber, setRollNumber] = useState(initialStudent?.rollNumber.toString() || '');
  const [selectedClass, setSelectedClass] = useState(initialStudent?.class || '');
  const [foundStudent, setFoundStudent] = useState<Student | null>(initialStudent || null);
  const [searchMessage, setSearchMessage] = useState<string>(
    initialStudent ? '' : 'অনুসন্ধান করতে শিক্ষার্থীর রোল নম্বর এবং শ্রেণী লিখুন।'
  );

  useEffect(() => {
    setFoundStudent(initialStudent || null);
    setRollNumber(initialStudent?.rollNumber.toString() || '');
    setSelectedClass(initialStudent?.class || '');
    if (initialStudent) {
        setSearchMessage('');
    } else {
        setSearchMessage('অনুসন্ধান করতে শিক্ষার্থীর রোল নম্বর এবং শ্রেণী লিখুন।');
    }
  }, [initialStudent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber || !selectedClass) {
        setSearchMessage('অনুগ্রহ করে রোল নম্বর এবং শ্রেণী উভয়ই পূরণ করুন।');
        setFoundStudent(null);
        return;
    }

    const student = students.find(
      s => s.rollNumber === parseInt(rollNumber) && s.class === selectedClass
    );

    if (student) {
      setFoundStudent(student);
      setSearchMessage('');
    } else {
      setFoundStudent(null);
      setSearchMessage('এই রোল নম্বর এবং শ্রেণীর কোনো শিক্ষার্থীকে খুঁজে পাওয়া যায়নি।');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-6">শিক্ষার্থীর তথ্য অনুসন্ধান</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">রোল নম্বর</label>
            <input
              type="number"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="রোল লিখুন"
              required
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">শ্রেণী</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            >
              <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <button type="submit" className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors">
              অনুসন্ধান
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {foundStudent ? (
          <StudentInfoCard student={foundStudent} fees={fees} attendance={attendance} results={results} exams={exams} madrasahName={madrasahName} madrasahAddress={madrasahAddress} allStudents={students} />
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <p className="text-text-secondary">{searchMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInfo;
