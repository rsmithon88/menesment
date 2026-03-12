import React, { useState, useMemo, useRef } from 'react';
import { Student, Page, Course } from '../types';
import { PencilIcon, TrashIcon, XIcon } from '../constants';
import { printContent } from './utils';

interface ResultSheetProps {
  students: Student[];
  courses: Course[];
  hasPermission: (page: Page) => boolean;
  classOptions: string[];
  madrasahName: string;
}

interface SubjectColumn {
  id: string;
  name: string;
  totalMarks: number;
}

interface SingleStudentMarks {
  [subjectId: string]: number | string;
}

interface StudentMarks {
  [studentId: string]: SingleStudentMarks;
}

const DEFAULT_SUBJECTS: SubjectColumn[] = [
  { id: 's1', name: 'কুরআন মাজীদ', totalMarks: 100 },
  { id: 's2', name: 'হাদীস শরীফ', totalMarks: 100 },
  { id: 's3', name: 'ফিক্বহ', totalMarks: 100 },
  { id: 's4', name: 'আক্বাঈদ', totalMarks: 100 },
  { id: 's5', name: 'আরবী', totalMarks: 100 },
  { id: 's6', name: 'বাংলা', totalMarks: 100 },
  { id: 's7', name: 'গণিত', totalMarks: 100 },
  { id: 's8', name: 'ইংরেজী', totalMarks: 100 },
];

const ResultSheet: React.FC<ResultSheetProps> = ({ students, courses, hasPermission, classOptions, madrasahName: defaultMadrasahName }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [examName, setExamName] = useState('১ম সাময়িক পরীক্ষা');
  const [session, setSession] = useState(new Date().getFullYear().toString());
  const [sheetMadrasahName, setSheetMadrasahName] = useState(defaultMadrasahName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [subjects, setSubjects] = useState<SubjectColumn[]>(DEFAULT_SUBJECTS);
  const [marksData, setMarksData] = useState<StudentMarks>({});
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTotal, setNewSubjectTotal] = useState('100');
  const [editingSubject, setEditingSubject] = useState<SubjectColumn | null>(null);
  const [totalRows, setTotalRows] = useState(45);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter(s => s.class === selectedClass && s.status === 'active')
      .sort((a, b) => a.rollNumber - b.rollNumber);
  }, [students, selectedClass]);

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    const numVal = value === '' ? '' : Math.min(parseFloat(value) || 0, subjects.find(s => s.id === subjectId)?.totalMarks || 100);
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: numVal,
      }
    }));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value,
      }
    }));
  };

  const getTotal = (studentId: string): number => {
    const studentMarks = marksData[studentId];
    if (!studentMarks) return 0;
    return subjects.reduce((sum, sub) => {
      const mark = studentMarks[sub.id];
      return sum + (typeof mark === 'number' ? mark : parseFloat(String(mark)) || 0);
    }, 0);
  };

  const getAverage = (studentId: string): string => {
    const total = getTotal(studentId);
    if (subjects.length === 0) return '0.00';
    return (total / subjects.length).toFixed(2);
  };

  const getMeritPosition = (): Map<string, number> => {
    const positionMap = new Map<string, number>();
    const studentsWithTotals = filteredStudents
      .map(s => ({ id: s.id, total: getTotal(s.id) }))
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total);

    let rank = 0;
    let prevTotal = -1;
    studentsWithTotals.forEach((s, idx) => {
      if (s.total !== prevTotal) {
        rank = idx + 1;
        prevTotal = s.total;
      }
      positionMap.set(s.id, rank);
    });
    return positionMap;
  };

  const meritPositions = useMemo(() => getMeritPosition(), [marksData, filteredStudents, subjects]);

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    if (editingSubject) {
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, name: newSubjectName.trim(), totalMarks: parseInt(newSubjectTotal) || 100 } : s));
      setEditingSubject(null);
    } else {
      const newId = 's' + Date.now();
      setSubjects(prev => [...prev, { id: newId, name: newSubjectName.trim(), totalMarks: parseInt(newSubjectTotal) || 100 }]);
    }
    setNewSubjectName('');
    setNewSubjectTotal('100');
    setShowSubjectModal(false);
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setMarksData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        const { [id]: _, ...rest } = updated[studentId];
        updated[studentId] = rest;
      });
      return updated;
    });
  };

  const handlePrint = () => {
    printContent('result-sheet-print', 'তাল শীট - ' + selectedClass);
  };

  const grandTotal = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
  const displayRows = Math.max(filteredStudents.length, totalRows);

  const toBengaliNumber = (num: number | string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print">
        <h2 className="text-2xl font-semibold text-text-primary" data-testid="text-result-sheet-title">তাল শীট / রেজাল্ট শীট</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowSubjectModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm" data-testid="button-add-subject">
            + বিষয় যোগ/সম্পাদনা
          </button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm" data-testid="button-print-sheet" disabled={!selectedClass}>
            প্রিন্ট করুন
          </button>
        </div>
      </div>

      <div className="mb-4 bg-white p-4 rounded-lg shadow-md no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">শ্রেণী নির্বাচন করুন</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" data-testid="select-class">
              <option value="">শ্রেণী নির্বাচন করুন</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পরীক্ষার নাম</label>
            <input type="text" value={examName} onChange={e => setExamName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" data-testid="input-exam-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষাবর্ষ</label>
            <input type="text" value={session} onChange={e => setSession(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" data-testid="input-session" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">সারির সংখ্যা</label>
            <input type="number" value={totalRows} onChange={e => setTotalRows(parseInt(e.target.value) || 30)} className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" min="1" max="100" data-testid="input-total-rows" />
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <div id="result-sheet-print">
            <style>{`
              @media print {
                @page { size: landscape; margin: 8mm; }
                .result-sheet-table { font-size: 10px !important; }
                .result-sheet-table th, .result-sheet-table td { padding: 2px 4px !important; }
                .result-sheet-table input { border: none !important; background: transparent !important; text-align: center; font-size: 10px !important; }
                .result-sheet-header { margin-bottom: 8px !important; }
                .no-print { display: none !important; }
              }
            `}</style>

            <div className="result-sheet-header text-center py-4 border-b-2 border-gray-800">
              <div className="flex justify-center items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={sheetMadrasahName}
                      onChange={e => setSheetMadrasahName(e.target.value)}
                      className="text-xl md:text-2xl font-bold text-center border-b-2 border-primary px-2 py-1 focus:outline-none"
                      onKeyDown={e => { if (e.key === 'Enter') setIsEditingName(false); }}
                      autoFocus
                      data-testid="input-madrasa-name"
                    />
                    <button onClick={() => setIsEditingName(false)} className="text-green-600 hover:text-green-800 no-print" data-testid="button-save-name">✓</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900" data-testid="text-madrasa-name">{sheetMadrasahName}</h1>
                    <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-primary no-print" data-testid="button-edit-name">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-base md:text-lg font-semibold mt-1 text-gray-700" data-testid="text-exam-info">
                {examName} - {session} ইং
              </p>
              <p className="text-sm text-gray-600 mt-1" data-testid="text-class-info">
                শ্রেণী: {selectedClass} | মোট পূর্ণমান: {toBengaliNumber(grandTotal)}
              </p>
            </div>

            <table className="result-sheet-table min-w-full border-collapse border border-gray-800">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 w-10" rowSpan={2}>ক্রমিক<br/>নং</th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 min-w-[120px]" rowSpan={2}>শিক্ষার্থীর নাম</th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 min-w-[100px]" rowSpan={2}>পিতার নাম</th>
                  {subjects.map(sub => (
                    <th key={sub.id} className="border border-gray-800 px-1 py-1 text-center text-xs font-bold text-gray-900 min-w-[60px] relative group">
                      <div className="flex flex-col items-center">
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-gray-500">({toBengaliNumber(sub.totalMarks)})</span>
                      </div>
                      <div className="absolute top-0 right-0 hidden group-hover:flex gap-0.5 no-print">
                        <button onClick={() => { setEditingSubject(sub); setNewSubjectName(sub.name); setNewSubjectTotal(String(sub.totalMarks)); setShowSubjectModal(true); }} className="text-blue-500 hover:text-blue-700 p-0.5">
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeSubject(sub.id)} className="text-red-500 hover:text-red-700 p-0.5">
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 w-14" rowSpan={2}>মোট<br/>নম্বর</th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 w-14" rowSpan={2}>গড়<br/>নম্বর</th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 w-14" rowSpan={2}>মেধা<br/>স্থান</th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-900 min-w-[80px]" rowSpan={2}>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: displayRows }).map((_, index) => {
                  const student = filteredStudents[index];
                  const serial = index + 1;
                  const total = student ? getTotal(student.id) : 0;
                  const avg = student ? getAverage(student.id) : '';
                  const merit = student ? meritPositions.get(student.id) : undefined;

                  return (
                    <tr key={student?.id || `empty-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-800 px-2 py-1 text-center text-sm font-medium text-gray-900">
                        {toBengaliNumber(serial)}
                      </td>
                      <td className="border border-gray-800 px-2 py-1 text-sm text-gray-900">
                        {student?.name || ''}
                      </td>
                      <td className="border border-gray-800 px-2 py-1 text-sm text-gray-900">
                        {student?.fatherName || ''}
                      </td>
                      {subjects.map(sub => (
                        <td key={sub.id} className="border border-gray-800 px-0 py-0 text-center">
                          {student ? (
                            <input
                              type="number"
                              value={marksData[student.id]?.[sub.id] ?? ''}
                              onChange={e => handleMarkChange(student.id, sub.id, e.target.value)}
                              className="w-full px-1 py-1 text-center text-sm border-0 bg-transparent focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              min="0"
                              max={sub.totalMarks}
                              data-testid={`input-mark-${student.id}-${sub.id}`}
                            />
                          ) : (
                            <div className="h-7"></div>
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-800 px-2 py-1 text-center text-sm font-semibold text-gray-900">
                        {student && total > 0 ? toBengaliNumber(total) : ''}
                      </td>
                      <td className="border border-gray-800 px-2 py-1 text-center text-sm text-gray-900">
                        {student && total > 0 ? toBengaliNumber(avg) : ''}
                      </td>
                      <td className="border border-gray-800 px-2 py-1 text-center text-sm font-semibold text-gray-900">
                        {merit ? toBengaliNumber(merit) : ''}
                      </td>
                      <td className="border border-gray-800 px-0 py-0 text-center">
                        {student ? (
                          <input
                            type="text"
                            value={(marksData[student.id]?.remarks as string) || ''}
                            onChange={e => handleRemarksChange(student.id, e.target.value)}
                            className="w-full px-1 py-1 text-center text-sm border-0 bg-transparent focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                            data-testid={`input-remarks-${student.id}`}
                          />
                        ) : (
                          <div className="h-7"></div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-end mt-12 px-8 pb-4">
              <div className="text-center">
                <div className="border-t border-gray-800 pt-1 px-8">
                  <p className="text-sm font-medium">শ্রেণী শিক্ষকের স্বাক্ষর</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 pt-1 px-8">
                  <p className="text-sm font-medium">পরীক্ষা কমিটির স্বাক্ষর</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 pt-1 px-8">
                  <p className="text-sm font-medium">প্রধান শিক্ষকের স্বাক্ষর</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedClass && (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg text-gray-500" data-testid="text-select-class-prompt">তাল শীট দেখতে উপরে থেকে একটি শ্রেণী নির্বাচন করুন</p>
        </div>
      )}

      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingSubject ? 'বিষয় সম্পাদনা' : 'নতুন বিষয় যোগ করুন'}</h3>
              <button onClick={() => { setShowSubjectModal(false); setEditingSubject(null); setNewSubjectName(''); setNewSubjectTotal('100'); }} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">বর্তমান বিষয়সমূহ:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {subjects.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded" data-testid={`subject-item-${sub.id}`}>
                    <span className="text-sm">{sub.name} (পূর্ণমান: {toBengaliNumber(sub.totalMarks)})</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingSubject(sub); setNewSubjectName(sub.name); setNewSubjectTotal(String(sub.totalMarks)); }} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeSubject(sub.id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-3" />

            <div className="grid grid-cols-5 gap-2 mb-3">
              <input
                type="text"
                placeholder="বিষয়ের নাম"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                className="col-span-3 px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                onKeyDown={e => { if (e.key === 'Enter') addSubject(); }}
                data-testid="input-subject-name"
              />
              <input
                type="number"
                placeholder="পূর্ণমান"
                value={newSubjectTotal}
                onChange={e => setNewSubjectTotal(e.target.value)}
                className="col-span-1 px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                data-testid="input-subject-total"
              />
              <button onClick={addSubject} className="col-span-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary text-sm" data-testid="button-save-subject">
                {editingSubject ? 'আপডেট' : 'যোগ'}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => { setShowSubjectModal(false); setEditingSubject(null); setNewSubjectName(''); setNewSubjectTotal('100'); }} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" data-testid="button-close-subject-modal">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSheet;
