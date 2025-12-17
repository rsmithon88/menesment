import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Admissions from "@/pages/admissions";
import Teachers from "@/pages/teachers";
import Fees from "@/pages/fees";
import Login from "@/pages/login";
import Salary from "@/pages/salary";
import Notifications from "@/pages/notifications";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/fees" component={Fees} />
      <Route path="/salary" component={Salary} />
      <Route path="/notifications" component={Notifications} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
