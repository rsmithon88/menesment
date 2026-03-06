import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Admissions from "@/pages/admissions";
import Teachers from "@/pages/teachers";
import Fees from "@/pages/fees";
import Login from "@/pages/login";
import Salary from "@/pages/salary";
import Notifications from "@/pages/notifications";
import TeacherAttendance from "@/pages/teacher-attendance";
import Settings from "@/pages/settings";
import Courses from "@/pages/courses";
import Attendance from "@/pages/attendance";
import Expenses from "@/pages/expenses";
import Exams from "@/pages/exams";
import Results from "@/pages/results";
import AdmitCard from "@/pages/admit-card";
import RoutinePage from "@/pages/routine";
import LibraryPage from "@/pages/library";
import Leave from "@/pages/leave";
import Events from "@/pages/events";
import Reports from "@/pages/reports";
import ActivityPage from "@/pages/activity";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/teacher-attendance" component={TeacherAttendance} />
      <Route path="/courses" component={Courses} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={Fees} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/salary" component={Salary} />
      <Route path="/exams" component={Exams} />
      <Route path="/results" component={Results} />
      <Route path="/admit-card" component={AdmitCard} />
      <Route path="/routine" component={RoutinePage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/leave" component={Leave} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/events" component={Events} />
      <Route path="/reports" component={Reports} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <Toaster />
          <Router />
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
