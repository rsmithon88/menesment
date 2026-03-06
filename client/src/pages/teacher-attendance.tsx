import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Save, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Teacher, TeacherAttendance as TeacherAttendanceType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherAttendance() {
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const today = new Date();
  const dateStr = format(today, "yyyy-MM-dd");

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: existingAttendance = [] } = useQuery<TeacherAttendanceType[]>({
    queryKey: [`/api/teacher-attendance/${dateStr}`],
  });

  useEffect(() => {
    if (existingAttendance.length > 0) {
      const map: Record<number, string> = {};
      existingAttendance.forEach((a) => {
        map[a.teacherId] = a.status;
      });
      setAttendance(map);
    }
  }, [existingAttendance]);

  const submitMutation = useMutation({
    mutationFn: async (records: { teacherId: number; date: string; status: string }[]) => {
      await apiRequest("POST", "/api/teacher-attendance", { date: dateStr, records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teacher-attendance/${dateStr}`] });
      toast({
        title: "হাজিরা সংরক্ষণ করা হয়েছে",
        description: `মোট ${Object.keys(attendance).length} জন শিক্ষকের হাজিরা নেওয়া হয়েছে।`,
      });
    },
  });

  const handleAttendanceChange = (teacherId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [teacherId]: status }));
  };

  const handleSubmit = () => {
    const records = Object.entries(attendance).map(([id, status]) => ({
      teacherId: parseInt(id),
      date: dateStr,
      status,
    }));
    submitMutation.mutate(records);
  };

  const markAllPresent = () => {
    const allPresent: Record<number, string> = {};
    teachers.forEach(t => {
      allPresent[t.id] = "present";
    });
    setAttendance(allPresent);
  };

  if (teachersLoading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-4xl mx-auto" data-testid="attendance-loading">
          <Skeleton className="h-10 w-64" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto" data-testid="teacher-attendance-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-attendance-title">শিক্ষক হাজিরা</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4" />
              <span data-testid="text-attendance-date">{format(today, "PPP", { locale: bn })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent} data-testid="button-mark-all-present">সবাই উপস্থিত</Button>
            <Button onClick={handleSubmit} className="gap-2" disabled={submitMutation.isPending} data-testid="button-save-attendance">
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md" data-testid={`card-teacher-attendance-${teacher.id}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`} />
                    <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-base" data-testid={`text-teacher-att-name-${teacher.id}`}>{teacher.name}</h3>
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
                      <RadioGroupItem value="present" id={`present-${teacher.id}`} className="text-emerald-600 border-emerald-600" data-testid={`radio-present-${teacher.id}`} />
                      <Label htmlFor={`present-${teacher.id}`} className="cursor-pointer text-emerald-700 dark:text-emerald-300 font-medium">উপস্থিত</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <RadioGroupItem value="absent" id={`absent-${teacher.id}`} className="text-red-600 border-red-600" data-testid={`radio-absent-${teacher.id}`} />
                      <Label htmlFor={`absent-${teacher.id}`} className="cursor-pointer text-red-700 dark:text-red-300 font-medium">অনুপস্থিত</Label>
                    </div>

                    <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                      <RadioGroupItem value="late" id={`late-${teacher.id}`} className="text-amber-600 border-amber-600" data-testid={`radio-late-${teacher.id}`} />
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
