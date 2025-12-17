import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  UserCheck,
  CreditCard,
  Receipt,
  Banknote,
  FileText,
  Award,
  IdCard,
  Clock,
  Library,
  FileQuestion,
  Bell,
  Calendar,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Facebook
} from "lucide-react";
import logoImage from "@assets/generated_images/islamic_geometric_pattern_background.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/" },
  { icon: Users, label: "শিক্ষার্থীরা", href: "/students" },
  { icon: GraduationCap, label: "শিক্ষকগণ", href: "/teachers" },
  { icon: ClipboardCheck, label: "শিক্ষক হাজিরা", href: "/teacher-attendance" },
  { icon: BookOpen, label: "কোর্সসমূহ", href: "/courses" },
  { icon: UserCheck, label: "হাজিরা", href: "/attendance" },
  { icon: CreditCard, label: "ফি ব্যবস্থাপনা", href: "/fees" },
  { icon: Receipt, label: "ব্যয় ব্যবস্থাপনা", href: "/expenses" },
  { icon: Banknote, label: "শিক্ষকদের বেতন", href: "/salary" },
  { icon: FileText, label: "পরীক্ষা", href: "/exams" },
  { icon: Award, label: "রেজাল্ট", href: "/results" },
  { icon: IdCard, label: "প্রবেশপত্র", href: "/admit-card" },
  { icon: Clock, label: "সময়সূচী", href: "/routine" },
  { icon: Library, label: "লাইব্রেরি", href: "/library" },
  { icon: FileQuestion, label: "ছুটির আবেদন", href: "/leave" },
  { icon: Bell, label: "নোটিশ বোর্ড", href: "/notifications" },
  { icon: Calendar, label: "ইভেন্ট ক্যালেন্ডার", href: "/events" },
  { icon: BarChart3, label: "রিপোর্ট", href: "/reports" },
  { icon: Activity, label: "কার্যকলাপ লগ", href: "/activity" },
  { icon: Settings, label: "সেটিংস", href: "/settings" },
];

import { useSettings } from "@/hooks/use-settings";

export function SidebarContent() {
  const [location, setLocation] = useLocation();
  const { madrasaName } = useSettings();

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#1e40af] text-white">
      <div className="h-16 flex items-center px-6 border-b border-blue-500/30">
        <div className="flex items-center gap-3 w-full justify-between">
          <span className="font-bold text-lg tracking-tight truncate" title={madrasaName}>{madrasaName}</span>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-blue-500/30 mt-auto">
        <div className="flex flex-col items-center gap-2 text-xs text-white/70 mb-4">
          <span>Developer by HM.Abdul Alim</span>
          <Facebook className="h-4 w-4" />
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
          <LogOut className="h-4 w-4" />
          লগ আউট
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1e40af] border-r border-blue-500/30 hidden md:flex flex-col shadow-xl">
      <SidebarContent />
    </aside>
  );
}
