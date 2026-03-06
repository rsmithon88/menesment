import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  nameBn: text("name_bn").notNull(),
  nameEn: text("name_en"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  dob: text("dob"),
  gender: text("gender"),
  department: text("department").notNull(),
  roll: text("roll"),
  session: text("session"),
  address: text("address"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  feeStatus: text("fee_status").notNull().default("due"),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  phone: text("phone"),
  email: text("email"),
  salary: integer("salary").default(0),
  status: text("status").notNull().default("active"),
});

export const teacherAttendance = pgTable("teacher_attendance", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
});

export const studentAttendance = pgTable("student_attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  type: text("type").notNull(),
  month: text("month").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("due"),
  date: text("date"),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
});

export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  salaryId: text("salary_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull(),
  month: text("month").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  date: text("date"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  teacher: text("teacher"),
  description: text("description"),
  schedule: text("schedule"),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  date: text("date").notNull(),
  totalMarks: integer("total_marks").default(100),
  description: text("description"),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  department: text("department").notNull(),
  marks: integer("marks").notNull(),
  grade: text("grade"),
  examName: text("exam_name"),
});

export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  day: text("day").notNull(),
  time: text("time").notNull(),
  subject: text("subject").notNull(),
  teacher: text("teacher"),
});

export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  category: text("category"),
  isbn: text("isbn"),
  quantity: integer("quantity").default(1),
  available: integer("available").default(1),
});

export const leaveApplications = pgTable("leave_applications", {
  id: serial("id").primaryKey(),
  applicantName: text("applicant_name").notNull(),
  applicantType: text("applicant_type").notNull(),
  reason: text("reason").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  status: text("status").notNull().default("pending"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  recipient: text("recipient").notNull(),
  message: text("message").notNull(),
  time: text("time"),
  status: text("status").notNull().default("unread"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  type: text("type").notNull().default("general"),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  details: text("details"),
  user: text("user").notNull().default("অ্যাডমিন"),
  timestamp: text("timestamp").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertTeacherAttendanceSchema = createInsertSchema(teacherAttendance).omit({ id: true });
export const insertStudentAttendanceSchema = createInsertSchema(studentAttendance).omit({ id: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export const insertSalarySchema = createInsertSchema(salaries).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true });
export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true });
export const insertLibraryBookSchema = createInsertSchema(libraryBooks).omit({ id: true });
export const insertLeaveApplicationSchema = createInsertSchema(leaveApplications).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacherAttendance = z.infer<typeof insertTeacherAttendanceSchema>;
export type TeacherAttendance = typeof teacherAttendance.$inferSelect;
export type InsertStudentAttendance = z.infer<typeof insertStudentAttendanceSchema>;
export type StudentAttendance = typeof studentAttendance.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Salary = typeof salaries.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;
export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type InsertLeaveApplication = z.infer<typeof insertLeaveApplicationSchema>;
export type LeaveApplication = typeof leaveApplications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
