import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertStudentSchema, insertTeacherSchema, insertFeeSchema,
  insertExpenseSchema, insertSalarySchema, insertCourseSchema,
  insertExamSchema, insertResultSchema, insertRoutineSchema,
  insertLibraryBookSchema, insertLeaveApplicationSchema,
  insertNotificationSchema, insertEventSchema, insertActivityLogSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/dashboard/stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/students", async (_req, res) => {
    const data = await storage.getStudents();
    res.json(data);
  });

  app.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(Number(req.params.id));
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.post("/api/students", async (req, res) => {
    const parsed = insertStudentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const student = await storage.createStudent(parsed.data);
    await storage.createActivityLog({ action: "নতুন ছাত্র ভর্তি", details: student.nameBn, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.status(201).json(student);
  });

  app.patch("/api/students/:id", async (req, res) => {
    const updated = await storage.updateStudent(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json(updated);
  });

  app.delete("/api/students/:id", async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    await storage.createActivityLog({ action: "ছাত্র ডিলিট", details: `ID: ${req.params.id}`, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.json({ success: true });
  });

  app.get("/api/teachers", async (_req, res) => {
    const data = await storage.getTeachers();
    res.json(data);
  });

  app.post("/api/teachers", async (req, res) => {
    const parsed = insertTeacherSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const teacher = await storage.createTeacher(parsed.data);
    await storage.createActivityLog({ action: "নতুন শিক্ষক যোগ", details: teacher.name, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.status(201).json(teacher);
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    const updated = await storage.updateTeacher(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.json(updated);
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    await storage.deleteTeacher(Number(req.params.id));
    await storage.createActivityLog({ action: "শিক্ষক ডিলিট", details: `ID: ${req.params.id}`, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.json({ success: true });
  });

  app.get("/api/teacher-attendance/:date", async (req, res) => {
    const data = await storage.getTeacherAttendance(req.params.date);
    res.json(data);
  });

  app.post("/api/teacher-attendance", async (req, res) => {
    const data = await storage.saveTeacherAttendance(req.body.records);
    res.json(data);
  });

  app.get("/api/student-attendance/:date", async (req, res) => {
    const data = await storage.getStudentAttendance(req.params.date);
    res.json(data);
  });

  app.post("/api/student-attendance", async (req, res) => {
    const data = await storage.saveStudentAttendance(req.body.records);
    res.json(data);
  });

  app.get("/api/fees", async (_req, res) => {
    const data = await storage.getFees();
    res.json(data);
  });

  app.post("/api/fees", async (req, res) => {
    const parsed = insertFeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const fee = await storage.createFee(parsed.data);
    await storage.createActivityLog({ action: "ফি গ্রহণ", details: `${fee.studentName} - ৳${fee.amount}`, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.status(201).json(fee);
  });

  app.patch("/api/fees/:id", async (req, res) => {
    const updated = await storage.updateFee(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Fee not found" });
    res.json(updated);
  });

  app.get("/api/expenses", async (_req, res) => {
    const data = await storage.getExpenses();
    res.json(data);
  });

  app.post("/api/expenses", async (req, res) => {
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const expense = await storage.createExpense(parsed.data);
    await storage.createActivityLog({ action: "নতুন ব্যয় যোগ", details: `${expense.category} - ৳${expense.amount}`, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.status(201).json(expense);
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    await storage.deleteExpense(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/salaries", async (_req, res) => {
    const data = await storage.getSalaries();
    res.json(data);
  });

  app.post("/api/salaries", async (req, res) => {
    const parsed = insertSalarySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const salary = await storage.createSalary(parsed.data);
    await storage.createActivityLog({ action: "বেতন পরিশোধ", details: `${salary.teacherName} - ৳${salary.amount}`, user: "অ্যাডমিন", timestamp: new Date().toISOString() });
    res.status(201).json(salary);
  });

  app.patch("/api/salaries/:id", async (req, res) => {
    const updated = await storage.updateSalary(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Salary not found" });
    res.json(updated);
  });

  app.get("/api/courses", async (_req, res) => {
    const data = await storage.getCourses();
    res.json(data);
  });

  app.post("/api/courses", async (req, res) => {
    const parsed = insertCourseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const course = await storage.createCourse(parsed.data);
    res.status(201).json(course);
  });

  app.patch("/api/courses/:id", async (req, res) => {
    const updated = await storage.updateCourse(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json(updated);
  });

  app.delete("/api/courses/:id", async (req, res) => {
    await storage.deleteCourse(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/exams", async (_req, res) => {
    const data = await storage.getExams();
    res.json(data);
  });

  app.post("/api/exams", async (req, res) => {
    const parsed = insertExamSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const exam = await storage.createExam(parsed.data);
    res.status(201).json(exam);
  });

  app.delete("/api/exams/:id", async (req, res) => {
    await storage.deleteExam(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/results", async (_req, res) => {
    const data = await storage.getResults();
    res.json(data);
  });

  app.get("/api/results/exam/:examId", async (req, res) => {
    const data = await storage.getResultsByExam(Number(req.params.examId));
    res.json(data);
  });

  app.post("/api/results", async (req, res) => {
    const parsed = insertResultSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const result = await storage.createResult(parsed.data);
    res.status(201).json(result);
  });

  app.get("/api/routines", async (_req, res) => {
    const data = await storage.getRoutines();
    res.json(data);
  });

  app.post("/api/routines", async (req, res) => {
    const parsed = insertRoutineSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const routine = await storage.createRoutine(parsed.data);
    res.status(201).json(routine);
  });

  app.delete("/api/routines/:id", async (req, res) => {
    await storage.deleteRoutine(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/library", async (_req, res) => {
    const data = await storage.getLibraryBooks();
    res.json(data);
  });

  app.post("/api/library", async (req, res) => {
    const parsed = insertLibraryBookSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const book = await storage.createLibraryBook(parsed.data);
    res.status(201).json(book);
  });

  app.patch("/api/library/:id", async (req, res) => {
    const updated = await storage.updateLibraryBook(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  });

  app.delete("/api/library/:id", async (req, res) => {
    await storage.deleteLibraryBook(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/leave", async (_req, res) => {
    const data = await storage.getLeaveApplications();
    res.json(data);
  });

  app.post("/api/leave", async (req, res) => {
    const parsed = insertLeaveApplicationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const leave = await storage.createLeaveApplication(parsed.data);
    res.status(201).json(leave);
  });

  app.patch("/api/leave/:id", async (req, res) => {
    const updated = await storage.updateLeaveApplication(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Leave application not found" });
    res.json(updated);
  });

  app.get("/api/notifications", async (_req, res) => {
    const data = await storage.getNotifications();
    res.json(data);
  });

  app.post("/api/notifications", async (req, res) => {
    const parsed = insertNotificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const notification = await storage.createNotification(parsed.data);
    res.status(201).json(notification);
  });

  app.get("/api/events", async (_req, res) => {
    const data = await storage.getEvents();
    res.json(data);
  });

  app.post("/api/events", async (req, res) => {
    const parsed = insertEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const event = await storage.createEvent(parsed.data);
    res.status(201).json(event);
  });

  app.delete("/api/events/:id", async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/activity", async (_req, res) => {
    const data = await storage.getActivityLog();
    res.json(data);
  });

  app.get("/api/settings/:key", async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    res.json(setting || { key: req.params.key, value: "" });
  });

  app.post("/api/settings", async (req, res) => {
    const { key, value } = req.body;
    const setting = await storage.upsertSetting(key, value);
    res.json(setting);
  });

  return httpServer;
}
