import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Save, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const teachers = [
  { id: 1, name: "মাওলানা আব্দুল করিম", subject: "কুরআন ও হাদিস", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
  { id: 2, name: "হাফেজ মোঃ ইসমাইল", subject: "হিফজুল কুরআন", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
  { id: 3, name: "মুফতি আব্দুর রহিম", subject: "ফিকহ ও উসুল", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
  { id: 4, name: "জনাব রফিকুল ইসলাম", subject: "বাংলা ও ইংরেজি", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
  { id: 5, name: "ক্বারী মোঃ ইউনুস", subject: "তেলাওয়াত", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
  { id: 6, name: "মাওলানা জুবায়ের", subject: "আরবি সাহিত্য", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=6" },
];

export default function TeacherAttendance() {
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const today = new Date();

  const handleAttendanceChange = (teacherId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [teacherId]: status }));
  };

  const handleSubmit = () => {
    toast({
      title: "হাজিরা সংরক্ষণ করা হয়েছে",
      description: `মোট ${Object.keys(attendance).length} জন শিক্ষকের হাজিরা নেওয়া হয়েছে।`,
    });
  };

  const markAllPresent = () => {
    const allPresent: Record<number, string> = {};
    teachers.forEach(t => {
      allPresent[t.id] = "present";
    });
    setAttendance(allPresent);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">শিক্ষক হাজিরা</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(today, "PPP", { locale: bn })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent}>সবাই উপস্থিত</Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={teacher.image} />
                    <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-base">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                  </div>
                </div>

                <div className="flex-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <RadioGroup 
                    value={attendance[teacher.id]} 
                    onValueChange={(val) => handleAttendanceChange(teacher.id, val)}
                    className="flex items-center gap-2 sm:gap-6 min-w-max"
                  >
                    <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <RadioGroupItem value="present" id={`present-${teacher.id}`} className="text-emerald-600 border-emerald-600" />
                      <Label htmlFor={`present-${teacher.id}`} className="cursor-pointer text-emerald-700 dark:text-emerald-300 font-medium">উপস্থিত</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <RadioGroupItem value="absent" id={`absent-${teacher.id}`} className="text-red-600 border-red-600" />
                      <Label htmlFor={`absent-${teacher.id}`} className="cursor-pointer text-red-700 dark:text-red-300 font-medium">অনুপস্থিত</Label>
                    </div>

                    <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                      <RadioGroupItem value="late" id={`late-${teacher.id}`} className="text-amber-600 border-amber-600" />
                      <Label htmlFor={`late-${teacher.id}`} className="cursor-pointer text-amber-700 dark:text-amber-300 font-medium">দেরি</Label>
                    </div>
                  </RadioGroup>
                </div>

                {attendance[teacher.id] && (
                  <div className="hidden md:flex animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className={`h-6 w-6 ${
                      attendance[teacher.id] === 'present' ? 'text-emerald-500' :
                      attendance[teacher.id] === 'absent' ? 'text-red-500' : 'text-amber-500'
                    }`} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
