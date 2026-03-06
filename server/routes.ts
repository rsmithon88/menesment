import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন।' });
      }
      const user = await storage.getUserByUsername(email);
      if (user && user.password === password) {
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email || email,
          role: user.role || 'admin',
          photoURL: user.photoURL,
        });
      }
      const teacher = await storage.getTeacherByEmail(email);
      if (teacher && teacher.password && teacher.password === password) {
        return res.json({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: teacher.isSuperAdmin ? 'super_admin' : 'teacher',
          photoURL: teacher.photoURL,
        });
      }
      return res.status(401).json({ message: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const collections: Record<string, any> = {
    students: {
      getAll: () => storage.getStudents(),
      create: (d: any) => storage.createStudent(d),
      update: (id: number, d: any) => storage.updateStudent(id, d),
      delete: (id: number) => storage.deleteStudent(id),
    },
    teachers: {
      getAll: () => storage.getTeachers(),
      create: (d: any) => storage.createTeacher(d),
      update: (id: number, d: any) => storage.updateTeacher(id, d),
      delete: (id: number) => storage.deleteTeacher(id),
    },
    courses: {
      getAll: () => storage.getCourses(),
      create: (d: any) => storage.createCourse(d),
      update: (id: number, d: any) => storage.updateCourse(id, d),
      delete: (id: number) => storage.deleteCourse(id),
    },
    attendance: {
      getAll: () => storage.getAttendance(),
      create: (d: any) => storage.createAttendance(d),
      update: (id: number, d: any) => storage.updateAttendance(id, d),
      delete: (id: number) => storage.deleteAttendance(id),
    },
    teacherAttendance: {
      getAll: () => storage.getTeacherAttendance(),
      create: (d: any) => storage.createTeacherAttendance(d),
    },
    fees: {
      getAll: () => storage.getFees(),
      create: (d: any) => storage.createFee(d),
      update: (id: number, d: any) => storage.updateFee(id, d),
      delete: (id: number) => storage.deleteFee(id),
    },
    expenses: {
      getAll: () => storage.getExpenses(),
      create: (d: any) => storage.createExpense(d),
      update: (id: number, d: any) => storage.updateExpense(id, d),
      delete: (id: number) => storage.deleteExpense(id),
    },
    teacherSalaries: {
      getAll: () => storage.getTeacherSalaries(),
      create: (d: any) => storage.createTeacherSalary(d),
      update: (id: number, d: any) => storage.updateTeacherSalary(id, d),
      delete: (id: number) => storage.deleteTeacherSalary(id),
    },
    exams: {
      getAll: () => storage.getExams(),
      create: (d: any) => storage.createExam(d),
      update: (id: number, d: any) => storage.updateExam(id, d),
      delete: (id: number) => storage.deleteExam(id),
    },
    results: {
      getAll: () => storage.getResults(),
      create: (d: any) => storage.createResult(d),
      update: (id: number, d: any) => storage.updateResult(id, d),
      delete: (id: number) => storage.deleteResult(id),
    },
    timetable: {
      getAll: () => storage.getTimetable(),
      create: (d: any) => storage.createTimetableEntry(d),
      update: (id: number, d: any) => storage.updateTimetableEntry(id, d),
      delete: (id: number) => storage.deleteTimetableEntry(id),
    },
    books: {
      getAll: () => storage.getBooks(),
      create: (d: any) => storage.createBook(d),
      update: (id: number, d: any) => storage.updateBook(id, d),
      delete: (id: number) => storage.deleteBook(id),
    },
    librarySections: {
      getAll: () => storage.getLibrarySections(),
      create: (d: any) => storage.createLibrarySection(d),
      update: (id: number, d: any) => storage.updateLibrarySection(id, d),
      delete: (id: number) => storage.deleteLibrarySection(id),
    },
    notices: {
      getAll: () => storage.getNotices(),
      create: (d: any) => storage.createNotice(d),
      update: (id: number, d: any) => storage.updateNotice(id, d),
      delete: (id: number) => storage.deleteNotice(id),
    },
    events: {
      getAll: () => storage.getEvents(),
      create: (d: any) => storage.createEvent(d),
      update: (id: number, d: any) => storage.updateEvent(id, d),
      delete: (id: number) => storage.deleteEvent(id),
    },
    notifications: {
      getAll: () => storage.getNotifications(),
      create: (d: any) => storage.createNotification(d),
      update: (id: number, d: any) => storage.updateNotification(id, d),
    },
    admitCards: {
      getAll: () => storage.getAdmitCards(),
      create: (d: any) => storage.createAdmitCard(d),
      update: (id: number, d: any) => storage.updateAdmitCard(id, d),
      delete: (id: number) => storage.deleteAdmitCard(id),
    },
    leaves: {
      getAll: () => storage.getLeaves(),
      create: (d: any) => storage.createLeave(d),
      update: (id: number, d: any) => storage.updateLeave(id, d),
      delete: (id: number) => storage.deleteLeave(id),
    },
    activityLog: {
      getAll: () => storage.getActivityLog(),
      create: (d: any) => storage.createActivityLog(d),
    },
    activeSessions: {
      getAll: () => storage.getActiveSessions(),
    },
  };

  for (const [name, ops] of Object.entries(collections)) {
    if (ops.getAll) {
      app.get(`/api/${name}`, async (_req, res) => {
        try {
          const data = await ops.getAll();
          res.json(data);
        } catch (error: any) {
          res.status(500).json({ message: error.message });
        }
      });
    }

    if (ops.create) {
      app.post(`/api/${name}`, async (req, res) => {
        try {
          const result = await ops.create(req.body);
          res.status(201).json(result);
        } catch (error: any) {
          res.status(500).json({ message: error.message });
        }
      });
    }

    if (ops.update) {
      app.patch(`/api/${name}/:id`, async (req, res) => {
        try {
          const result = await ops.update(Number(req.params.id), req.body);
          if (!result) return res.status(404).json({ message: 'Not found' });
          res.json(result);
        } catch (error: any) {
          res.status(500).json({ message: error.message });
        }
      });
    }

    if (ops.delete) {
      app.delete(`/api/${name}/:id`, async (req, res) => {
        try {
          await ops.delete(Number(req.params.id));
          res.json({ success: true });
        } catch (error: any) {
          res.status(500).json({ message: error.message });
        }
      });
    }
  }

  app.post("/api/students/bulk", async (req, res) => {
    try {
      const result = await storage.createMultipleStudents(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fees/bulk", async (req, res) => {
    try {
      const result = await storage.createMultipleFees(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/mark-all-read", async (_req, res) => {
    try {
      await storage.updateAllNotificationsRead();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (setting) {
        res.json(JSON.parse(setting.value));
      } else {
        res.json(null);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.upsertSetting(req.params.key, JSON.stringify(req.body));
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activeSessions/upsert", async (req, res) => {
    try {
      const result = await storage.upsertActiveSession(req.body.userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/activeSessions/user/:userId", async (req, res) => {
    try {
      await storage.deleteActiveSession(req.params.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/receipt-number", async (_req, res) => {
    try {
      const num = await storage.getNextReceiptNumber();
      res.json({ receiptNumber: num });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
