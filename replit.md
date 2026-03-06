# মাদ্রাসা ম্যানেজমেন্ট সিস্টেম (Madrasa Management System)

## Overview
Full-stack Madrasa (Islamic school) management application with Bengali (বাংলা) UI. Built with React frontend and Express/PostgreSQL backend.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, TanStack React Query, Wouter (routing), Recharts, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: All UI text in Bengali

## Architecture
- `client/` — React frontend (Vite)
- `server/` — Express API server
- `shared/` — Shared schema (Drizzle + Zod)

## Database Schema (shared/schema.ts)
Tables: users, students, teachers, teacher_attendance, student_attendance, fees, expenses, salaries, courses, exams, results, routines, library_books, leave_applications, notifications, events, activity_log, settings

## Key Features (20 pages)
1. **ড্যাশবোর্ড** (Dashboard) — Stats overview, pie charts, expense breakdown
2. **শিক্ষার্থীরা** (Students) — CRUD student management with search/filter
3. **শিক্ষকগণ** (Teachers) — Teacher directory with card layout
4. **শিক্ষক হাজিরা** (Teacher Attendance) — Daily attendance with present/absent/late
5. **কোর্সসমূহ** (Courses) — Course management
6. **হাজিরা** (Student Attendance) — Student daily attendance
7. **ফি ব্যবস্থাপনা** (Fees) — Fee collection and tracking
8. **ব্যয় ব্যবস্থাপনা** (Expenses) — Expense tracking
9. **শিক্ষকদের বেতন** (Salary) — Teacher salary management
10. **পরীক্ষা** (Exams) — Exam management
11. **রেজাল্ট** (Results) — Exam results with grades
12. **প্রবেশপত্র** (Admit Card) — Printable admit card generation
13. **সময়সূচী** (Routine) — Class schedule/timetable
14. **লাইব্রেরি** (Library) — Book management
15. **ছুটির আবেদন** (Leave) — Leave application with approve/reject
16. **নোটিশ বোর্ড** (Notifications) — SMS log and system notifications
17. **ইভেন্ট ক্যালেন্ডার** (Events) — Event management
18. **রিপোর্ট** (Reports) — Financial and student reports with charts
19. **কার্যকলাপ লগ** (Activity) — System activity log
20. **সেটিংস** (Settings) — Institution name configuration

Additional: Login page, Admissions form, 404 page

## Design
- Blue sidebar (#1e40af) with white text
- Default Madrasa name: "দারুল জান্নাত মহিলা কওমী মাদ্রাসা"
- Developer credit: "HM.Abdul Alim" in sidebar footer
- Mobile hamburger menu, floating yellow "+" action button on dashboard

## API Routes
All prefixed with `/api/`: students, teachers, teacher-attendance, student-attendance, fees, expenses, salaries, courses, exams, results, routines, library, leave, notifications, events, activity, settings, dashboard/stats
