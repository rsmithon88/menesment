

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
// Fix: Corrected firebase import to point to the typescript module.
import { db, auth, storage } from './firebase-config.ts';
import {
    collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, runTransaction, writeBatch
} from 'firebase/firestore';
import {
    signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


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
import { Student, Teacher, Course, Page, Attendance as AttendanceType, Fee, Exam, TimetableEntry, Book, Notice, Event, LoggedInUser, Expense, Notification, NotificationPreferences, ActivityLogEntry, ActiveSession, Result, TeacherSalary as TeacherSalaryType, AdmitCard, LeaveRequest, SmsSettings, ReceiptBookSettings, SignatureSettings, LibrarySection, TeacherAttendance, GeofenceSettings } from './types';
import { 
    UsersIcon, AcademicCapIcon, HomeIcon, ClipboardListIcon, CurrencyDollarIcon,
    PencilAltIcon, ClockIcon, LibraryIcon, MegaphoneIcon, ChartBarIcon, CalendarIcon, CogIcon, IdentificationIcon, ShieldCheckIcon, DocumentTextIcon, ReceiptRefundIcon, CreditCardIcon, TicketIcon, LeaveIcon, XIcon, ClipboardCheckIcon, KeyIcon, MapPinIcon
} from './constants';
import MoneyReceipt from './components/MoneyReceipt';
import { getDistance } from './components/utils';


// Toast Notification Component
interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  return (
    <div className={`fixed bottom-6 right-6 max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${typeClasses[type]} z-[100] animate-fade-in-up flex items-center justify-between`}>
      <p className="mr-4">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black hover:bg-opacity-10">
        <XIcon className="h-4 w-4" />
      </button>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Global Loader Component
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
      .cube-container {
        width: 60px;
        height: 60px;
        perspective: 1000px;
      }
      .cube {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        animation: rotate-cube 5s infinite linear;
      }
      .face {
        position: absolute;
        width: 60px;
        height: 60px;
        border: 1px solid #FFC107;
        background-color: rgba(255, 193, 7, 0.15);
        box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
        opacity: 0.8;
      }
      .face.front  { transform: rotateY(  0deg) translateZ(30px); }
      .face.back   { transform: rotateY(180deg) translateZ(30px); }
      .face.right  { transform: rotateY( 90deg) translateZ(30px); }
      .face.left   { transform: rotateY(-90deg) translateZ(30px); }
      .face.top    { transform: rotateX( 90deg) translateZ(30px); }
      .face.bottom { transform: rotateX(-90deg) translateZ(30px); }
      @keyframes rotate-cube {
        0% {
          transform: rotateX(0deg) rotateY(0deg);
        }
        100% {
          transform: rotateX(360deg) rotateY(360deg);
        }
      }
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

        if (!isUserRestricted || isAdmin) {
            setStatus('granted');
            return;
        }

        setStatus('checking');
        setErrorMessage('');

        if (!navigator.geolocation) {
            setErrorMessage('আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।');
            setStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: userLat, longitude: userLon } = position.coords;
                const centerLat = Number(settings.latitude);
                const centerLon = Number(settings.longitude);
                const radius = Number(settings.radius);

                if (isNaN(centerLat) || isNaN(centerLon) || isNaN(radius) || centerLat === 0 || centerLon === 0) {
                    setErrorMessage('অবস্থানের সেটিংস সঠিকভাবে কনফিগার করা হয়নি।');
                    setStatus('error');
                    return;
                }

                const distance = getDistance(userLat, userLon, centerLat, centerLon);
                
                if (distance <= radius) {
                    setStatus('granted');
                } else {
                    setErrorMessage(`আপনি নির্ধারিত এলাকা থেকে প্রায় ${Math.round(distance)} মিটার দূরে আছেন। অ্যাপ ব্যবহার করার জন্য আপনাকে অবশ্যই ${radius} মিটার সীমানার ভেতরে থাকতে হবে।`);
                    setStatus('denied');
                }
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        setErrorMessage('আপনি লোকেশন অ্যাক্সেসের অনুমতি দেননি। অ্যাপটি ব্যবহার করার জন্য অনুমতি প্রয়োজন।');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setErrorMessage('আপনার বর্তমান অবস্থান খুঁজে পাওয়া যাচ্ছে না।');
                        break;
                    case error.TIMEOUT:
                        setErrorMessage('অবস্থান যাচাই করতে সময় বেশি লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
                        break;
                    default:
                        setErrorMessage('অবস্থান যাচাই করার সময় একটি অজানা ত্রুটি ঘটেছে।');
                        break;
                }
                setStatus('error');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

    }, [user.id, user.role, settings]);

    if (status === 'granted') {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-background flex flex-col justify-center items-center p-4 text-center">
            <MapPinIcon className="h-16 w-16 text-primary mb-6" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">অবস্থান যাচাইকরণ</h2>
            
            {status === 'checking' && (
                <>
                    <p className="text-text-secondary">অ্যাপ ব্যবহারের জন্য আপনার অবস্থান যাচাই করা হচ্ছে...</p>
                    <div className="mt-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </>
            )}

            {(status === 'denied' || status === 'error') && (
                 <>
                    <p className="text-red-600 bg-red-100 p-4 rounded-lg max-w-md">{errorMessage}</p>
                    <button onClick={onLogout} className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary">লগআউট</button>
                </>
            )}
        </div>
    );
};


type CollectionListenerConfig = {
    name: string;
    setter: (data: any) => void;
};


const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('ড্যাশবোর্ড');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For mobile overlay
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop collapse
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [studentForInfo, setStudentForInfo] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGlobalLoading, setGlobalLoading] = useState(true);
  const authListeners = useRef<(() => void)[]>([]);


  // --- Local States - Data will be fetched from Firebase ---
  const [madrasahName, setMadrasahName] = useState('আমার মাদ্রাসা');
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
  const [results, setResults] = useState<Result[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [librarySections, setLibrarySections] = useState<LibrarySection[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({ fees: true, exams: true, notices: true });
  const [adminUser, setAdminUser] = useState({ id: 'admin_user', name: 'অ্যাডমিন', email: 'rsmithon88@gmail.com' });
  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
    mode: 'local',
    gatewayUrl: 'http://10.169.160.232:8080/send',
    deviceId: '',
    apiKey: '50d58688-aeef-462d-a8a8-89c0c2615eea',
    enabled: true
  });
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings | null>(null);
  const [receiptBookSettings, setReceiptBookSettings] = useState<ReceiptBookSettings>({});
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings>({});
  const [receiptData, setReceiptData] = useState<{ fee: Fee; student: Student } | null>(null);
  
  const classOptions = useMemo(() => courses.map(c => c.name).sort((a, b) => a.localeCompare(b, 'bn-BD')), [courses]);

  const addActivityLog = useCallback(async (action: string, user: LoggedInUser | null) => {
      if (!user?.name) return;
      try {
          await addDoc(collection(db, 'activityLog'), {
              timestamp: new Date().toISOString(),
              user: user.name,
              action: action
          });
      } catch (error) {
          console.error("Error adding activity log:", error);
      }
  }, []);

  const updateUserActivity = useCallback(async () => {
    if (currentUser) {
        try {
            const sessionRef = doc(db, "activeSessions", currentUser.id);
            await setDoc(sessionRef, { lastActive: new Date().toISOString() }, { merge: true });
        } catch (error) {
            console.warn("Could not update activity timestamp.", error);
        }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        updateUserActivity();
    }
  }, [activePage, currentUser, updateUserActivity]);


  // --- Centralized Data Listener ---
  useEffect(() => {
    // --- Public Listeners (Always On) ---
    const settingsDocRef = doc(db, 'settings', 'config');
    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.madrasahName) setMadrasahName(data.madrasahName);
            if (data.madrasahAddress) setMadrasahAddress(data.madrasahAddress);
            if (data.notificationPreferences) setNotificationPreferences(data.notificationPreferences);
            const adminConfig = data.isAdmin || {};
            setAdminUser({ id: 'admin_user', name: adminConfig.adminName || 'অ্যাডমিন', email: adminConfig.adminUser || 'rsmithon88@gmail.com' });
        }
    }, (error) => console.warn("Public settings listener error:", error.message));

    const smsConfigRef = doc(db, 'settings', 'smsConfig');
    const unsubSms = onSnapshot(smsConfigRef, docSnap => {
        if (docSnap.exists()) {
            setSmsSettings(prev => ({...prev, ...docSnap.data()}));
        }
    }, (error) => console.warn("SMS config listener error:", error.message));
    
    const geofenceConfigRef = doc(db, 'settings', 'geofenceConfig');
    const unsubGeofence = onSnapshot(geofenceConfigRef, docSnap => {
        const defaults = { enabled: false, latitude: '', longitude: '', radius: 100, restrictedTeachers: [] };
        if (docSnap.exists()) {
            setGeofenceSettings({ ...defaults, ...docSnap.data() });
        } else {
            setGeofenceSettings(defaults);
        }
    }, (error) => console.warn("Geofence config listener error:", error.message));

    const receiptBookConfigRef = doc(db, 'settings', 'receiptBookConfig');
    const unsubReceipts = onSnapshot(receiptBookConfigRef, docSnap => {
        if (docSnap.exists()) {
            setReceiptBookSettings(docSnap.data() as ReceiptBookSettings);
        }
    }, (error) => console.warn("Receipt book config listener error:", error.message));

    const signatureConfigRef = doc(db, 'settings', 'signatureConfig');
    const unsubSignatures = onSnapshot(signatureConfigRef, (docSnap) => {
        if (docSnap.exists()) {
            setSignatureSettings(docSnap.data() as SignatureSettings);
        }
    }, (error) => console.warn("Signature config listener error:", error.message));


    // --- Auth State Change and Authenticated Listeners ---
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Unsubscribe all authenticated listeners first to clean up previous session
      authListeners.current.forEach(unsub => unsub());
      authListeners.current = [];

      if (user) {
          setGlobalLoading(true);
          try {
              let loggedInUser: LoggedInUser | null = null;
              
              // Fetch latest admin config directly to avoid race condition
              const configDoc = await getDoc(doc(db, 'settings', 'config'));
              const adminConfig = configDoc.data()?.isAdmin || {};
              const adminEmail = adminConfig.adminUser || 'rsmithon88@gmail.com';

              if (user.email === adminEmail) {
                  loggedInUser = {
                      id: user.uid,
                      name: adminConfig.adminName || 'অ্যাডমিন', // Use fetched name
                      email: user.email,
                      role: 'admin',
                      photoURL: adminConfig.photoURL,
                  };
                  console.log("Admin user identified:", loggedInUser.name);
              } else {
                  console.log("User is not admin, checking for teacher profile...");
                  let teacherData: Teacher | null = null;
                  
                  // Try by UID first
                  const teacherDocRef = doc(db, 'teachers', user.uid);
                  let teacherSnap = await getDoc(teacherDocRef);
                  
                  if (teacherSnap.exists()) {
                      teacherData = { id: teacherSnap.id, ...teacherSnap.data() } as Teacher;
                  } else {
                      // Fallback: query by email
                      console.warn(`Teacher not found by UID ${user.uid}, trying fallback query by email.`);
                      const teacherQuery = query(collection(db, 'teachers'), where('email', '==', user.email), limit(1));
                      const querySnapshot = await getDocs(teacherQuery);
                      if (!querySnapshot.empty) {
                          const docSnap = querySnapshot.docs[0];
                          teacherData = { id: docSnap.id, ...docSnap.data() } as Teacher;
                          console.log(`Teacher found by email with mismatched ID: ${docSnap.id}. Self-correcting...`);
                          await updateDoc(docSnap.ref, { uid: user.uid });
                      }
                  }

                  if (teacherData) {
                      loggedInUser = {
                          id: teacherData.id,
                          name: teacherData.name,
                          email: teacherData.email,
                          role: teacherData.isSuperAdmin ? 'super_admin' : 'teacher',
                          photoURL: teacherData.photoURL,
                      };
                  }
              }

              if (loggedInUser) {
                  setCurrentUser(loggedInUser);
                  setToast({ message: `স্বাগতম, ${loggedInUser.name}!`, type: 'success' });
                  
                  const sessionData = {
                      userId: loggedInUser.id,
                      userName: loggedInUser.name,
                      userRole: loggedInUser.role,
                      loginTime: new Date().toISOString(),
                      lastActive: new Date().toISOString(),
                  };
                  await setDoc(doc(db, "activeSessions", user.uid), sessionData);


                  // Setup authenticated listeners
                  const collectionsToFetch: CollectionListenerConfig[] = [
                      { name: 'students', setter: setStudents }, { name: 'teachers', setter: setTeachers },
                      { name: 'courses', setter: setCourses }, { name: 'attendance', setter: setAttendance }, { name: 'teacherAttendance', setter: setTeacherAttendance },
                      { name: 'fees', setter: setFees }, { name: 'expenses', setter: setExpenses },
                      { name: 'teacherSalaries', setter: setTeacherSalaries }, { name: 'exams', setter: setExams },
                      { name: 'results', setter: setResults }, { name: 'timetable', setter: setTimetable },
                      { name: 'books', setter: setBooks }, { name: 'librarySections', setter: setLibrarySections }, { name: 'notices', setter: setNotices },
                      { name: 'events', setter: setEvents }, { name: 'notifications', setter: setNotifications },
                      { name: 'admitCards', setter: setAdmitCards }, { name: 'leaves', setter: setLeaves }
                  ];

                  if (loggedInUser.role === 'admin' || loggedInUser.role === 'super_admin') {
                      collectionsToFetch.push(
                          { name: 'activityLog', setter: setActivityLog },
                          { name: 'activeSessions', setter: setActiveSessions }
                      );
                  }
                  
                  const unsubscribers = collectionsToFetch.map(config => {
                      let q = query(collection(db, config.name));
                      if (config.name === 'activityLog') {
                          q = query(collection(db, config.name), orderBy('timestamp', 'desc'), limit(100));
                      }
                      return onSnapshot(q, snapshot => {
                          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                          config.setter(data);
                      }, error => console.error(`Error fetching collection ${config.name}:`, error.message));
                  });
                  authListeners.current = unsubscribers;

              } else {
                  // User authenticated but has no role in the system
                  throw new Error("শিক্ষক প্রোফাইল খুঁজে পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।");
              }
          } catch (error: any) {
              console.error("Error during auth state change processing:", error);
              setToast({ message: `লগইন প্রক্রিয়াকরণে ত্রুটি: ${error.message}`, type: 'error' });
              signOut(auth); // Force sign out on error
          } finally {
              setGlobalLoading(false);
          }
      } else {
          // User is signed out
          if (currentUser) {
              addActivityLog(`ব্যবহারকারী "${currentUser.name}" লগআউট করেছেন।`, currentUser);
          }
          setCurrentUser(null);
          setActivePage('ড্যাশবোর্ড');
          setGlobalLoading(false);
      }
    });

    return () => {
      unsubSettings();
      unsubSms();
      unsubGeofence();
      unsubReceipts();
      unsubSignatures();
      unsubscribeAuth();
      authListeners.current.forEach(unsub => unsub());
    };
  }, []); // Run this effect only once on component mount

  const handleLogin = useCallback(async (email: string, password: string) => {
    setGlobalLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        setGlobalLoading(false);
        console.error("Login failed:", error);
        let message = 'লগইন ব্যর্থ হয়েছে।';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = 'ভুল ইমেইল অথবা পাসওয়ার্ড।';
        }
        throw new Error(message);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setGlobalLoading(true);
    try {
        if (currentUser) {
            await deleteDoc(doc(db, "activeSessions", currentUser.id));
        }
        await signOut(auth);
        setToast({ message: 'সফলভাবে লগআউট হয়েছে।', type: 'info' });
    } catch (error) {
        console.error("Logout failed:", error);
        setToast({ message: 'লগআউট ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
        setGlobalLoading(false);
    }
  }, [currentUser]);

  const handleUpdateProfilePicture = async (file: File) => {
    if (!currentUser || !file) return;
    setGlobalLoading(true);
    try {
        const filePath = `profile_pictures/${currentUser.id}/${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);

        if (currentUser.role === 'admin') {
            const settingsRef = doc(db, 'settings', 'config');
            const docSnap = await getDoc(settingsRef);
            const existingAdminData = docSnap.data()?.isAdmin || {};
            await setDoc(settingsRef, { 
                isAdmin: { ...existingAdminData, photoURL: downloadURL } 
            }, { merge: true });
        } else { // teacher or super_admin
            await updateDoc(doc(db, 'teachers', currentUser.id), {
                photoURL: downloadURL
            });
        }

        setCurrentUser(prev => prev ? { ...prev, photoURL: downloadURL } : null);
        setToast({ message: 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।', type: 'success' });

    } catch (error: any) {
        console.error("Error updating profile picture:", error);
        let message = 'ছবি আপডেট করতে ব্যর্থ হয়েছে।';
        if (error.code === 'storage/retry-limit-exceeded') {
          message = 'নেটওয়ার্ক সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
        setToast({ message, type: 'error' });
    } finally {
      setGlobalLoading(false);
    }
  };


  // --- CRUD Operations Handlers ---
  const addDataItem = useCallback(async (collectionName: string, data: any) => {
    setGlobalLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      addActivityLog(`${collectionName} collection-এ নতুন আইটেম যোগ করা হয়েছে।`, currentUser);
      await updateUserActivity();
      setToast({ message: 'সফলভাবে যোগ করা হয়েছে।', type: 'success' });
      return docRef;
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      setToast({ message: 'যোগ করতে ব্যর্থ হয়েছে।', type: 'error' });
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  }, [currentUser, addActivityLog, updateUserActivity]);

  const updateDataItem = useCallback(async (collectionName: string, id: string, data: any) => {
    setGlobalLoading(true);
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
      addActivityLog(`${collectionName} collection-এ "${id}" আইডি আপডেট করা হয়েছে।`, currentUser);
      await updateUserActivity();
      setToast({ message: 'সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      setToast({ message: 'আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setGlobalLoading(false);
    }
  }, [currentUser, addActivityLog, updateUserActivity]);

  const deleteDataItem = useCallback(async (collectionName: string, id: string) => {
    setGlobalLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      addActivityLog(`${collectionName} collection-এ "${id}" আইডি মুছে ফেলা হয়েছে।`, currentUser);
      await updateUserActivity();
      setToast({ message: 'সফলভাবে মুছে ফেলা হয়েছে।', type: 'success' });
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      setToast({ message: 'মুছে ফেলতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setGlobalLoading(false);
    }
  }, [currentUser, addActivityLog, updateUserActivity]);

  const createNotification = useCallback(async (type: Notification['type'], message: string, linkTo: Page, sourceId: string) => {
      if (!notificationPreferences[type]) return;
      const newNotif = {
          type, message, linkTo, sourceId,
          date: new Date().toISOString(),
          isRead: false
      };
      // Note: No global loader for background notifications
      await addDoc(collection(db, 'notifications'), newNotif).catch(e => console.error("Failed to create notification", e));
  }, [notificationPreferences]);

  // Specific CRUD handlers
  const handleAddStudent = (student: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('students', { ...student, addedBy: currentUser?.name });
  const handleUpdateStudent = (student: Student) => updateDataItem('students', student.id, { ...student, lastModifiedBy: currentUser?.name });
  const handleDeleteStudent = (id: string) => deleteDataItem('students', id);
  
  const handleAddMultipleStudents = async (newStudents: Omit<Student, 'id' | 'addedBy' | 'lastModifiedBy'>[]) => {
      setGlobalLoading(true);
      try {
        const batch = writeBatch(db);
        newStudents.forEach(student => {
            const docRef = doc(collection(db, 'students'));
            batch.set(docRef, { ...student, addedBy: currentUser?.name });
        });
        await batch.commit();
        await updateUserActivity();
        setToast({ message: `${newStudents.length} জন শিক্ষার্থী সফলভাবে যোগ করা হয়েছে।`, type: 'success' });
      } catch (error) {
        console.error("Error adding multiple students:", error);
        setToast({ message: 'একাধিক শিক্ষার্থী যোগ করতে ব্যর্থ হয়েছে।', type: 'error' });
      } finally {
        setGlobalLoading(false);
      }
  };
  
  const handleAddTeacher = async (teacher: Omit<Teacher, 'id' | 'uid' | 'addedBy' | 'lastModifiedBy'> & { password: string }) => {
      setGlobalLoading(true);
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, teacher.email, teacher.password);
          const uid = userCredential.user?.uid;
          if (!uid) throw new Error("Authentication failed, no UID returned.");
          const docRef = doc(db, 'teachers', uid);
          await setDoc(docRef, {
              uid: uid,
              name: teacher.name,
              subject: teacher.subject,
              email: teacher.email,
              phone: teacher.phone,
              address: teacher.address,
              gender: teacher.gender,
              designation: teacher.designation,
              responsibilities: teacher.responsibilities,
              isSuperAdmin: teacher.isSuperAdmin || false,
              addedBy: currentUser?.name
          });
          await updateUserActivity();
          setToast({ message: 'শিক্ষক সফলভাবে যোগ এবং নিবন্ধিত হয়েছেন।', type: 'success' });
      } catch (error: any) {
          console.error("Error adding teacher:", error);
          let errorMessage = "শিক্ষক যোগ করতে ব্যর্থ।";
          if (error.code === 'auth/email-already-in-use') {
              errorMessage = "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।";
          }
          setToast({ message: errorMessage, type: 'error' });
      } finally {
        setGlobalLoading(false);
      }
  };
  const handleUpdateTeacher = (teacher: Teacher) => updateDataItem('teachers', teacher.id, { ...teacher, lastModifiedBy: currentUser?.name });
  const handleDeleteTeacher = (id: string) => deleteDataItem('teachers', id);

  const handleAddCourse = (course: Omit<Course, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('courses', { ...course, addedBy: currentUser?.name });
  const handleDeleteCourse = useCallback(async (id: string) => {
    deleteDataItem('courses', id);
}, [deleteDataItem]);

  const handleAddAttendance = (record: Omit<AttendanceType, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('attendance', { ...record, addedBy: currentUser?.name });
  const handleUpdateAttendance = (record: AttendanceType) => updateDataItem('attendance', record.id, { ...record, lastModifiedBy: currentUser?.name });
  const handleDeleteAttendance = (id: string) => deleteDataItem('attendance', id);

  const handleAddTeacherAttendance = (attendance: Omit<TeacherAttendance, 'id'>) => addDataItem('teacherAttendance', attendance);

  const sendFeeConfirmationSms = useCallback(async (fee: Fee, student: Student) => {
      if (!smsSettings.enabled || !student.parentContact) return;
      
      const childTerm = student.gender === 'female' ? 'মেয়ে' : (student.gender === 'male' ? 'ছেলে' : 'সন্তান');

      const message = `${madrasahName},\n\nআপনার ${childTerm} ${student.name} -এর \n${new Date(fee.dueDate).toLocaleString('bn-BD', { month: 'long' })} মাসের বেতন-বাবদ ৳${fee.amount} \nসফলভাবে গ্রহণ করা হয়েছে।\n\nসম্পাদক: ${currentUser?.name || 'অ্যাডমিন'}\nআল্লাহ আপনার ${childTerm}-কে দ্বীনের খাদেম হিসাবে কবুল করুন।\nআমিন`;
      
      let to = student.parentContact;
      if (!to.startsWith('+88')) {
          to = to.length === 11 && to.startsWith('0') ? `+88${to}` : `+880${to.slice(-10)}`;
      }

      try {
          let response;
          if (smsSettings.mode === 'cloud') {
              const url = `https://api.textbee.dev/api/v1/gateway/devices/${smsSettings.deviceId}/sendSMS`;
              response = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-api-key": smsSettings.apiKey },
                  body: JSON.stringify({ "recipients": [to], "message": message })
              });
          } else { // local mode
              response = await fetch(smsSettings.gatewayUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ "api-key": smsSettings.apiKey, "to": to, "message": message })
              });
          }
          if (response.ok) {
              setToast({ message: `অভিভাবকের নম্বরে (${to}) মেসেজ পাঠানো হয়েছে।`, type: 'success' });
          } else {
              const errorText = await response.text();
              throw new Error(`SMS সার্ভার থেকে ত্রুটি: ${errorText}`);
          }
      } catch (error: any) {
          console.error("SMS Send Error:", error);
          setToast({ message: `SMS পাঠাতে ব্যর্থ: ${error.message.includes('fetch') ? 'নেটওয়ার্ক ত্রুটি।' : error.message}`, type: 'error' });
      }
  }, [smsSettings, madrasahName, currentUser?.name]);

  const sendSalaryConfirmationSms = useCallback(async (salary: TeacherSalaryType, teacher: Teacher) => {
    if (!smsSettings.enabled || !teacher.phone) return;

    const message = `প্রিয় ${teacher.name},\n\nআপনার ${salary.month}, ${salary.year} মাসের বেতন ৳${salary.amount} সফলভাবে প্রদান করা হয়েছে।\n\n- ${madrasahName}`;

    let to = teacher.phone;
    if (!to.startsWith('+88')) {
        to = to.length === 11 && to.startsWith('0') ? `+88${to}` : `+880${to.slice(-10)}`;
    }

    try {
        let response;
        if (smsSettings.mode === 'cloud') {
            const url = `https://api.textbee.dev/api/v1/gateway/devices/${smsSettings.deviceId}/sendSMS`;
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": smsSettings.apiKey },
                body: JSON.stringify({ "recipients": [to], "message": message })
            });
        } else { // local mode
            response = await fetch(smsSettings.gatewayUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "api-key": smsSettings.apiKey, "to": to, "message": message })
            });
        }
        if (response.ok) {
            setToast({ message: `শিক্ষক ${teacher.name}-কে মেসেজ পাঠানো হয়েছে।`, type: 'success' });
        } else {
            const errorText = await response.text();
            throw new Error(`SMS সার্ভার থেকে ত্রুটি: ${errorText}`);
        }
    } catch (error: any) {
        console.error("Salary SMS Send Error:", error);
        setToast({ message: `বেতনের SMS পাঠাতে ব্যর্থ: ${error.message.includes('fetch') ? 'নেটওয়ার্ক ত্রুটি।' : error.message}`, type: 'error' });
    }
  }, [smsSettings, madrasahName]);
  
  const handleAddFee = async (fee: Omit<Fee, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
      const student = students.find(s => s.id === fee.studentId);
      if (fee.status === 'পরিশোধিত' && student) {
          sendFeeConfirmationSms(fee as Fee, student); // A bit of a type assertion here
      }
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
              const counterRef = doc(db, 'counters', 'receiptCounter');
              const bookNumber = receiptBookSettings[student.class] || 0;
              try {
                  const newReceiptNumber = await runTransaction(db, async (transaction) => {
                      const counterDoc = await transaction.get(counterRef);
                      const currentNumber = counterDoc.exists() ? counterDoc.data()?.current || 0 : 0;
                      const nextNumber = currentNumber + 1;
                      transaction.set(counterRef, { current: nextNumber }, { merge: true });
                      return nextNumber;
                  });

                  feeToUpdate = {
                      ...feeToUpdate,
                      receiptNumber: newReceiptNumber,
                      bookNumber: bookNumber,
                      paymentDate: new Date().toISOString().split('T')[0]
                  };
                  setReceiptData({ fee: feeToUpdate, student: student });
                  sendFeeConfirmationSms(feeToUpdate, student);
              } catch (transactionError) {
                  console.error("Receipt number transaction failed:", transactionError);
                  setToast({ message: 'রশিদ নম্বর তৈরি করতে ব্যর্থ হয়েছে।', type: 'error' });
                  setGlobalLoading(false);
                  return;
              }
          }
      }
      
      feeToUpdate.lastModifiedBy = currentUser?.name;
      await updateDoc(doc(db, 'fees', fee.id), feeToUpdate);
      addActivityLog(`ফি "${fee.id}" আপডেট করা হয়েছে।`, currentUser);
      await updateUserActivity();
      setToast({ message: 'ফি সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
    } catch (error) {
        console.error("Error updating fee:", error);
        setToast({ message: 'ফি আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
        setGlobalLoading(false);
    }
  };

  const handleDeleteFee = (id: string) => deleteDataItem('fees', id);
  const handleAddMultipleFees = async (newFees: Omit<Fee, 'id'>[]) => {
      setGlobalLoading(true);
      try {
          const batch = writeBatch(db);
          newFees.forEach(fee => {
              const docRef = doc(collection(db, 'fees'));
              batch.set(docRef, fee);
          });
          await batch.commit();
          addActivityLog(`${newFees.length}টি নতুন ফি যোগ করা হয়েছে।`, currentUser);
          await updateUserActivity();
          setToast({ message: `${newFees.length}টি ফি সফলভাবে যোগ করা হয়েছে।`, type: 'success' });
      } catch (error) {
          console.error("Error adding multiple fees:", error);
          setToast({ message: 'একাধিক ফি যোগ করতে ব্যর্থ হয়েছে।', type: 'error' });
      } finally {
          setGlobalLoading(false);
      }
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('expenses', { ...expense, addedBy: currentUser?.name });
  const handleUpdateExpense = (expense: Expense) => updateDataItem('expenses', expense.id, { ...expense, lastModifiedBy: currentUser?.name });
  const handleDeleteExpense = (id: string) => deleteDataItem('expenses', id);

  const handleAddSalary = (salary: Omit<TeacherSalaryType, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
    if (salary.status === 'পরিশোধিত') {
        const teacher = teachers.find(t => t.id === salary.teacherId);
        if (teacher) {
            sendSalaryConfirmationSms(salary as TeacherSalaryType, teacher);
        }
    }
    addDataItem('teacherSalaries', { ...salary, addedBy: currentUser?.name });
  };
  const handleUpdateSalary = (salary: TeacherSalaryType) => {
      const originalSalary = teacherSalaries.find(s => s.id === salary.id);
      if (salary.status === 'পরিশোধিত' && originalSalary?.status !== 'পরিশোধিত') {
          const teacher = teachers.find(t => t.id === salary.teacherId);
          if (teacher) {
              sendSalaryConfirmationSms(salary, teacher);
          }
      }
      updateDataItem('teacherSalaries', salary.id, { ...salary, lastModifiedBy: currentUser?.name });
  };
  const handleDeleteSalary = (id: string) => deleteDataItem('teacherSalaries', id);

  const handleAddExam = (exam: Omit<Exam, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('exams', { ...exam, addedBy: currentUser?.name });
  const handleUpdateExam = (exam: Exam) => updateDataItem('exams', exam.id, { ...exam, lastModifiedBy: currentUser?.name });
  const handleDeleteExam = (id: string) => deleteDataItem('exams', id);

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

  const handleAddResult = async (result: Omit<Result, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
      const docRef = await addDataItem('results', { ...result, addedBy: currentUser?.name });
      if (docRef) {
          const studentName = studentMap.get(result.studentId)?.name || "Unknown Student";
          createNotification('exam', `"${studentName}"-এর পরীক্ষার ফলাফল প্রকাশিত হয়েছে।`, 'রেজাল্ট', docRef.id);
      }
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
      const book = books.find(b => b.id === bookId);
      if (book) {
          updateDataItem('books', book.id, { isAvailable: !book.isAvailable });
      }
  };
  const handleAddSection = (section: Omit<LibrarySection, 'id'>) => addDataItem('librarySections', section);
  const handleUpdateSection = (section: LibrarySection) => updateDataItem('librarySections', section.id, section);
  const handleDeleteSection = (id: string) => deleteDataItem('librarySections', id);

  const handleAddNotice = async (notice: Omit<Notice, 'id' | 'addedBy' | 'lastModifiedBy'>) => {
      const docRef = await addDataItem('notices', { ...notice, addedBy: currentUser?.name });
      if (docRef) {
          createNotification('notice', `নতুন নোটিশ: ${notice.title}`, 'নোটিশ বোর্ড', docRef.id);
      }
  };
  const handleUpdateNotice = (notice: Notice) => updateDataItem('notices', notice.id, { ...notice, lastModifiedBy: currentUser?.name });
  const handleDeleteNotice = (id: string) => deleteDataItem('notices', id);
  
  const handleAddEvent = (event: Omit<Event, 'id' | 'addedBy' | 'lastModifiedBy'>) => addDataItem('events', { ...event, addedBy: currentUser?.name });
  const handleUpdateEvent = (event: Event) => updateDataItem('events', event.id, { ...event, lastModifiedBy: currentUser?.name });
  const handleDeleteEvent = (id: string) => deleteDataItem('events', id);

  const handleAddAdmitCard = (card: Omit<AdmitCard, 'id' | 'addedBy' | 'studentPhotoUrl'>) => addDataItem('admitCards', { ...card, addedBy: currentUser?.name });
  const handleUpdateAdmitCard = (card: AdmitCard) => updateDataItem('admitCards', card.id, card);
  const handleDeleteAdmitCard = (id: string) => deleteDataItem('admitCards', id);
  
  const handleAddLeave = (leave: Omit<LeaveRequest, 'id' | 'reviewedBy' | 'reviewDate'>) => addDataItem('leaves', leave).then(() => {});
  const handleUpdateLeave = (leave: LeaveRequest) => updateDataItem('leaves', leave.id, leave).then(() => {});
  const handleDeleteLeave = (id: string) => deleteDataItem('leaves', id).then(() => {});
  
  // --- Settings Handlers ---
  const handleUpdateGeneralSettings = (name: string, address: string) => {
    updateDataItem('settings', 'config', { madrasahName: name, madrasahAddress: address });
  };
  const handleUpdateNotificationPrefs = (prefs: NotificationPreferences) => {
    updateDataItem('settings', 'config', { notificationPreferences: prefs });
  };

  const handleUpdateSmsSettings = (settings: SmsSettings) => {
    updateDataItem('settings', 'smsConfig', settings);
  }
  const handleUpdateGeofenceSettings = (settings: GeofenceSettings) => {
    updateDataItem('settings', 'geofenceConfig', settings);
  }
  const handleUpdateReceiptBookSettings = (settings: ReceiptBookSettings) => {
      updateDataItem('settings', 'receiptBookConfig', settings);
  };
  const handleUpdateSignatures = async (file: File, type: 'classTeacher' | 'headmaster') => {
      setGlobalLoading(true);
      try {
          const filePath = `signatures/${type}_signature.png`;
          const storageRef = ref(storage, filePath);
          const uploadResult = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(uploadResult.ref);
          
          const fieldToUpdate = type === 'classTeacher' ? 'classTeacherSignatureUrl' : 'headmasterSignatureUrl';
          
          await updateDataItem('settings', 'signatureConfig', { [fieldToUpdate]: downloadURL });
          setToast({ message: 'স্বাক্ষর সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
      } catch (error) {
          console.error('Error updating signature:', error);
          setToast({ message: 'স্বাক্ষর আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
      } finally {
          setGlobalLoading(false);
      }
  };

  const handleUpdateAdmin = async (name: string, email: string, password?: string) => {
    setGlobalLoading(true);
    try {
        const settingsRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(settingsRef);
        const existingAdminData = docSnap.data()?.isAdmin || {};
        await setDoc(settingsRef, { 
            isAdmin: { ...existingAdminData, adminName: name, adminUser: email } 
        }, { merge: true });
        
        setAdminUser({ id: adminUser.id, name, email });
        
        addActivityLog(`অ্যাডমিন তথ্য আপডেট করা হয়েছে।`, currentUser);
        setToast({ message: 'অ্যাডমিন তথ্য সফলভাবে আপডেট করা হয়েছে।', type: 'success' });
        if (password) {
          setToast({ message: 'পাসওয়ার্ড পরিবর্তনের জন্য Firebase Console ব্যবহার করুন।', type: 'info' });
        }
    } catch (error) {
        console.error("Error updating admin user:", error);
        setToast({ message: 'অ্যাডমিন তথ্য আপডেট করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
        setGlobalLoading(false);
    }
  };
  
  const handleMarkNotificationAsRead = (id: string) => {
      updateDataItem('notifications', id, { isRead: true });
  };
  const handleMarkAllNotificationsAsRead = () => {
      const batch = writeBatch(db);
      notifications.forEach(n => {
          if (!n.isRead) {
              const docRef = doc(db, 'notifications', n.id);
              batch.update(docRef, { isRead: true });
          }
      });
      batch.commit().catch(e => console.error("Failed to mark all as read", e));
  };
  
  // --- UI Rendering ---
  const handleViewStudentInfo = (student: Student) => {
    setStudentForInfo(student);
    setActivePage('শিক্ষার্থী তথ্য');
  };
  
  const hasPermission = useCallback((page: Page): boolean => {
    if (!currentUser) return false;

    if (page === 'অ্যাডমিন রোল' || page === 'সেটিংস') {
        return currentUser.role === 'admin';
    }
    
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
    { name: 'ব্যয় ব্যবস্থাপনা' as Page, icon: ReceiptRefundIcon },
    { name: 'শিক্ষকদের বেতন' as Page, icon: CreditCardIcon },
    { name: 'পরীক্ষা' as Page, icon: PencilAltIcon },
    { name: 'রেজাল্ট' as Page, icon: DocumentTextIcon },
    { name: 'প্রবেশপত্র' as Page, icon: TicketIcon },
    { name: 'ছুটির আবেদন' as Page, icon: LeaveIcon },
    { name: 'সময়সূচী' as Page, icon: ClockIcon },
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
        ? <TeacherDashboard user={currentUser} contextData={{ courses, timetable, teachers, leaves }} teacherAttendance={teacherAttendance} onAddAttendance={handleAddTeacherAttendance} onAddLeave={handleAddLeave} /> 
        : <Dashboard students={students} teachers={teachers} fees={fees} expenses={expenses} teacherSalaries={teacherSalaries} />;
      case 'শিক্ষার্থীরা': return <Students students={students} exams={exams} courses={courses} addStudent={handleAddStudent} addMultipleStudents={handleAddMultipleStudents} updateStudent={handleUpdateStudent} deleteStudent={handleDeleteStudent} hasPermission={hasPermission} onViewInfo={handleViewStudentInfo} classOptions={classOptions} addCourse={handleAddCourse} deleteCourse={handleDeleteCourse} />;
      case 'শিক্ষকগণ': return <Teachers teachers={teachers} addTeacher={handleAddTeacher} updateTeacher={handleUpdateTeacher} deleteTeacher={handleDeleteTeacher} hasPermission={hasPermission} currentUser={currentUser} />;
      case 'হাজিরা': return <Attendance attendance={attendance} students={students} addAttendance={handleAddAttendance} updateAttendance={handleUpdateAttendance} deleteAttendance={handleDeleteAttendance} hasPermission={hasPermission} />;
      case 'শিক্ষক হাজিরা': return <TeacherAttendanceComponent currentUser={currentUser} teacherAttendance={teacherAttendance} teachers={teachers} />;
      case 'ফি ব্যবস্থাপনা': return <Fees fees={fees} students={students} addFee={handleAddFee} updateFee={handleUpdateFee} deleteFee={handleDeleteFee} addMultipleFees={handleAddMultipleFees} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'ব্যয় ব্যবস্থাপনা': return <Vouchers expenses={expenses} addExpense={handleAddExpense} updateExpense={handleUpdateExpense} deleteExpense={handleDeleteExpense} hasPermission={hasPermission} madrasahName={madrasahName} madrasahAddress={madrasahAddress} currentUser={currentUser}/>;
      case 'শিক্ষকদের বেতন': return <TeacherSalary salaries={teacherSalaries} teachers={teachers} addSalary={handleAddSalary} updateSalary={handleUpdateSalary} deleteSalary={handleDeleteSalary} hasPermission={hasPermission} />;
      case 'পরীক্ষা': return <Exams exams={exams} courses={courses} addExam={handleAddExam} updateExam={handleUpdateExam} deleteExam={handleDeleteExam} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'রেজাল্ট': return <Results results={results} students={students} exams={exams} courses={courses} addResult={handleAddResult} updateResult={handleUpdateResult} deleteResult={handleDeleteResult} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'প্রবেশপত্র': return <AdmitCards students={students} exams={exams} admitCards={admitCards} courses={courses} addAdmitCard={handleAddAdmitCard} updateAdmitCard={handleUpdateAdmitCard} deleteAdmitCard={handleDeleteAdmitCard} madrasahName={madrasahName} madrasahAddress={madrasahAddress} hasPermission={hasPermission} classOptions={classOptions} signatureSettings={signatureSettings} />;
      case 'ছুটির আবেদন': return <LeaveManagement currentUser={currentUser} teachers={teachers} leaves={leaves} addLeave={handleAddLeave} updateLeave={handleUpdateLeave} deleteLeave={handleDeleteLeave} />;
      case 'সময়সূচী': return <Timetable timetable={timetable} teachers={teachers} addTimetableEntry={handleAddTimetableEntry} updateTimetableEntry={handleUpdateTimetableEntry} deleteTimetableEntry={handleDeleteTimetableEntry} hasPermission={hasPermission} classOptions={classOptions} />;
      case 'লাইব্রেরি': return <Library books={books} sections={librarySections} addBook={handleAddBook} updateBook={handleUpdateBook} deleteBook={handleDeleteBook} toggleBookAvailability={handleToggleBookAvailability} addSection={handleAddSection} updateSection={handleUpdateSection} deleteSection={handleDeleteSection} hasPermission={hasPermission} />;
      case 'নোটিশ বোর্ড': return <NoticeBoard notices={notices} addNotice={handleAddNotice} updateNotice={handleUpdateNotice} deleteNotice={handleDeleteNotice} hasPermission={hasPermission} />;
      case 'ইভেন্ট ক্যালেন্ডার': return <EventsCalendar events={events} addEvent={handleAddEvent} updateEvent={handleUpdateEvent} deleteEvent={handleDeleteEvent} hasPermission={hasPermission} />;
      case 'রিপোর্ট': return <Reports data={{ students, teachers, attendance, fees, expenses, teacherSalaries }} classOptions={classOptions} />;
      case 'সেটিংস': return <Settings madrasahName={madrasahName} madrasahAddress={madrasahAddress} onUpdateSettings={handleUpdateGeneralSettings} preferences={notificationPreferences} onUpdatePreferences={handleUpdateNotificationPrefs} currentUser={currentUser} adminUser={adminUser} onUpdateAdmin={handleUpdateAdmin} smsSettings={smsSettings} onUpdateSmsSettings={handleUpdateSmsSettings} geofenceSettings={geofenceSettings!} onUpdateGeofenceSettings={handleUpdateGeofenceSettings} teachers={teachers} classOptions={classOptions} receiptBookSettings={receiptBookSettings} onUpdateReceiptBookSettings={handleUpdateReceiptBookSettings} signatureSettings={signatureSettings} onUpdateSignatures={handleUpdateSignatures} />;
      case 'শিক্ষার্থী তথ্য': return <StudentInfo students={students} fees={fees} attendance={attendance} results={results} exams={exams} madrasahName={madrasahName} madrasahAddress={madrasahAddress} initialStudent={studentForInfo} classOptions={classOptions} />;
      case 'কার্যকলাপ লগ': return <ActivityLog logs={activityLog} activeSessions={activeSessions} />;
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
  
  if (isGlobalLoading || !geofenceSettings) {
    return <GlobalLoader />;
  }

  return (
    <>
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