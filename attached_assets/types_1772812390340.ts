

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: 'উপস্থিত';
}

export interface LibrarySection {
  id: string;
  name: string;
}

export interface SignatureSettings {
  classTeacherSignatureUrl?: string;
  headmasterSignatureUrl?: string;
}

export interface GeofenceSettings {
  enabled: boolean;
  latitude: number | string;
  longitude: number | string;
  radius: number | string;
  restrictedTeachers: string[]; // array of teacher IDs
}

export interface Student {
  id: string;
  rollNumber: number;
  name: string;
  fatherName: string;
  motherName: string;
  class: string;
  age: number;
  parentContact: string;
  address?: string; // New field for student address
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
  addedBy: string;
  lastModifiedBy?: string;
}

export type Designation = 'প্রধান শিক্ষক' | 'নূরানী বিভাগের প্রধান' | 'হিফজ বিভাগের প্রধান' | 'বালিকা শাখার প্রধান' | 'সাধারণ শিক্ষক';

export interface Teacher {
  id: string;
  uid?: string; // Firebase Auth User ID
  name: string;
  subject: string;
  email: string;
  phone?: string;
  address?: string;
  designation: Designation;
  responsibilities: Page[];
  gender: 'male' | 'female';
  isSuperAdmin?: boolean; // New field for Super Admin role
  photoURL?: string;
  addedBy: string;
  lastModifiedBy?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  duration: string;
  addedBy: string;
  lastModifiedBy?: string;
}

export interface Attendance {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    status: 'উপস্থিত' | 'অনুপস্থিত' | 'বিলম্ব';
    addedBy: string;
    lastModifiedBy?: string;
}

export interface Fee {
    id: string;
    studentId: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
    status: 'পরিশোধিত' | 'অপরিশোধিত' | 'বকেয়া';
    category: string;
    addedBy: string;
    lastModifiedBy?: string;
    receiptNumber?: number;
    bookNumber?: number;
    paymentDate?: string; // YYYY-MM-DD
    generatedBy?: 'auto' | 'manual';
}

export interface Expense {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string; // YYYY-MM-DD
    addedBy?: string;
    lastModifiedBy?: string;
}

export interface TeacherSalary {
  id: string;
  teacherId: string;
  amount: number;
  month: string;
  year: number;
  status: 'পরিশোধিত' | 'অপরিশোধিত';
  paymentDate?: string; // YYYY-MM-DD
  addedBy: string;
  lastModifiedBy?: string;
}

export interface Exam {
    id: string;
    name: string;
    courseId: string;
    date: string; // YYYY-MM-DD
    addedBy: string;
    lastModifiedBy?: string;
}

export interface TimetableEntry {
    id: string;
    day: 'সোমবার' | 'মঙ্গলবার' | 'বুধবার' | 'বৃহস্পতিবার' | 'শুক্রবার';
    time: string; // HH:MM AM/PM
    subject: string;
    teacherId: string;
    class: string;
    addedBy: string;
    lastModifiedBy?: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isAvailable: boolean;
    sectionId: string;
    className: string;
    addedBy: string;
    lastModifiedBy?: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    date: string; // YYYY-MM-DD
    addedBy: string;
    lastModifiedBy?: string;
    target: 'all_teachers' | 'specific_teachers';
    teacherIds?: string[];
}

export interface Event {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    description: string;
    addedBy: string;
    lastModifiedBy?: string;
}

export interface SubjectResult {
  subject: string;
  marks: number;
  totalMarks: number;
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  results: SubjectResult[];
  totalMarks: number;
  grade: string;
  status: 'পাশ' | 'ফেল' | 'অপ্রযোজ্য';
  addedBy: string;
  lastModifiedBy?: string;
}

export interface AdmitCard {
  id: string;
  studentId: string;
  examId: string;
  issueDate: string; // YYYY-MM-DD
  addedBy: string;
  studentPhotoUrl?: string;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string; // denormalized for easier display
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  reason: string;
  status: 'বিচারাধীন' | 'অনুমোদিত' | 'প্রত্যাখ্যাত';
  appliedDate: string; // YYYY-MM-DD
  reviewedBy?: string;
  reviewDate?: string; // YYYY-MM-DD
}

export interface MessageLog {
  id: string;
  content: string;
  sentDate: string; // ISO String
  sentBy: string;
  target: 'all_students' | 'class' | 'specific_students';
  targetDetails: string[]; // e.g., ['Class One', 'Class Two'] or ['Student Name 1', 'Student Name 2']
  recipientCount: number;
  status: 'সম্পন্ন' | 'আংশিক সফল' | 'ব্যর্থ';
  successCount: number;
  failureCount: number;
}


export type Page = 
  | 'ড্যাশবোর্ড' 
  | 'শিক্ষার্থীরা' 
  | 'শিক্ষকগণ' 
  | 'শিক্ষক হাজিরা'
  | 'হাজিরা'
  | 'ফি ব্যবস্থাপনা'
  | 'ব্যয় ব্যবস্থাপনা'
  | 'শিক্ষকদের বেতন'
  | 'পরীক্ষা'
  | 'রেজাল্ট'
  | 'প্রবেশপত্র'
  | 'সময়সূচী'
  | 'লাইব্রেরি'
  | 'নোটিশ বোর্ড'
  | 'রিপোর্ট'
  | 'ইভেন্ট ক্যালেন্ডার'
  | 'শিক্ষার্থী তথ্য'
  | 'কার্যকলাপ লগ'
  | 'সেটিংস'
  | 'অ্যাডমিন রোল'
  | 'ছুটির আবেদন'
  | 'মেসেজ';

export type LoggedInUser = {
  id: string; // Can be Firebase UID or a document ID
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'teacher';
  photoURL?: string;
};

export interface Notification {
  id: string;
  sourceId: string; // e.g., 'fee-123'
  type: 'fee' | 'exam' | 'notice';
  message: string;
  date: string; // ISO string
  isRead: boolean;
  linkTo: Page;
}

export interface NotificationPreferences {
  fees: boolean;
  exams: boolean;
  notices: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO string
  user: string;
  action: string;
}

export interface ActiveSession {
  userId: string;
  userName: string;
  userRole: 'admin' | 'teacher';
  loginTime: string; // ISO string
  lastActive: string; // ISO string
}

export interface SmsSettings {
  mode: 'cloud' | 'local';
  gatewayUrl: string; // Used for 'local' mode
  deviceId: string;   // Used for 'cloud' mode
  apiKey: string;
  enabled: boolean;
}

export type ReceiptBookSettings = {
  [key: string]: number;
};
