import React, { useState, useEffect, useMemo } from 'react';
import { LoggedInUser, Course, TimetableEntry, Teacher, LeaveRequest, TeacherAttendance } from '../types';
import { BookOpenIcon, ClockIcon, AcademicCapIcon, ClipboardCheckIcon, CalendarIcon, LeaveIcon, XIcon } from '../constants';
import { useCountdown } from './useCountdown';

interface TeacherDashboardProps {
  user: LoggedInUser;
  contextData: {
    courses: Course[];
    timetable: TimetableEntry[];
    teachers: Teacher[];
    leaves: LeaveRequest[];
  };
  teacherAttendance: TeacherAttendance[];
  onAddAttendance: (attendance: Omit<TeacherAttendance, 'id'>) => void;
  onAddLeave: (leave: Omit<LeaveRequest, 'id' | 'reviewedBy' | 'reviewDate'>) => Promise<void>;
}

const CountdownUnit: React.FC<{ value: number, label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-white bg-opacity-20 rounded-lg p-3 text-white">
        <span className="text-3xl font-bold">{value.toString().padStart(2, '0')}</span>
        <span className="text-xs uppercase">{label}</span>
    </div>
);

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, contextData, teacherAttendance, onAddAttendance, onAddLeave }) => {
  const { courses, timetable, teachers, leaves } = contextData;
  const teacherDetails = teachers.find(t => t.id === user.id);
  const myCourses = courses.filter(course => course.instructor === user.name);
  const myTimetable = timetable.filter(entry => entry.teacherId === user.id).sort((a,b) => a.time.localeCompare(b.time));

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', reason: '' });


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLeave = useMemo(() => leaves.find(l => {
    const now = new Date();
    const start = new Date(`${l.startDate}T${l.startTime || '00:00:00'}`);
    const end = new Date(`${l.endDate}T${l.endTime || '23:59:59'}`);
    return l.teacherId === user.id && l.status === 'অনুমোদিত' && now >= start && now <= end;
  }), [leaves, user.id]);
  
  const endDateTime = activeLeave ? `${activeLeave.endDate}T${activeLeave.endTime || '23:59:59'}` : '';
  const { days, hours, minutes, seconds, isFinished } = useCountdown(endDateTime);

  const today = currentTime.toISOString().split('T')[0];
  const hasAttendedToday = useMemo(() => teacherAttendance.some(att => att.teacherId === user.id && att.date === today), [teacherAttendance, user.id, today]);

  const canMarkAttendance = useMemo(() => {
    const currentHour = currentTime.getHours();
    return currentHour >= 8 && currentHour < 16;
  }, [currentTime]);

  const handleMarkAttendance = () => {
    if (hasAttendedToday || !canMarkAttendance || activeLeave) return;
    onAddAttendance({
      teacherId: user.id,
      date: today,
      time: currentTime.toLocaleTimeString('bn-BD'),
      status: 'উপস্থিত',
    });
  };

  const attendanceStatus = useMemo(() => {
    if (activeLeave) return { text: 'আপনি ছুটিতে আছেন', disabled: true, bg: 'bg-gray-400' };
    if (hasAttendedToday) return { text: 'আজকের হাজিরা সম্পন্ন হয়েছে', disabled: true, bg: 'bg-green-600' };
    if (!canMarkAttendance) return { text: 'হাজিরার সময় শেষ', disabled: true, bg: 'bg-red-500' };
    return { text: 'হাজিরা দিন', disabled: false, bg: 'bg-primary hover:bg-secondary' };
  }, [activeLeave, hasAttendedToday, canMarkAttendance]);
  
  const handleLeaveInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLeave(prev => ({ ...prev, [name]: value }));
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
        alert("শেষ তারিখ শুরুর তারিখের আগে হতে পারে না।");
        return;
    }
    await onAddLeave({
        teacherId: user.id,
        teacherName: user.name,
        ...newLeave,
        status: 'বিচারাধীন',
        appliedDate: new Date().toISOString().split('T')[0],
    });
    setNewLeave({ startDate: '', endDate: '', startTime: '09:00', endTime: '17:00', reason: '' });
    setIsLeaveModalOpen(false);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">স্বাগতম, {user.name}</h1>
        <p className="text-text-secondary mt-1">আপনার ব্যক্তিগত ড্যাশবোর্ডে স্বাগতম।</p>
      </div>

      {activeLeave && !isFinished && (
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center mb-4">
              <CalendarIcon className="h-7 w-7" />
              <h2 className="text-xl font-semibold ml-3">আপনি বর্তমানে ছুটিতে আছেন</h2>
          </div>
          <p className="text-sm mb-4">কারণ: {activeLeave.reason}</p>
          <p className="text-sm mb-4 font-medium">আপনার ছুটি শেষ হবে: {new Date(activeLeave.endDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="grid grid-cols-4 gap-4 text-center">
              <CountdownUnit value={days} label="দিন" />
              <CountdownUnit value={hours} label="ঘন্টা" />
              <CountdownUnit value={minutes} label="মিনিট" />
              <CountdownUnit value={seconds} label="সেকেন্ড" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Actions Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-primary mb-4 text-center">দৈনিক কার্যক্রম</h2>
            
            {/* Attendance part */}
            <div className="w-full border-b pb-4 mb-4">
                <div className="flex items-center justify-center text-primary mb-2">
                    <ClipboardCheckIcon className="h-8 w-8" />
                    <h3 className="text-lg font-semibold ml-2">দৈনিক হাজিরা</h3>
                </div>
                <p className="text-sm text-text-secondary text-center mt-1 mb-2">{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <button
                    onClick={handleMarkAttendance}
                    disabled={attendanceStatus.disabled}
                    className={`w-full px-6 py-3 text-white font-bold rounded-lg transition-colors duration-300 ${attendanceStatus.bg}`}
                >
                    {attendanceStatus.text}
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">উপস্থিতির সময়: সকাল ৮:০০ - বিকাল ৪:০০</p>
            </div>

            {/* Leave application part */}
            <div className="w-full">
                <div className="flex items-center justify-center text-primary mb-2">
                     <LeaveIcon className="h-8 w-8" />
                     <h3 className="text-lg font-semibold ml-2">ছুটির আবেদন</h3>
                </div>
                <p className="text-sm text-text-secondary text-center mt-1 mb-2">প্রয়োজনে ছুটির জন্য আবেদন করুন</p>
                <button onClick={() => setIsLeaveModalOpen(true)} className="w-full px-6 py-3 text-white font-bold rounded-lg transition-colors duration-300 bg-blue-500 hover:bg-blue-600">
                    আবেদন করুন
                </button>
            </div>
        </div>
        
        {/* Profile and Courses */}
        <div className="lg:col-span-2 space-y-6">
            {teacherDetails && (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                        <AcademicCapIcon className="h-7 w-7 text-primary" />
                        <h2 className="text-xl font-semibold ml-3 text-text-primary">আমার প্রোফাইল</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-secondary">
                        <p><span className="font-semibold text-text-primary w-20 inline-block">পদবী:</span> {teacherDetails.designation}</p>
                        <p><span className="font-semibold text-text-primary w-20 inline-block">বিষয়:</span> {teacherDetails.subject}</p>
                        <p><span className="font-semibold text-text-primary w-20 inline-block">ইমেইল:</span> {teacherDetails.email}</p>
                        <p><span className="font-semibold text-text-primary w-20 inline-block">ঠিকানা:</span> {teacherDetails.address || 'N/A'}</p>
                    </div>
                </div>
            )}
             <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                    <BookOpenIcon className="h-7 w-7 text-primary" />
                    <h2 className="text-xl font-semibold ml-3 text-text-primary">আমার কোর্সসমূহ</h2>
                </div>
                {myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myCourses.map(course => (
                        <div key={course.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-primary">
                        <p className="font-semibold text-gray-800">{course.name}</p>
                        <p className="text-sm text-gray-500">সময়কাল: {course.duration}</p>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-text-secondary">আপনাকে এখনও কোনো কোর্স বরাদ্দ করা হয়নি।</p>
                )}
            </div>
        </div>
      </div>

       {/* My Timetable Card */}
       <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-7 w-7 text-primary" />
            <h2 className="text-xl font-semibold ml-3 text-text-primary">আমার সাপ্তাহিক সময়সূচী</h2>
          </div>
          {myTimetable.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">দিন</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">সময়</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">বিষয়</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">শ্রেণী</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {myTimetable.map(entry => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="py-3 px-3 whitespace-nowrap text-sm font-medium text-gray-800">{entry.day}</td>
                                <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-600">{entry.time}</td>
                                <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-600">{entry.subject}</td>
                                <td className="py-3 px-3 whitespace-nowrap text-sm text-gray-600">{entry.class}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-4">আপনার জন্য কোনো সময়সূচী পাওয়া যায়নি।</p>
          )}
        </div>
        
        {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">ছুটির জন্য আবেদন</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-800"><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">শুরুর তারিখ</label>
                      <input type="date" name="startDate" value={newLeave.startDate} onChange={handleLeaveInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                  <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">শুরুর সময়</label>
                      <input type="time" name="startTime" value={newLeave.startTime} onChange={handleLeaveInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">শেষ তারিখ</label>
                      <input type="date" name="endDate" value={newLeave.endDate} onChange={handleLeaveInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
                  <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">শেষ সময়</label>
                      <input type="time" name="endTime" value={newLeave.endTime} onChange={handleLeaveInputChange} className="mt-1 w-full px-4 py-2 border rounded-lg" required />
                  </div>
              </div>
              <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">কারণ</label>
                  <textarea name="reason" rows={4} value={newLeave.reason} onChange={handleLeaveInputChange} placeholder="ছুটির কারণ সংক্ষেপে লিখুন" className="mt-1 w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আবেদন জমা দিন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;