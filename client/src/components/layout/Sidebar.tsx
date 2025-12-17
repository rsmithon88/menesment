import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  UserPlus,
  Banknote,
  Bell
} from "lucide-react";
import logoImage from "@assets/generated_images/islamic_geometric_pattern_background.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/" },
  { icon: Users, label: "ছাত্র/ছাত্রী", href: "/students" },
  { icon: UserPlus, label: "নতুন ভর্তি", href: "/admissions" },
  { icon: GraduationCap, label: "শিক্ষক/শিক্ষিকা", href: "/teachers" },
  { icon: Banknote, label: "বেতন (শিক্ষক)", href: "/salary" },
  { icon: BookOpen, label: "ক্লাস রুটিন", href: "/classes" },
  { icon: CreditCard, label: "ফি আদায়", href: "/fees" },
  { icon: Bell, label: "নোটিফিকেশন", href: "/notifications" },
  { icon: Settings, label: "সেটিংস", href: "/settings" },
];

export function SidebarContent() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-primary/10 relative flex items-center justify-center">
             <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url(${logoImage})`, backgroundSize: 'cover' }} />
             <BookOpen className="h-4 w-4 text-primary relative z-10" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">মাদ্রাসা ম্যানেজমেন্ট</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50")} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" />
          লগ আউট
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
      <SidebarContent />
    </aside>
  );
}
