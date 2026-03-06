# মাদ্রাসা ব্যবস্থাপনা সিস্টেম (Madrasa Management System)

## Overview
Full-stack Madrasa (Islamic school) management application with Bengali (বাংলা) UI. Single-page app with state-based navigation (`activePage`). All state managed in App.tsx.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, Tailwind CSS v4 (`@theme inline`)
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: All UI text in Bengali

## Architecture
- `client/` — React frontend (Vite), SPA with `activePage` state switching
- `server/` — Express API server (generic collection CRUD handlers)
- `shared/` — Shared schema (Drizzle tables)
- No wouter routing, no React Query — plain fetch() API calls from App.tsx
- Components are pure (receive data as props, no API calls inside)

## Database Schema (shared/schema.ts)
20 tables: users, students, teachers, courses, student_attendance, teacher_attendance, fees, expenses, teacher_salaries, exams, results, timetable, books, library_sections, notices, events, notifications, activity_log, admit_cards, leaves, active_sessions, settings

- All tables use serial integer IDs (converted to strings in API responses)
- Settings table stores JSON key/value pairs

## Frontend Structure (client/src/)
- `App.tsx` — Main SPA controller with all state, API calls, CRUD handlers
- `types.ts` — All TypeScript interfaces matching DB schema
- `constants.tsx` — SVG icon components
- `components/utils.ts` — Bengali utilities, grade calculations, print function, geofence
- `components/useCountdown.ts` — Countdown hook for leave management
- `components/*.tsx` — All page components (pure, props-only)

## Components (client/src/components/)
Layout: Sidebar, Header, LoginPage
Core: Dashboard, Charts
Student/Teacher: Students, StudentInfo, Teachers, TeacherDashboard, TeacherAttendance
Finance: Attendance, Fees, Vouchers, TeacherSalary, Courses
Academic: Exams, Results, AdmitCards, Timetable
Other: Library, NoticeBoard, EventsCalendar, Reports, Settings, ActivityLog, AdminRoles, LeaveManagement, MoneyReceipt, MessagePreviewModal

## Key Features (21 pages)
1. ড্যাশবোর্ড (Dashboard) — Stats overview with pie/bar charts
2. শিক্ষার্থীরা (Students) — CRUD with CSV import, class filtering
3. শিক্ষকগণ (Teachers) — Teacher management with responsibilities
4. শিক্ষক হাজিরা (Teacher Attendance) — Teacher daily attendance
5. হাজিরা (Student Attendance) — Student daily attendance
6. ফি ব্যবস্থাপনা (Fees) — Fee collection with auto-receipt generation
7. ব্যয় ব্যবস্থাপনা (Expenses/Vouchers) — Expense tracking with print
8. শিক্ষকদের বেতন (Teacher Salary) — Salary management
9. পরীক্ষা (Exams) — Exam management
10. রেজাল্ট (Results) — Results with marksheet printing
11. প্রবেশপত্র (Admit Cards) — Printable admit cards
12. ছুটির আবেদন (Leave Management) — Leave requests with approval
13. সময়সূচী (Timetable) — Class schedule
14. লাইব্রেরি (Library) — Book/section management
15. নোটিশ বোর্ড (Notices) — Notice board
16. ইভেন্ট ক্যালেন্ডার (Events) — Event calendar
17. রিপোর্ট (Reports) — Financial/attendance reports
18. শিক্ষার্থী তথ্য (Student Info) — Detailed student profile
19. কার্যকলাপ লগ (Activity Log) — System activity log
20. অ্যাডমিন রোল (Admin Roles) — Role/permission management
21. সেটিংস (Settings) — General, SMS, geofence, receipt, signature settings

## API Routes (server/routes.ts)
Generic collection CRUD: `/api/{collection}` — GET (list), POST (create), PATCH/:id (update), DELETE/:id
Special endpoints:
- `POST /api/auth/login` — Login with email/password
- `POST /api/students/bulk` — Bulk student import
- `POST /api/fees/bulk` — Bulk fee creation
- `POST /api/notifications/mark-all-read` — Mark all notifications read
- `GET/POST /api/settings/:key` — Settings CRUD (JSON stored)
- `POST /api/activeSessions/upsert` — Active session tracking
- `POST /api/receipt-number` — Auto-increment receipt counter

## Auth & Roles
- Default admin: admin@madrasa.com / admin123
- Roles: admin, super_admin, teacher
- `hasPermission()` checks teacher.responsibilities array
- Admin/super_admin have full access; teachers see only permitted pages

## Design
- Colors: primary=#1e40af, secondary=#1e3a8a, accent=#fbbf24, background=#f1f5f9
- Default Madrasa name: "দারুল জান্নাত মহিলা কওমী মাদ্রাসা"
- Developer credit: "HM.Abdul Alim" with Facebook link in sidebar footer
- 3D cube loader animation, toast notifications (bottom-right, 5s auto-dismiss)
- Geofence location gatekeeper for restricted teachers
- SMS integration: local + cloud (textbee.dev) modes
