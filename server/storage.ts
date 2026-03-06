import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, students, teachers, teacherAttendance, studentAttendance,
  fees, expenses, salaries, courses, exams, results, routines,
  libraryBooks, leaveApplications, notifications, events, activityLog, settings,
  type InsertUser, type User,
  type InsertStudent, type Student,
  type InsertTeacher, type Teacher,
  type InsertTeacherAttendance, type TeacherAttendance,
  type InsertStudentAttendance, type StudentAttendance,
  type InsertFee, type Fee,
  type InsertExpense, type Expense,
  type InsertSalary, type Salary,
  type InsertCourse, type Course,
  type InsertExam, type Exam,
  type InsertResult, type Result,
  type InsertRoutine, type Routine,
  type InsertLibraryBook, type LibraryBook,
  type InsertLeaveApplication, type LeaveApplication,
  type InsertNotification, type Notification,
  type InsertEvent, type Event,
  type InsertActivityLog, type ActivityLog,
  type InsertSetting, type Setting,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<void>;

  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: number): Promise<void>;

  getTeacherAttendance(date: string): Promise<TeacherAttendance[]>;
  saveTeacherAttendance(records: InsertTeacherAttendance[]): Promise<TeacherAttendance[]>;

  getStudentAttendance(date: string): Promise<StudentAttendance[]>;
  saveStudentAttendance(records: InsertStudentAttendance[]): Promise<StudentAttendance[]>;

  getFees(): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, fee: Partial<InsertFee>): Promise<Fee | undefined>;

  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;

  getSalaries(): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;

  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;

  getExams(): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  deleteExam(id: number): Promise<void>;

  getResults(): Promise<Result[]>;
  getResultsByExam(examId: number): Promise<Result[]>;
  createResult(result: InsertResult): Promise<Result>;

  getRoutines(): Promise<Routine[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  deleteRoutine(id: number): Promise<void>;

  getLibraryBooks(): Promise<LibraryBook[]>;
  createLibraryBook(book: InsertLibraryBook): Promise<LibraryBook>;
  updateLibraryBook(id: number, book: Partial<InsertLibraryBook>): Promise<LibraryBook | undefined>;
  deleteLibraryBook(id: number): Promise<void>;

  getLeaveApplications(): Promise<LeaveApplication[]>;
  createLeaveApplication(app: InsertLeaveApplication): Promise<LeaveApplication>;
  updateLeaveApplication(id: number, app: Partial<InsertLeaveApplication>): Promise<LeaveApplication | undefined>;

  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  getActivityLog(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(key: string, value: string): Promise<Setting>;

  getDashboardStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalTeachers: number;
    totalFees: number;
    totalExpenses: number;
    totalDue: number;
    maleStudents: number;
    femaleStudents: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getStudents(): Promise<Student[]> {
    return db.select().from(students).orderBy(desc(students.id));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    return created;
  }

  async updateStudent(id: number, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers).orderBy(desc(teachers.id));
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [created] = await db.insert(teachers).values(teacher).returning();
    return created;
  }

  async updateTeacher(id: number, data: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const [updated] = await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
    return updated;
  }

  async deleteTeacher(id: number): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  async getTeacherAttendance(date: string): Promise<TeacherAttendance[]> {
    return db.select().from(teacherAttendance).where(eq(teacherAttendance.date, date));
  }

  async saveTeacherAttendance(records: InsertTeacherAttendance[]): Promise<TeacherAttendance[]> {
    if (records.length === 0) return [];
    const date = records[0].date;
    await db.delete(teacherAttendance).where(eq(teacherAttendance.date, date));
    return db.insert(teacherAttendance).values(records).returning();
  }

  async getStudentAttendance(date: string): Promise<StudentAttendance[]> {
    return db.select().from(studentAttendance).where(eq(studentAttendance.date, date));
  }

  async saveStudentAttendance(records: InsertStudentAttendance[]): Promise<StudentAttendance[]> {
    if (records.length === 0) return [];
    const date = records[0].date;
    await db.delete(studentAttendance).where(eq(studentAttendance.date, date));
    return db.insert(studentAttendance).values(records).returning();
  }

  async getFees(): Promise<Fee[]> {
    return db.select().from(fees).orderBy(desc(fees.id));
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const [created] = await db.insert(fees).values(fee).returning();
    return created;
  }

  async updateFee(id: number, data: Partial<InsertFee>): Promise<Fee | undefined> {
    const [updated] = await db.update(fees).set(data).where(eq(fees.id, id)).returning();
    return updated;
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.id));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getSalaries(): Promise<Salary[]> {
    return db.select().from(salaries).orderBy(desc(salaries.id));
  }

  async createSalary(salary: InsertSalary): Promise<Salary> {
    const [created] = await db.insert(salaries).values(salary).returning();
    return created;
  }

  async updateSalary(id: number, data: Partial<InsertSalary>): Promise<Salary | undefined> {
    const [updated] = await db.update(salaries).set(data).where(eq(salaries.id, id)).returning();
    return updated;
  }

  async getCourses(): Promise<Course[]> {
    return db.select().from(courses).orderBy(desc(courses.id));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getExams(): Promise<Exam[]> {
    return db.select().from(exams).orderBy(desc(exams.id));
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [created] = await db.insert(exams).values(exam).returning();
    return created;
  }

  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  async getResults(): Promise<Result[]> {
    return db.select().from(results).orderBy(desc(results.id));
  }

  async getResultsByExam(examId: number): Promise<Result[]> {
    return db.select().from(results).where(eq(results.examId, examId));
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [created] = await db.insert(results).values(result).returning();
    return created;
  }

  async getRoutines(): Promise<Routine[]> {
    return db.select().from(routines);
  }

  async createRoutine(routine: InsertRoutine): Promise<Routine> {
    const [created] = await db.insert(routines).values(routine).returning();
    return created;
  }

  async deleteRoutine(id: number): Promise<void> {
    await db.delete(routines).where(eq(routines.id, id));
  }

  async getLibraryBooks(): Promise<LibraryBook[]> {
    return db.select().from(libraryBooks).orderBy(desc(libraryBooks.id));
  }

  async createLibraryBook(book: InsertLibraryBook): Promise<LibraryBook> {
    const [created] = await db.insert(libraryBooks).values(book).returning();
    return created;
  }

  async updateLibraryBook(id: number, data: Partial<InsertLibraryBook>): Promise<LibraryBook | undefined> {
    const [updated] = await db.update(libraryBooks).set(data).where(eq(libraryBooks.id, id)).returning();
    return updated;
  }

  async deleteLibraryBook(id: number): Promise<void> {
    await db.delete(libraryBooks).where(eq(libraryBooks.id, id));
  }

  async getLeaveApplications(): Promise<LeaveApplication[]> {
    return db.select().from(leaveApplications).orderBy(desc(leaveApplications.id));
  }

  async createLeaveApplication(app: InsertLeaveApplication): Promise<LeaveApplication> {
    const [created] = await db.insert(leaveApplications).values(app).returning();
    return created;
  }

  async updateLeaveApplication(id: number, data: Partial<InsertLeaveApplication>): Promise<LeaveApplication | undefined> {
    const [updated] = await db.update(leaveApplications).set(data).where(eq(leaveApplications.id, id)).returning();
    return updated;
  }

  async getNotifications(): Promise<Notification[]> {
    return db.select().from(notifications).orderBy(desc(notifications.id));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.id));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getActivityLog(): Promise<ActivityLog[]> {
    return db.select().from(activityLog).orderBy(desc(activityLog.id));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLog).values(log).returning();
    return created;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return updated;
    }
    const [created] = await db.insert(settings).values({ key, value }).returning();
    return created;
  }

  async getDashboardStats() {
    const allStudents = await db.select().from(students);
    const allFees = await db.select().from(fees);
    const allExpenses = await db.select().from(expenses);
    const allTeachers = await db.select().from(teachers);

    const activeStudents = allStudents.filter(s => s.status === "active").length;
    const inactiveStudents = allStudents.filter(s => s.status === "inactive").length;
    const totalFees = allFees.filter(f => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
    const totalDue = allFees.filter(f => f.status === "due").reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const maleStudents = allStudents.filter(s => s.gender === "male").length;
    const femaleStudents = allStudents.filter(s => s.gender === "female").length;

    return {
      totalStudents: allStudents.length,
      activeStudents,
      inactiveStudents,
      totalTeachers: allTeachers.length,
      totalFees,
      totalExpenses,
      totalDue,
      maleStudents,
      femaleStudents,
    };
  }
}

export const storage = new DatabaseStorage();
