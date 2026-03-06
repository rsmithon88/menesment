import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("অ্যাডমিন"),
  email: text("email"),
  role: text("role").notNull().default("admin"),
  photoURL: text("photo_url"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: integer("roll_number").notNull().default(0),
  name: text("name").notNull(),
  fatherName: text("father_name").notNull().default(""),
  motherName: text("mother_name").notNull().default(""),
  class: text("class").notNull().default(""),
  age: integer("age").notNull().default(0),
  parentContact: text("parent_contact").notNull().default(""),
  address: text("address"),
  gender: text("gender").notNull().default("male"),
  status: text("status").notNull().default("active"),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  uid: text("uid"),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  email: text("email").notNull().default(""),
  password: text("password"),
  phone: text("phone"),
  address: text("address"),
  designation: text("designation").notNull().default("সাধারণ শিক্ষক"),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  gender: text("gender").notNull().default("male"),
  isSuperAdmin: boolean("is_super_admin").default(false),
  photoURL: text("photo_url"),
  salary: integer("salary").default(0),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  instructor: text("instructor"),
  duration: text("duration"),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const studentAttendance = pgTable("student_attendance", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const teacherAttendance = pgTable("teacher_attendance", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull().default(""),
  status: text("status").notNull().default("উপস্থিত"),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("অপরিশোধিত"),
  category: text("category").notNull().default(""),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
  receiptNumber: integer("receipt_number"),
  bookNumber: integer("book_number"),
  paymentDate: text("payment_date"),
  generatedBy: text("generated_by"),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const teacherSalaries = pgTable("teacher_salaries", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  amount: integer("amount").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull().default("অপরিশোধিত"),
  paymentDate: text("payment_date"),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  courseId: text("course_id").notNull(),
  date: text("date").notNull(),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  examId: text("exam_id").notNull(),
  results: jsonb("results").$type<{ subject: string; marks: number; totalMarks: number }[]>().notNull().default([]),
  totalMarks: integer("total_marks").notNull().default(0),
  grade: text("grade").notNull().default(""),
  status: text("status").notNull().default("অপ্রযোজ্য"),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  time: text("time").notNull(),
  subject: text("subject").notNull(),
  teacherId: text("teacher_id").notNull(),
  class: text("class").notNull().default(""),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  isAvailable: boolean("is_available").notNull().default(true),
  sectionId: text("section_id").notNull().default(""),
  className: text("class_name").notNull().default(""),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const librarySections = pgTable("library_sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
  target: text("target").notNull().default("all_teachers"),
  teacherIds: jsonb("teacher_ids").$type<string[]>().default([]),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull().default(""),
  addedBy: text("added_by"),
  lastModifiedBy: text("last_modified_by"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull().default(""),
  type: text("type").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  linkTo: text("link_to").notNull().default("ড্যাশবোর্ড"),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  user: text("user").notNull(),
  action: text("action").notNull(),
});

export const admitCards = pgTable("admit_cards", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  examId: text("exam_id").notNull(),
  issueDate: text("issue_date").notNull(),
  addedBy: text("added_by"),
  studentPhotoUrl: text("student_photo_url"),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull().default(""),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("বিচারাধীন"),
  appliedDate: text("applied_date").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewDate: text("review_date"),
});

export const activeSessions = pgTable("active_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  loginTime: text("login_time").notNull(),
  lastActive: text("last_active").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertStudentAttendanceSchema = createInsertSchema(studentAttendance).omit({ id: true });
export const insertTeacherAttendanceSchema = createInsertSchema(teacherAttendance).omit({ id: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export const insertTeacherSalarySchema = createInsertSchema(teacherSalaries).omit({ id: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export const insertLibrarySectionSchema = createInsertSchema(librarySections).omit({ id: true });
export const insertNoticeSchema = createInsertSchema(notices).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true });
export const insertAdmitCardSchema = createInsertSchema(admitCards).omit({ id: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true });
export const insertActiveSessionSchema = createInsertSchema(activeSessions).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type InsertStudentAttendance = z.infer<typeof insertStudentAttendanceSchema>;
export type TeacherAttendanceRecord = typeof teacherAttendance.$inferSelect;
export type InsertTeacherAttendance = z.infer<typeof insertTeacherAttendanceSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type TeacherSalary = typeof teacherSalaries.$inferSelect;
export type InsertTeacherSalary = z.infer<typeof insertTeacherSalarySchema>;
export type ExamRecord = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type ResultRecord = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type TimetableEntry = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type LibrarySection = typeof librarySections.$inferSelect;
export type InsertLibrarySection = z.infer<typeof insertLibrarySectionSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type EventRecord = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type NotificationRecord = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type AdmitCard = typeof admitCards.$inferSelect;
export type InsertAdmitCard = z.infer<typeof insertAdmitCardSchema>;
export type LeaveRecord = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = z.infer<typeof insertActiveSessionSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
