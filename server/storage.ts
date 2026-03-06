import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, students, teachers, courses, studentAttendance, teacherAttendance,
  fees, expenses, teacherSalaries, exams, results, timetable, books,
  librarySections, notices, events, notifications, activityLog, admitCards,
  leaves, activeSessions, settings,
} from "@shared/schema";

function toStringId(row: any) {
  if (row && typeof row.id === 'number') {
    return { ...row, id: row.id.toString() };
  }
  return row;
}

function toStringIds(rows: any[]) {
  return rows.map(toStringId);
}

async function getAll(table: any) {
  return toStringIds(await db.select().from(table));
}

async function getById(table: any, id: number) {
  const [row] = await db.select().from(table).where(eq(table.id, id));
  return row ? toStringId(row) : undefined;
}

async function create(table: any, data: any) {
  const result = await db.insert(table).values(data).returning() as any;
  return toStringId(result[0]);
}

async function update(table: any, id: number, data: any) {
  const cleanData = { ...data };
  delete cleanData.id;
  const [row] = await db.update(table).set(cleanData).where(eq(table.id, id)).returning();
  return row ? toStringId(row) : undefined;
}

async function remove(table: any, id: number) {
  await db.delete(table).where(eq(table.id, id));
}

export const storage = {
  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user ? toStringId(user) : undefined;
  },
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ? toStringId(user) : undefined;
  },
  async createUser(data: any) { return create(users, data); },
  async updateUser(id: number, data: any) { return update(users, id, data); },

  async getStudents() { return getAll(students); },
  async getStudent(id: number) { return getById(students, id); },
  async createStudent(data: any) { return create(students, data); },
  async createMultipleStudents(dataArr: any[]) {
    const rows = await db.insert(students).values(dataArr).returning();
    return toStringIds(rows);
  },
  async updateStudent(id: number, data: any) { return update(students, id, data); },
  async deleteStudent(id: number) { return remove(students, id); },

  async getTeachers() { return getAll(teachers); },
  async getTeacher(id: number) { return getById(teachers, id); },
  async getTeacherByEmail(email: string) {
    const [t] = await db.select().from(teachers).where(eq(teachers.email, email));
    return t ? toStringId(t) : undefined;
  },
  async createTeacher(data: any) { return create(teachers, data); },
  async updateTeacher(id: number, data: any) { return update(teachers, id, data); },
  async deleteTeacher(id: number) { return remove(teachers, id); },

  async getCourses() { return getAll(courses); },
  async createCourse(data: any) { return create(courses, data); },
  async updateCourse(id: number, data: any) { return update(courses, id, data); },
  async deleteCourse(id: number) { return remove(courses, id); },

  async getAttendance() { return getAll(studentAttendance); },
  async createAttendance(data: any) { return create(studentAttendance, data); },
  async updateAttendance(id: number, data: any) { return update(studentAttendance, id, data); },
  async deleteAttendance(id: number) { return remove(studentAttendance, id); },

  async getTeacherAttendance() { return getAll(teacherAttendance); },
  async createTeacherAttendance(data: any) { return create(teacherAttendance, data); },

  async getFees() { return getAll(fees); },
  async createFee(data: any) { return create(fees, data); },
  async createMultipleFees(dataArr: any[]) {
    const rows = await db.insert(fees).values(dataArr).returning();
    return toStringIds(rows);
  },
  async updateFee(id: number, data: any) { return update(fees, id, data); },
  async deleteFee(id: number) { return remove(fees, id); },

  async getExpenses() { return getAll(expenses); },
  async createExpense(data: any) { return create(expenses, data); },
  async updateExpense(id: number, data: any) { return update(expenses, id, data); },
  async deleteExpense(id: number) { return remove(expenses, id); },

  async getTeacherSalaries() { return getAll(teacherSalaries); },
  async createTeacherSalary(data: any) { return create(teacherSalaries, data); },
  async updateTeacherSalary(id: number, data: any) { return update(teacherSalaries, id, data); },
  async deleteTeacherSalary(id: number) { return remove(teacherSalaries, id); },

  async getExams() { return getAll(exams); },
  async createExam(data: any) { return create(exams, data); },
  async updateExam(id: number, data: any) { return update(exams, id, data); },
  async deleteExam(id: number) { return remove(exams, id); },

  async getResults() { return getAll(results); },
  async createResult(data: any) { return create(results, data); },
  async updateResult(id: number, data: any) { return update(results, id, data); },
  async deleteResult(id: number) { return remove(results, id); },

  async getTimetable() { return getAll(timetable); },
  async createTimetableEntry(data: any) { return create(timetable, data); },
  async updateTimetableEntry(id: number, data: any) { return update(timetable, id, data); },
  async deleteTimetableEntry(id: number) { return remove(timetable, id); },

  async getBooks() { return getAll(books); },
  async createBook(data: any) { return create(books, data); },
  async updateBook(id: number, data: any) { return update(books, id, data); },
  async deleteBook(id: number) { return remove(books, id); },

  async getLibrarySections() { return getAll(librarySections); },
  async createLibrarySection(data: any) { return create(librarySections, data); },
  async updateLibrarySection(id: number, data: any) { return update(librarySections, id, data); },
  async deleteLibrarySection(id: number) { return remove(librarySections, id); },

  async getNotices() { return getAll(notices); },
  async createNotice(data: any) { return create(notices, data); },
  async updateNotice(id: number, data: any) { return update(notices, id, data); },
  async deleteNotice(id: number) { return remove(notices, id); },

  async getEvents() { return getAll(events); },
  async createEvent(data: any) { return create(events, data); },
  async updateEvent(id: number, data: any) { return update(events, id, data); },
  async deleteEvent(id: number) { return remove(events, id); },

  async getNotifications() { return getAll(notifications); },
  async createNotification(data: any) { return create(notifications, data); },
  async updateNotification(id: number, data: any) { return update(notifications, id, data); },
  async updateAllNotificationsRead() {
    await db.update(notifications).set({ isRead: true });
  },

  async getActivityLog() {
    return toStringIds(await db.select().from(activityLog).orderBy(desc(activityLog.id)).limit(100));
  },
  async createActivityLog(data: any) { return create(activityLog, data); },

  async getAdmitCards() { return getAll(admitCards); },
  async createAdmitCard(data: any) { return create(admitCards, data); },
  async updateAdmitCard(id: number, data: any) { return update(admitCards, id, data); },
  async deleteAdmitCard(id: number) { return remove(admitCards, id); },

  async getLeaves() { return getAll(leaves); },
  async createLeave(data: any) { return create(leaves, data); },
  async updateLeave(id: number, data: any) { return update(leaves, id, data); },
  async deleteLeave(id: number) { return remove(leaves, id); },

  async getActiveSessions() { return getAll(activeSessions); },
  async upsertActiveSession(userId: string, data: any) {
    const [existing] = await db.select().from(activeSessions).where(eq(activeSessions.userId, userId));
    if (existing) {
      return update(activeSessions, existing.id, data);
    }
    return create(activeSessions, data);
  },
  async deleteActiveSession(userId: string) {
    await db.delete(activeSessions).where(eq(activeSessions.userId, userId));
  },

  async getSetting(key: string) {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  },
  async upsertSetting(key: string, value: string) {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return updated;
    }
    const [created] = await db.insert(settings).values({ key, value }).returning();
    return created;
  },

  async getNextReceiptNumber() {
    const setting = await this.getSetting('receiptCounter');
    const current = setting ? parseInt(setting.value) || 0 : 0;
    const next = current + 1;
    await this.upsertSetting('receiptCounter', next.toString());
    return next;
  },
};
