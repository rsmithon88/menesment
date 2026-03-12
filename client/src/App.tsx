import React, { useState, useCallback, useEffect, useMemo } from 'react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Teachers from './components/Teachers';
import Attendance from './components/Attendance';
import Fees from './components/Fees';
import Vouchers from './components/Vouchers';
import TeacherSalary from './components/TeacherSalary';
import Exams from './components/Exams';
import Results from './components/Results';
import Timetable from './components/Timetable';
import Library from './components/Library';
import NoticeBoard from './components/NoticeBoard';
import EventsCalendar from './components/EventsCalendar';
import Reports from './components/Reports';
import Settings from './components/Settings';
import LoginPage from './components/LoginPage';
import StudentInfo from './components/StudentInfo';
import ActivityLog from './components/ActivityLog';
import TeacherDashboard from './components/TeacherDashboard';
import AdmitCards from './components/AdmitCards';
import LeaveManagement from './components/LeaveManagement';
import TeacherAttendanceComponent from './components/TeacherAttendance';
import AdminRoles from './components/AdminRoles';
import MoneyReceipt from './components/MoneyReceipt';
import ResultSheet from './components/ResultSheet';
import { getDistance } from './components/utils';

import {
  Student, Teacher, Course, Page,
  Attendance as AttendanceType, Fee, Exam, TimetableEntry,
  Book, Notice, Event, LoggedInUser, Expense, Notification,
  NotificationPreferences, ActivityLogEntry, ActiveSession,
  Result, TeacherSalary as TeacherSalaryType, AdmitCard,
  LeaveRequest, SmsSettings, ReceiptBookSettings,
  SignatureSettings, LibrarySection, TeacherAttendance,
  GeofenceSettings
} from './types';

import {
  UsersIcon, AcademicCapIcon, HomeIcon, ClipboardListIcon,
  CurrencyDollarIcon, PencilAltIcon, ClockIcon, LibraryIcon,
  MegaphoneIcon, ChartBarIcon, CalendarIcon, CogIcon,
  IdentificationIcon, ShieldCheckIcon, DocumentTextIcon,
  ReceiptRefundIcon, CreditCardIcon, TicketIcon, LeaveIcon,
  XIcon, ClipboardCheckIcon, KeyIcon, MapPinIcon, TableIcon
} from './constants';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  return (
    <div className={`fixed bottom-6 right-6 max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${typeClasses[type]} z-[100] animate-fade-in-up flex items-center justify-between`} data-testid="toast-notification">
      <p className="mr-4">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black hover:bg-opacity-10" data-testid="button-close-toast">
        <XIcon className="h-4 w-4" />
      </button>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

const GlobalLoader: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex flex-col justify-center items-center">
    <div className="cube-container">
      <div className="cube">
        <div className="face front"></div>
        <div className="face back"></div>
        <div className="face right"></div>
        <div className="face left"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
      </div>
    </div>
    <p className="text-white text-lg mt-8 tracking-widest font-light">লোড হচ্ছে...</p>
    <style>{`
      .cube-container { width: 60px; height: 60px; perspective: 1000px; }
      .cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: rotate-cube 5s infinite linear; }
      .face { position: absolute; width: 60px; height: 60px; border: 1px solid #FFC107; background-color: rgba(255, 193, 7, 0.15); box-shadow: 0 0 20px rgba(255, 193, 7, 0.5); opacity: 0.8; }
      .face.front  { transform: rotateY(0deg) translateZ(30px); }
      .face.back   { transform: rotateY(180deg) translateZ(30px); }
      .face.right  { transform: rotateY(90deg) translateZ(30px); }
      .face.left   { transform: rotateY(-90deg) translateZ(30px); }
      .face.top    { transform: rotateX(90deg) translateZ(30px); }
      .face.bottom { transform: rotateX(-90deg) translateZ(30px); }
      @keyframes rotate-cube { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg); } }
    `}</style>
  </div>
);

type GeofenceStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'error';

interface LocationGatekeeperProps {
  user: LoggedInUser;
  settings: GeofenceSettings;
  onLogout: () => void;
  children: React.ReactNode;
}

const LocationGatekeeper: React.FC<LocationGatekeeperProps> = ({ user, settings, onLogout, children }) => {
  const [status, setStatus] = useState<GeofenceStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const isUserRestricted = settings.enabled && (settings.restrictedTeachers || []).includes(user.id);
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!isUserRestricted || isAdmin) { setStatus('granted'); return; }
    setStatus('checking'); setErrorMessage('');
    if (!navigator.geolocation) { setErrorMessage('আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।'); setStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLat, longitude: userLon } = position.coords;
        const centerLat = Number(settings.latitude); const centerLon = Number(settings.longitude); const radius = Number(settings.radius);
        if (isNaN(centerLat) || isNaN(centerLon) || isNaN(radius) || centerLat === 0 || centerLon === 0) { setErrorMessage('অবস্থানের সেটিংস সঠিকভাবে কনফিগার করা হয়নি।'); setStatus('error'); return; }
        const distance = getDistance(userLat, userLon, centerLat, centerLon);
        if (distance <= radius) { setStatus('granted'); } else { setErrorMessage(`আপনি নির্ধারিত এলাকা থেকে প্রায় ${Math.round(distance)} মিটার দূরে আছেন।`); setStatus('denied'); }
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED: setErrorMessage('আপনি লোকেশন অ্যাক্সেসের অনুমতি দেননি।'); break;
          case error.POSITION_UNAVAILABLE: setErrorMessage('আপনার বর্তমান অবস্থান খুঁজে পাওয়া যাচ্ছে না।'); break;
          default: setErrorMessage('অবস্থান যাচাই করার সময় একটি ত্রুটি ঘটেছে।'); break;
        }
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [user.id, user.role, settings]);

  if (status === 'granted') return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-background flex flex-col justify-center items-center p-4 text-center">
      <MapPinIcon className="h-16 w-16 text-primary mb-6" />
      <h2 className="text-2xl font-bold text-text-primary mb-2">অবস্থান যাচাইকরণ</h2>
      {status === 'checking' && (
        <>
          <p className="text-text-secondary">আপনার অবস্থান যাচাই করা হচ্ছে...</p>
          <div className="mt-6"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        </>
      )}
      {(status === 'denied' || status === 'error') && (
        <>
          <p className="text-red-600 bg-red-100 p-4 rounded-lg max-w-md">{errorMessage}</p>
          <button onClick={onLogout} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary" data-testid="button-logout-geofence">লগআউট</button>
        </>
      )}
    </div>
  );
};

async function api(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('ড্যাশবোর্ড');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [studentForInfo, setStudentForInfo] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGlobalLoading, setGlobalLoading] = useState(false);

  const [madrasahName, setMadrasahName] = useState('দারুল জান্নাত মহিলা কওমী মাদ্রাসা');
  const [madrasahAddress, setMadrasahAddress] = useState('মাদ্রাসার ঠিকানা');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [teacherSalaries, setTeacherSalaries] = useState<TeacherSalaryType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [resultsData, setResultsData] = useState<Result[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [booksData, setBooksData] = useState<Book[]>([]);
  const [librarySections, setLibrarySections] = useState<LibrarySection[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leavesData, setLeavesData] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogData, setActivityLogData] = useState<ActivityLogEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({ fees: true, exams: true, notices: true });
  const [adminUser, setAdminUser] = useState({ id: 'admin_user', name: 'অ্যাডমিন', email: 'admin@madrasa.com' });
  const [smsSettings, setSmsSettings] = useState<SmsSettings>({ mode: 'local', gatewayUrl: '', deviceId: '', apiKey: '', enabled: false });
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({ enabled: false, latitude: '', longitude: '', radius: 100, restrictedTeachers: [] });
  const [receiptBookSettings, setReceiptBookSettings] = useState<ReceiptBookSettings>({});
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings>({});
  const [receiptData, setReceiptData] = useState<{ fee: Fee; student: Student } | null>(null);

  const classOptions = useMemo(() => courses.map(c => c.name).sort((a, b) => a.localeCompare(b, 'bn-BD')), [courses]);

  const fetchAllData = useCallback(async () => {
    try {
      const endpoints = [
        { url: '/api/students', setter: setStudents },
        { url: '/api/teachers', setter: setTeachers },
        { url: '/api/courses', setter: setCourses },
        { url: '/api/attendance', setter: setAttendance },
        { url: '/api/teacherAttendance', setter: setTeacherAttendance },
        { url: '/api/fees', setter: setFees },
        { url: '/api/expenses', setter: setExpenses },
        { url: '/api/teacherSalaries', setter: setTeacherSalaries },
        { url: '/api/exams', setter: setExams },
        { url: '/api/results', setter: setResultsData },
        { url: '/api/timetable', setter: setTimetableData },
        { url: '/api/books', setter: setBooksData },
        { url: '/api/librarySections', setter: setLibrarySections },
        { url: '/api/notices', setter: setNotices },
        { url: '/api/events', setter: setEvents },
        { url: '/api/leaves', setter: setLeavesData },
        { url: '/api/notifications', setter: setNotifications },
        { url: '/api/admitCards', setter: setAdmitCards },
        { url: '/api/activityLog', setter: setActivityLogData },
        { url: '/api/activeSessions', setter: setActiveSessions },
      ];

      const fetchResults = await Promise.allSettled(endpoints.map(e => fetch(e.url).then(r => r.json())));
      fetchResults.forEach((result, i) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          (endpoints[i].setter as (v: any[]) => void)(result.value);
        }
      });

      const settingsKeys = ['config', 'smsConfig', 'geofenceConfig', 'receiptBookConfig', 'signatureConfig'];
      const settingsResults = await Promise.allSettled(settingsKeys.map(k => fetch(`/api/settings/${k}`).then(r => r.json())));

      settingsResults.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          const data = result.value;
          switch (settingsKeys[i]) {
            case 'config':
              if (data.madrasahName) setMadrasahName(data.madrasahName);
              if (data.madrasahAddress) setMadrasahAddress(data.madrasahAddress);
              if (data.notificationPreferences) setNotificationPreferences(data.notificationPreferences);
              if (data.isAdmin) {
                setAdminUser({ id: 'admin_user', name: data.isAdmin.adminName || 'অ্যাডমিন', email: data.isAdmin.adminUser || 'admin@madrasa.com' });
              }
              break;
            case 'smsConfig': setSmsSettings(prev => ({ ...prev, ...data })); break;
            case 'geofenceConfig': setGeofenceSettings(prev => ({ ...prev, ...data })); break;
            case 'receiptBookConfig': if (data) setReceiptBookSettings(data); break;
            case 'signatureConfig': if (data) setSignatureSettings(data); break;
          }
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const addActivityLog = useCallback(async (action: string) => {
    if (!currentUser?.name) return;
    try {
      await api('/api/activityLog', { method: 'POST', body: JSON.stringify({ timestamp: new Date().toISOString(), user: currentUser.name, action }) });
    } catch (error) { console.error("Error adding activity log:", error); }
  }, [currentUser]);

  const addDataItem = useCallback(async (collectionName: string, data: any) => {
    setGlobalLoading(true);
    try {
      const result = await api(`/api/${collectionName}`, { method: 'POST', body: JSON.stringify(data) });
      addActivityLog(`${collectionName}-এ নতুন আইটেম যোগ করা হয়েছে।`);
      setToast({ message: 'সফলভাবে যোগ করা হয়েছে।', type: 'success' });
      await fetchAllData();
      return result;
    } catch (error: any) {
      console.error(`Error adding to ${collectionName}:`, error);
      setToast({ message: `যোগ করতে ব্যর্থ: ${error.message}`, type: 'error' });
      throw error;
    } finally { setGlobalLoading(false); }
  }, [addActivityLog, fetchAllData]);

  const updateDataItem = useCallback(async (collectionName: string, id: string, data: any) => {
    setGlobalLoading(true);
    try {
      await api(`/api/${collectionName}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      addActivityLog(`${collectionName}-এ "${id}" আপডেট করা হয়েছে।`);
      setToast({ message: 'সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
      await fetchAllData();
    } catch (error: any) {
      console.error(`Error updating ${collectionName}:`, error);
      setToast({ message: `আপডেট করতে ব্যর্থ: ${error.message}`, type: 'error' });
    } finally { setGlobalLoading(false); }
  }, [addActivityLog, fetchAllData]);

  const deleteDataItem = useCallback(async (collectionName: string, id: string) => {
    setGlobalLoading(true);
    try {
      await api(`/api/${collectionName}/${id}`, { method: 'DELETE' });
      addActivityLog(`${collectionName}-এ "${id}" মুছে ফেলা হয়েছে।`);
      setToast({ message: 'সফলভাবে মুছে ফেলা হয়েছে।', type: 'success' });
      await fetchAllData();
    } catch (error: any) {
      console.error(`Error deleting from ${collectionName}:`, error);
      setToast({ message: `মুছে ফেলতে ব্যর্থ: ${error.message}`, type: 'error' });
    } finally { setGlobalLoading(false); }
  }, [addActivityLog, fetchAllData]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setGlobalLoading(true);
    try {
      const user = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setCurrentUser(user);
      setToast({ message: `স্বাগতম, ${user.name}!`, type: 'success' });
      await api('/api/activeSessions/upsert', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, userName: user.name, userRole: user.role, loginTime: new Date().toISOString(), lastActive: new Date().toISOString() })
      });
      await fetchAllData();
    } catch (error: any) {
      setToast({ message: error.message || 'লগইন ব্যর্থ হয়েছে।', type: 'error' });
      throw error;
    } finally { setGlobalLoading(false); }
  }, [fetchAllData]);

  const handleLogout = useCallback(async () => {
    setGlobalLoading(true);
    try {
      if (currentUser) {
        await api(`/api/activeSessions/user/${currentUser.id}`, { method: 'DELETE' }).catch(() => {});
        addActivityLog(`ব্যবহারকারী "${currentUser.name}" লগআউট করেছেন।`);
      }
      setCurrentUser(null);
      setActivePage('ড্যাশবোর্ড');
      setToast({ message: 'সফলভাবে লগআউট হয়েছে।', type: 'info' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally { setGlobalLoading(false); }
  }, [currentUser, addActivityLog]);

  const handleUpdateProfilePicture = async (_file: File) => {
    setToast({ message: 'প্রোফাইল ছবি আপডেটের ফিচারটি শীঘ্রই আসছে।', type: 'info' });
  };

  const handleAddStudent = (student: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('students', { ...student, addedBy: currentUser?.name });
  const handleUpdateStudent = (student: Student) => updateDataItem('students', student.id, { ...student, lastModifiedBy: currentUser?.name });
  const handleDeleteStudent = (id: string) => deleteDataItem('students', id);

  const handleAddMultipleStudents = async (newStudents: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>[]) => {
    setGlobalLoading(true);
    try {
      await api('/api/students/bulk', { method: 'POST', body: JSON.stringify(newStudents.map(s => ({ ...s, addedBy: currentUser?.name }))) });
      setToast({ message: `${newStudents.length} জন শিক্ষার্থী সফলভাবে যোগ করা হয়েছে।`, type: 'success' });
      await fetchAllData();
    } catch (error: any) {
      setToast({ message: 'একাধিক শিক্ষার্থী যোগ করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally { setGlobalLoading(false); }
  };

  const handleAddTeacher = async (teacher: Omit<Teacher, 'id' | 'uid' | 'addedBy' | 'lastModifiedBy'> & { password: string }) => {
    setGlobalLoading(true);
    try {
      const { password, ...teacherData } = teacher;
      await addDataItem('teachers', { ...teacherData, addedBy: currentUser?.name });
      setToast({ message: 'শিক্ষক সফলভাবে যোগ করা হয়েছে।', type: 'success' });
    } catch (error: any) {
      setToast({ message: 'শিক্ষক যোগ করতে ব্যর্থ।', type: 'error' });
    } finally { setGlobalLoading(false); }
  };
  const handleUpdateTeacher = (teacher: Teacher) => updateDataItem('teachers', teacher.id, { ...teacher, lastModifiedBy: currentUser?.name });
  const handleDeleteTeacher = (id: string) => deleteDataItem('teachers', id);

  const handleAddCourse = (course: Omit<Course, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('courses', { ...course, addedBy: currentUser?.name });
  const handleDeleteCourse = useCallback(async (id: string) => { deleteDataItem('courses', id); }, [deleteDataItem]);

  const handleAddAttendance = (record: Omit<AttendanceType, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('attendance', { ...record, addedBy: currentUser?.name });
  const handleUpdateAttendance = (record: AttendanceType) => updateDataItem('attendance', record.id, { ...record, lastModifiedBy: currentUser?.name });
  const handleDeleteAttendance = (id: string) => deleteDataItem('attendance', id);

  const handleAddTeacherAttendance = (att: Omit<TeacherAttendance, 'id'>) => addDataItem('teacherAttendance', att);

  const sendFeeConfirmationSms = useCallback(async (fee: Fee, student: Student) => {
    if (!smsSettings.enabled || !student.parentContact) return;
    const childTerm = student.gender === 'female' ? 'মেয়ে' : 'ছেলে';
    const message = `${madrasahName},\n\nআপনার ${childTerm} ${student.name} -এর বেতন ৳${fee.amount} সফলভাবে গ্রহণ করা হয়েছে।\n\n- ${currentUser?.name || 'অ্যাডমিন'}`;
    let to = student.parentContact;
    if (!to.startsWith('+88')) { to = to.length === 11 && to.startsWith('0') ? `+88${to}` : `+880${to.slice(-10)}`; }
    try {
      let response;
      if (smsSettings.mode === 'cloud') {
        const url = `https://api.textbee.dev/api/v1/gateway/devices/${smsSettings.deviceId}/sendSMS`;
        response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": smsSettings.apiKey }, body: JSON.stringify({ recipients: [to], message }) });
      } else {
        response = await fetch(smsSettings.gatewayUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "api-key": smsSettings.apiKey, to, message }) });
      }
      if (response.ok) { setToast({ message: `মেসেজ পাঠানো হয়েছে।`, type: 'success' }); }
      else { throw new Error('SMS সার্ভার থেকে ত্রুটি'); }
    } catch (error: any) { setToast({ message: `SMS পাঠাতে ব্যর্থ`, type: 'error' }); }
  }, [smsSettings, madrasahName, currentUser?.name]);

  const sendSalaryConfirmationSms = useCallback(async (salary: TeacherSalaryType, teacher: Teacher) => {
    if (!smsSettings.enabled || !teacher.phone) return;
    const message = `প্রিয় ${teacher.name},\n\nআপনার ${salary.month}, ${salary.year} মাসের বেতন ৳${salary.amount} সফলভাবে প্রদান করা হয়েছে।\n\n- ${madrasahName}`;
    let to = teacher.phone;
    if (!to.startsWith('+88')) { to = to.length === 11 && to.startsWith('0') ? `+88${to}` : `+880${to.slice(-10)}`; }
    try {
      let response;
      if (smsSettings.mode === 'cloud') {
        response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${smsSettings.deviceId}/sendSMS`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": smsSettings.apiKey }, body: JSON.stringify({ recipients: [to], message }) });
      } else {
        response = await fetch(smsSettings.gatewayUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "api-key": smsSettings.apiKey, to, message }) });
      }
      if (response.ok) { setToast({ message: `শিক্ষক ${teacher.name}-কে মেসেজ পাঠানো হয়েছে।`, type: 'success' }); }
    } catch (error: any) { setToast({ message: `বেতনের SMS পাঠাতে ব্যর্থ`, type: 'error' }); }
  }, [smsSettings, madrasahName]);

  const handleAddFee = async (fee: Omit<Fee, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
    const student = students.find(s => s.id === fee.studentId);
    if (fee.status === 'পরিশোধিত' && student) { sendFeeConfirmationSms(fee as Fee, student); }
    addDataItem('fees', { ...fee, addedBy: currentUser?.name });
  };

  const handleUpdateFee = async (fee: Fee) => {
    setGlobalLoading(true);
    try {
      const originalFee = fees.find(f => f.id === fee.id);
      let feeToUpdate = { ...fee };
      if (feeToUpdate.status === 'পরিশোধিত' && originalFee?.status !== 'পরিশোধিত') {
        const student = students.find(s => s.id === feeToUpdate.studentId);
        if (student) {
          const { receiptNumber } = await api('/api/receipt-number', { method: 'POST' });
          const bookNumber = receiptBookSettings[student.class] || 0;
          feeToUpdate = { ...feeToUpdate, receiptNumber, bookNumber, paymentDate: new Date().toISOString().split('T')[0] };
          setReceiptData({ fee: feeToUpdate, student });
          sendFeeConfirmationSms(feeToUpdate, student);
        }
      }
      feeToUpdate.lastModifiedBy = currentUser?.name;
      await api(`/api/fees/${fee.id}`, { method: 'PATCH', body: JSON.stringify(feeToUpdate) });
      setToast({ message: 'ফি সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
      await fetchAllData();
    } catch (error) {
      setToast({ message: 'ফি আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally { setGlobalLoading(false); }
  };

  const handleDeleteFee = (id: string) => deleteDataItem('fees', id);
  const handleAddMultipleFees = async (newFees: Omit<Fee, 'id'>[]) => {
    setGlobalLoading(true);
    try {
      await api('/api/fees/bulk', { method: 'POST', body: JSON.stringify(newFees) });
      setToast({ message: `${newFees.length}টি ফি সফলভাবে যোগ করা হয়েছে।`, type: 'success' });
      await fetchAllData();
    } catch (error) { setToast({ message: 'একাধিক ফি যোগ করতে ব্যর্থ হয়েছে।', type: 'error' }); }
    finally { setGlobalLoading(false); }
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('expenses', { ...expense, addedBy: currentUser?.name });
  const handleUpdateExpense = (expense: Expense) => updateDataItem('expenses', expense.id, { ...expense, lastModifiedBy: currentUser?.name });
  const handleDeleteExpense = (id: string) => deleteDataItem('expenses', id);

  const handleAddSalary = (salary: Omit<TeacherSalaryType, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
    if (salary.status === 'পরিশোধিত') {
      const teacher = teachers.find(t => t.id === salary.teacherId);
      if (teacher) sendSalaryConfirmationSms(salary as TeacherSalaryType, teacher);
    }
    addDataItem('teacherSalaries', { ...salary, addedBy: currentUser?.name });
  };
  const handleUpdateSalary = (salary: TeacherSalaryType) => {
    const originalSalary = teacherSalaries.find(s => s.id === salary.id);
    if (salary.status === 'পরিশোধিত' && originalSalary?.status !== 'পরিশোধিত') {
      const teacher = teachers.find(t => t.id === salary.teacherId);
      if (teacher) sendSalaryConfirmationSms(salary, teacher);
    }
    updateDataItem('teacherSalaries', salary.id, { ...salary, lastModifiedBy: currentUser?.name });
  };
  const handleDeleteSalary = (id: string) => deleteDataItem('teacherSalaries', id);

  const handleAddExam = (exam: Omit<Exam, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('exams', { ...exam, addedBy: currentUser?.name });
  const handleUpdateExam = (exam: Exam) => updateDataItem('exams', exam.id, { ...exam, lastModifiedBy: currentUser?.name });
  const handleDeleteExam = (id: string) => deleteDataItem('exams', id);

  const handleAddResult = async (result: Omit<Result, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
    await addDataItem('results', { ...result, addedBy: currentUser?.name });
  };
  const handleUpdateResult = (result: Result) => updateDataItem('results', result.id, { ...result, lastModifiedBy: currentUser?.name });
  const handleDeleteResult = (id: string) => deleteDataItem('results', id);

  const handleAddTimetableEntry = (entry: Omit<TimetableEntry, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('timetable', { ...entry, addedBy: currentUser?.name });
  const handleUpdateTimetableEntry = (entry: TimetableEntry) => updateDataItem('timetable', entry.id, { ...entry, lastModifiedBy: currentUser?.name });
  const handleDeleteTimetableEntry = (id: string) => deleteDataItem('timetable', id);

  const handleAddBook = (book: Omit<Book, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('books', { ...book, addedBy: currentUser?.name });
  const handleUpdateBook = (book: Book) => updateDataItem('books', book.id, { ...book, lastModifiedBy: currentUser?.name });
  const handleDeleteBook = (id: string) => deleteDataItem('books', id);
  const handleToggleBookAvailability = (bookId: string) => {
    const book = booksData.find(b => b.id === bookId);
    if (book) updateDataItem('books', book.id, { isAvailable: !book.isAvailable });
  };
  const handleAddSection = (section: Omit<LibrarySection, 'id'>) => addDataItem('librarySections', section);
  const handleUpdateSection = (section: LibrarySection) => updateDataItem('librarySections', section.id, section);
  const handleDeleteSection = (id: string) => deleteDataItem('librarySections', id);

  const handleAddNotice = async (notice: Omit<Notice, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
    await addDataItem('notices', { ...notice, addedBy: currentUser?.name });
  };
  const handleUpdateNotice = (notice: Notice) => updateDataItem('notices', notice.id, { ...notice, lastModifiedBy: currentUser?.name });
  const handleDeleteNotice = (id: string) => deleteDataItem('notices', id);

  const handleAddEvent = (event: Omit<Event, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('events', { ...event, addedBy: currentUser?.name });
  const handleUpdateEvent = (event: Event) => updateDataItem('events', event.id, { ...event, lastModifiedBy: currentUser?.name });
  const handleDeleteEvent = (id: string) => deleteDataItem('events', id);

  const handleAddAdmitCard = (card: Omit<AdmitCard, 'id' | 'addedBy' | 'studentPhotoUrl'>) => addDataItem('admitCards', { ...card, addedBy: currentUser?.name });
  const handleUpdateAdmitCard = (card: AdmitCard) => updateDataItem('admitCards', card.id, card);
  const handleDeleteAdmitCard = (id: string) => deleteDataItem('admitCards', id);

  const handleAddLeave = (leave: Omit<LeaveRequest, 'id' | 'reviewedBy' | 'reviewDate'>) => addDataItem('leaves', leave);
  const handleUpdateLeave = (leave: LeaveRequest) => updateDataItem('leaves', leave.id, leave);
  const handleDeleteLeave = (id: string) => deleteDataItem('leaves', id);

  const handleUpdateGeneralSettings = (name: string, address: string) => {
    api('/api/settings/config', { method: 'POST', body: JSON.stringify({ madrasahName: name, madrasahAddress: address }) }).then(() => {
      setMadrasahName(name); setMadrasahAddress(address);
      setToast({ message: 'সেটিংস আপডেট করা হয়েছে।', type: 'success' });
    });
  };
  const handleUpdateNotificationPrefs = (prefs: NotificationPreferences) => {
    api('/api/settings/config', { method: 'POST', body: JSON.stringify({ notificationPreferences: prefs }) }).then(() => {
      setNotificationPreferences(prefs); setToast({ message: 'বিজ্ঞপ্তি সেটিংস আপডেট করা হয়েছে।', type: 'success' });
    });
  };
  const handleUpdateSmsSettings = (settings: SmsSettings) => {
    api('/api/settings/smsConfig', { method: 'POST', body: JSON.stringify(settings) }).then(() => {
      setSmsSettings(settings); setToast({ message: 'SMS সেটিংস আপডেট করা হয়েছে।', type: 'success' });
    });
  };
  const handleUpdateGeofenceSettings = (settings: GeofenceSettings) => {
    api('/api/settings/geofenceConfig', { method: 'POST', body: JSON.stringify(settings) }).then(() => {
      setGeofenceSettings(settings); setToast({ message: 'জিওফেন্স সেটিংস আপডেট করা হয়েছে।', type: 'success' });
    });
  };
  const handleUpdateReceiptBookSettings = (settings: ReceiptBookSettings) => {
    api('/api/settings/receiptBookConfig', { method: 'POST', body: JSON.stringify(settings) }).then(() => {
      setReceiptBookSettings(settings); setToast({ message: 'রশিদ বই সেটিংস আপডেট করা হয়েছে।', type: 'success' });
    });
  };
  const handleUpdateSignatures = async (_file: File, _type: 'classTeacher' | 'headmaster') => {
    setToast({ message: 'স্বাক্ষর আপডেটের ফিচারটি শীঘ্রই আসছে।', type: 'info' });
  };
  const handleUpdateAdmin = async (name: string, email: string, _password?: string) => {
    setGlobalLoading(true);
    try {
      await api('/api/settings/config', { method: 'POST', body: JSON.stringify({ isAdmin: { adminName: name, adminUser: email } }) });
      setAdminUser({ id: adminUser.id, name, email });
      setToast({ message: 'অ্যাডমিন তথ্য সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
    } catch (error) {
      setToast({ message: 'অ্যাডমিন তথ্য আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally { setGlobalLoading(false); }
  };

  const handleMarkNotificationAsRead = (id: string) => { updateDataItem('notifications', id, { isRead: true }); };
  const handleMarkAllNotificationsAsRead = () => {
    api('/api/notifications/mark-all-read', { method: 'POST' }).then(() => fetchAllData());
  };

  const handleViewStudentInfo = (student: Student) => { setStudentForInfo(student); setActivePage('শিক্ষার্থী তথ্য'); };

  const hasPermission = useCallback((page: Page): boolean => {
    if (!currentUser) return false;
    if (page === 'অ্যাডমিন রোল' || page === 'সেটিংস') return currentUser.role === 'admin';
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return true;
    const teacher = teachers.find(t => t.id === currentUser.id);
    if (!teacher) return false;
    if (page === 'ড্যাশবোর্ড' || page === 'শিক্ষক হাজিরা') return true;
    return teacher.responsibilities.includes(page);
  }, [currentUser, teachers]);

  const navigationItems = useMemo(() => [
    { name: 'ড্যাশবোর্ড' as Page, icon: HomeIcon },
    { name: 'শিক্ষার্থীরা' as Page, icon: UsersIcon },
    { name: 'শিক্ষকগণ' as Page, icon: AcademicCapIcon },
    { name: 'শিক্ষক হাজিরা' as Page, icon: ClipboardCheckIcon },
    { name: 'হাজিরা' as Page, icon: ClipboardListIcon },
    { name: 'ফি ব্যবস্থাপনা' as Page, icon: CurrencyDollarIcon },
    { name: 'ব্যয় ব্যবস্থাপনা' as Page, icon: ReceiptRefundIcon },
    { name: 'শিক্ষকদের বেতন' as Page, icon: CreditCardIcon },
    { name: 'পরীক্ষা' as Page, icon: PencilAltIcon },
    { name: 'রেজাল্ট' as Page, icon: DocumentTextIcon },
    { name: 'তাল শীট' as Page, icon: TableIcon },
    { name: 'প্রবেশপত্র' as Page, icon: TicketIcon },
    { name: 'ছুটির আবেদন' as Page, icon: LeaveIcon },
    { name: 'সময়সূচী' as Page, icon: ClockIcon },
    { name: 'লাইব্রেরি' as Page, icon: LibraryIcon },
    { name: 'নোটিশ বোর্ড' as Page, icon: MegaphoneIcon },
    { name: 'ইভেন্ট ক্যালেন্ডার' as Page, icon: CalendarIcon },
    { name: 'রিপোর্ট' as Page, icon: ChartBarIcon },
    { name: 'শিক্ষার্থী তথ্য' as Page, icon: IdentificationIcon },
    { name: 'কার্যকলাপ লগ' as Page, icon: ShieldCheckIcon },
    { name: 'অ্যাডমিন রোল' as Page, icon: KeyIcon },
    { name: 'সেটিংস' as Page, icon: CogIcon },
  ].filter(item => hasPermission(item.name)), [hasPermission]);

  const renderPage = () => {
    if (!hasPermission(activePage) && activePage !== 'ড্যাশবোর্ড') {
      return <div className="text-center p-8"><p className="text-xl text-red-600">এই পৃষ্ঠাটি দেখার জন্য আপনার অনুমতি নেই।</p></div>;
    }
    switch (activePage) {
      case 'ড্যাশবোর্ড': return currentUser?.role === 'teacher'
        ? <TeacherDashboard user={currentUser} contextData={{ courses, timetable: timetableData, teachers, leaves: leavesData }} teacherAttendance={teacherAttendance} onAddAttendance={handleAddTeacherAttendance} onAddLeave={handleAddLeave} />
        : <Dashboard students={students} teachers={teachers} fees={fees} expenses={expenses} teacherSalaries={teacherSalaries} />;
      case 'শিক্ষার্থীরা': return <Students students={students} exams={exams} courses={courses} addStudent={handleAddStudent} addMultipleStudents={handleAddMultipleStudents} updateStudent={handleUpdateStudent} deleteStudent={handleDeleteStudent} hasPermission={hasPermission} onViewInfo={handleViewStudentInfo} classOptions={classOptions} addCourse={handleAddCourse} deleteCourse={handleDeleteCourse} />;
      case 'শিক্ষকগণ': return <Teachers teachers={teachers} addTeacher={handleAddTeacher} updateTeacher={handleUpdateTeacher} deleteTeacher={handleDeleteTeacher} hasPermission={hasPermission} currentUser={currentUser!} />;
      case 'হাজিরা': return <Attendance attendance={attendance} students={students} addAttendance={handleAddAttendance} updateAttendance={handleUpdateAttendance} deleteAttendance={handleDeleteAttendance} hasPermission={hasPermission} />;
      case 'শিক্ষক হাজিরা': return <TeacherAttendanceComponent currentUser={currentUser!} teacherAttendance={teacherAttendance} teachers={teachers} />;
      case 'ফি ব্যবস্থাপনা': return <Fees fees={fees} students={students} addFee={handleAddFee} updateFee={handleUpdateFee} deleteFee={handleDeleteFee} addMultipleFees={handleAddMultipleFees} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'ব্যয় ব্যবস্থাপনা': return <Vouchers expenses={expenses} addExpense={handleAddExpense} updateExpense={handleUpdateExpense} deleteExpense={handleDeleteExpense} hasPermission={hasPermission} madrasahName={madrasahName} madrasahAddress={madrasahAddress} currentUser={currentUser!} />;
      case 'শিক্ষকদের বেতন': return <TeacherSalary salaries={teacherSalaries} teachers={teachers} addSalary={handleAddSalary} updateSalary={handleUpdateSalary} deleteSalary={handleDeleteSalary} hasPermission={hasPermission} />;
      case 'পরীক্ষা': return <Exams exams={exams} courses={courses} addExam={handleAddExam} updateExam={handleUpdateExam} deleteExam={handleDeleteExam} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'রেজাল্ট': return <Results results={resultsData} students={students} exams={exams} courses={courses} addResult={handleAddResult} updateResult={handleUpdateResult} deleteResult={handleDeleteResult} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'তাল শীট': return <ResultSheet students={students} courses={courses} hasPermission={hasPermission} classOptions={classOptions} madrasahName={madrasahName} />;
      case 'প্রবেশপত্র': return <AdmitCards students={students} exams={exams} admitCards={admitCards} courses={courses} addAdmitCard={handleAddAdmitCard} updateAdmitCard={handleUpdateAdmitCard} deleteAdmitCard={handleDeleteAdmitCard} madrasahName={madrasahName} madrasahAddress={madrasahAddress} hasPermission={hasPermission} classOptions={classOptions} signatureSettings={signatureSettings} />;
      case 'ছুটির আবেদন': return <LeaveManagement currentUser={currentUser!} teachers={teachers} leaves={leavesData} addLeave={handleAddLeave} updateLeave={handleUpdateLeave} deleteLeave={handleDeleteLeave} />;
      case 'সময়সূচী': return <Timetable timetable={timetableData} teachers={teachers} addTimetableEntry={handleAddTimetableEntry} updateTimetableEntry={handleUpdateTimetableEntry} deleteTimetableEntry={handleDeleteTimetableEntry} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'লাইব্রেরি': return <Library books={booksData} sections={librarySections} addBook={handleAddBook} updateBook={handleUpdateBook} deleteBook={handleDeleteBook} toggleBookAvailability={handleToggleBookAvailability} addSection={handleAddSection} updateSection={handleUpdateSection} deleteSection={handleDeleteSection} hasPermission={hasPermission} />;
      case 'নোটিশ বোর্ড': return <NoticeBoard notices={notices} addNotice={handleAddNotice} updateNotice={handleUpdateNotice} deleteNotice={handleDeleteNotice} hasPermission={hasPermission} />;
      case 'ইভেন্ট ক্যালেন্ডার': return <EventsCalendar events={events} addEvent={handleAddEvent} updateEvent={handleUpdateEvent} deleteEvent={handleDeleteEvent} hasPermission={hasPermission} />;
      case 'রিপোর্ট': return <Reports data={{ students, teachers, attendance, fees, expenses, teacherSalaries }} classOptions={classOptions} />;
      case 'সেটিংস': return <Settings madrasahName={madrasahName} madrasahAddress={madrasahAddress} onUpdateSettings={handleUpdateGeneralSettings} preferences={notificationPreferences} onUpdatePreferences={handleUpdateNotificationPrefs} currentUser={currentUser!} adminUser={adminUser} onUpdateAdmin={handleUpdateAdmin} smsSettings={smsSettings} onUpdateSmsSettings={handleUpdateSmsSettings} geofenceSettings={geofenceSettings} onUpdateGeofenceSettings={handleUpdateGeofenceSettings} teachers={teachers} classOptions={classOptions} receiptBookSettings={receiptBookSettings} onUpdateReceiptBookSettings={handleUpdateReceiptBookSettings} signatureSettings={signatureSettings} onUpdateSignatures={handleUpdateSignatures} />;
      case 'শিক্ষার্থী তথ্য': return <StudentInfo students={students} fees={fees} attendance={attendance} results={resultsData} exams={exams} madrasahName={madrasahName} madrasahAddress={madrasahAddress} initialStudent={studentForInfo} classOptions={classOptions} />;
      case 'কার্যকলাপ লগ': return <ActivityLog logs={activityLogData} activeSessions={activeSessions} />;
      case 'অ্যাডমিন রোল': return <AdminRoles teachers={teachers} onUpdateTeacher={handleUpdateTeacher} />;
      default: return <p>Page not found.</p>;
    }
  };

  if (!currentUser) {
    return (
      <>
        {isGlobalLoading && <GlobalLoader />}
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      {isGlobalLoading && <GlobalLoader />}
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <LocationGatekeeper user={currentUser} settings={geofenceSettings} onLogout={handleLogout}>
        <div className="flex h-screen bg-background font-sans">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isOpen={isSidebarOpen}
            setIsOpen={setSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            navigationItems={navigationItems}
            madrasahName={madrasahName}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={activePage}
              user={currentUser}
              onLogout={handleLogout}
              onMenuClick={() => setSidebarOpen(true)}
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onNavigate={setActivePage}
              onUpdateProfilePicture={handleUpdateProfilePicture}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
              {renderPage()}
            </main>
          </div>
          {receiptData && (
            <MoneyReceipt
              feeData={receiptData.fee}
              student={receiptData.student}
              madrasahName={madrasahName}
              madrasahAddress={madrasahAddress}
              collectorName={currentUser.name}
              onClose={() => setReceiptData(null)}
            />
          )}
        </div>
      </LocationGatekeeper>
    </>
  );
};

export default App;
