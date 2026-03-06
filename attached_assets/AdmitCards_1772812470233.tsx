

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student, Exam, AdmitCard, Course, Page, SignatureSettings } from '../types';
// Fix: Corrected firebase import path to point to the firebase module without extension.
import { storage } from '../firebase-config.ts';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { printContent } from './utils';

interface AdmitCardsProps {
    students: Student[];
    exams: Exam[];
    admitCards: AdmitCard[];
    courses: Course[];
    addAdmitCard: (admitCard: Omit<AdmitCard, 'id' | 'addedBy' | 'studentPhotoUrl'>) => void;
    updateAdmitCard: (admitCard: AdmitCard) => void;
    deleteAdmitCard: (admitCardId: string) => void;
    madrasahName: string;
    madrasahAddress: string;
    hasPermission: (page: Page) => boolean;
    classOptions: string[];
    signatureSettings: SignatureSettings;
}

const AdmitCardManagerModal: React.FC<{ 
    student: Student; 
    exam: Exam; 
    admitCard: AdmitCard;
    madrasahName: string; 
    madrasahAddress: string;
    signatureSettings: SignatureSettings;
    onClose: () => void;
    onUpdate: (admitCard: AdmitCard) => void;
}> = ({ student, exam, admitCard, madrasahName, madrasahAddress, signatureSettings, onClose, onUpdate }) => {
    
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(admitCard.studentPhotoUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!photoFile) return;
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `student_photos/${student.id}/${exam.id}`);
            const uploadTask = await uploadBytes(storageRef, photoFile);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            const updatedCard = { ...admitCard, studentPhotoUrl: downloadURL };
            onUpdate(updatedCard);
            setPhotoFile(null); // Clear file after upload
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("ছবি আপলোড করতে একটি ত্রুটি ঘটেছে।");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handlePrint = () => {
        printContent('admit-card-print-area', 'প্রবেশপত্র');
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl">
                <div id="admit-card-print-area" className="p-6 bg-white">
                    <div className="border-[3px] border-black">
                        <div className="border border-black m-1 p-4">
                            <div className="text-center space-y-1">
                                <h1 className="text-3xl font-bold">{madrasahName}</h1>
                                <p className="text-sm">{madrasahAddress}</p>
                                <div className="inline-block border-2 border-black rounded-md px-8 py-1 my-3">
                                    <h3 className="text-xl font-bold">প্রবেশপত্র</h3>
                                </div>
                                <p className="text-lg font-semibold">{exam.name}</p>
                            </div>

                            {/* Student Details */}
                            <div className="flex justify-between items-start mt-4 text-sm">
                                <div className="w-2/3 space-y-2">
                                    <p><span className="font-semibold w-24 inline-block">নাম</span>: {student.name}</p>
                                    <p><span className="font-semibold w-24 inline-block">পিতার নাম</span>: {student.fatherName}</p>
                                    <p><span className="font-semibold w-24 inline-block">রোল নং</span>: {student.rollNumber}</p>
                                    <p><span className="font-semibold w-24 inline-block">শ্রেণী</span>: {student.class}</p>
                                    <p><span className="font-semibold w-24 inline-block">ঠিকানা</span>: {student.address || 'N/A'}</p>
                                </div>
                                <div className="w-1/3 flex flex-col items-center">
                                    <div className="w-28 h-32 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>ছবি সংযুক্ত করুন</span>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden no-print" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs text-blue-600 hover:underline mt-1 no-print"
                                    >
                                        {photoPreview ? 'ছবি পরিবর্তন' : 'ছবি যোগ করুন'}
                                    </button>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="mt-12 flex justify-between items-end">
                                <div className="text-center">
                                    {signatureSettings.classTeacherSignatureUrl && (
                                        <img src={signatureSettings.classTeacherSignatureUrl} alt="শ্রেণি শিক্ষকের স্বাক্ষর" className="h-10 mx-auto mb-1" />
                                    )}
                                    <p className="border-t-2 border-dotted border-gray-700 w-48 text-center pt-1 text-sm">শ্রেণি শিক্ষকের স্বাক্ষর</p>
                                </div>
                                <div className="text-center">
                                     {signatureSettings.headmasterSignatureUrl && (
                                        <img src={signatureSettings.headmasterSignatureUrl} alt="মুহতামিমের স্বাক্ষর" className="h-10 mx-auto mb-1" />
                                    )}
                                    <p className="border-t-2 border-dotted border-gray-700 w-48 text-center pt-1 text-sm">মুহতামিমের স্বাক্ষর</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="bg-gray-100 px-6 py-3 flex justify-end space-x-3 rounded-b-lg no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">বন্ধ করুন</button>
                    {photoFile && (
                        <button onClick={handleSave} disabled={isUploading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            {isUploading ? 'সংরক্ষণ হচ্ছে...' : 'ছবি সংরক্ষণ করুন'}
                        </button>
                    )}
                    <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">প্রিন্ট করুন</button>
                </div>
            </div>
        </div>
    );
};

const AdmitCards: React.FC<AdmitCardsProps> = ({ students, exams, admitCards, courses, addAdmitCard, updateAdmitCard, deleteAdmitCard, madrasahName, madrasahAddress, hasPermission, classOptions, signatureSettings }) => {
    const [filterClass, setFilterClass] = useState(classOptions[0] || '');
    const [filterExam, setFilterExam] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const relevantExams = useMemo(() => {
        if (!filterClass) return [];
        const course = courses.find(c => c.name === filterClass);
        if (!course) return [];
        const courseExams = exams.filter(e => e.courseId === course.id);
        if (courseExams.length > 0 && !filterExam) {
            setFilterExam(courseExams[0].id);
        }
        return courseExams;
    }, [filterClass, courses, exams, filterExam]);
    
    useEffect(() => {
        if (relevantExams.length > 0 && !relevantExams.find(e => e.id === filterExam)) {
            setFilterExam(relevantExams[0].id);
        } else if (relevantExams.length === 0) {
            setFilterExam('');
        }
    }, [relevantExams, filterExam]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => s.class === filterClass);
    }, [students, filterClass]);
    
    const admitCardMap = useMemo(() => {
        const map = new Map<string, AdmitCard>();
        if (filterExam) {
            admitCards
                .filter(c => c.examId === filterExam)
                .forEach(c => map.set(c.studentId, c));
        }
        return map;
    }, [admitCards, filterExam]);

    const handleManageCard = (student: Student) => {
        if (!filterExam) {
            alert("অনুগ্রহ করে প্রথমে একটি পরীক্ষা নির্বাচন করুন।");
            return;
        }
        const existingCard = admitCardMap.get(student.id);
        if (existingCard) {
            setSelectedStudent(student);
        } else {
             addAdmitCard({
                studentId: student.id,
                examId: filterExam,
                issueDate: new Date().toISOString().split('T')[0],
            });
            // This relies on the state to update, which is async. 
            // We'll set the student, and the modal will open once admitCardMap updates.
            setSelectedStudent(student);
        }
    };

    const selectedExam = exams.find(e => e.id === filterExam);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">প্রবেশপত্র তৈরি</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-medium mb-2 text-text-primary">শ্রেণী ও পরীক্ষা নির্বাচন করুন</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">শ্রেণী</label>
                        <select id="classFilter" value={filterClass} onChange={e => setFilterClass(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            <option value="" disabled>শ্রেণী নির্বাচন করুন</option>
                            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="examFilter" className="block text-sm font-medium text-gray-700">পরীক্ষা</label>
                        <select id="examFilter" value={filterExam} onChange={e => setFilterExam(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" disabled={!filterClass}>
                            <option value="" disabled>পরীক্ষা নির্বাচন করুন</option>
                            {relevantExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">রোল</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">নাম</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">কার্ডের অবস্থা</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">কার্যক্রম</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map(student => {
                            const hasCard = admitCardMap.has(student.id);
                            return (
                                <tr key={student.id}>
                                    <td className="px-6 py-4">{student.rollNumber}</td>
                                    <td className="px-6 py-4 font-medium">{student.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasCard ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {hasCard ? 'ইস্যু করা হয়েছে' : 'ইস্যু করা হয়নি'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleManageCard(student)}
                                            disabled={!filterExam}
                                            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondary disabled:bg-gray-400"
                                        >
                                            {hasCard ? 'দেখুন / প্রিন্ট করুন' : 'কার্ড ইস্যু করুন'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredStudents.length === 0 && (
                    <p className="p-4 text-center text-gray-500">
                        {filterClass ? 'এই শ্রেণীতে কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'প্রবেশপত্র ইস্যু করতে অনুগ্রহ করে একটি শ্রেণী নির্বাচন করুন।'}
                    </p>
                )}
            </div>

            {selectedStudent && selectedExam && admitCardMap.has(selectedStudent.id) && (
                <AdmitCardManagerModal
                    student={selectedStudent}
                    exam={selectedExam}
                    admitCard={admitCardMap.get(selectedStudent.id)!}
                    madrasahName={madrasahName}
                    madrasahAddress={madrasahAddress}
                    signatureSettings={signatureSettings}
                    onClose={() => setSelectedStudent(null)}
                    onUpdate={updateAdmitCard}
                />
            )}
        </div>
    );
};

export default AdmitCards;