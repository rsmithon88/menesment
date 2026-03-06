import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Save, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Student, StudentAttendance as StudentAttendanceType } from "@shared/schema";

export default function Attendance() {
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: existingAttendance = [] } = useQuery<StudentAttendanceType[]>({
    queryKey: ["/api/student-attendance", today],
  });

  useEffect(() => {
    if (existingAttendance.length > 0) {
      const existing: Record<number, string> = {};
      existingAttendance.forEach((a) => {
        existing[a.studentId] = a.status;
      });
      setAttendance(existing);
    }
  }, [existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async (records: { studentId: number; date: string; status: string }[]) => {
      await apiRequest("POST", "/api/student-attendance", { records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student-attendance"] });
      toast({
        title: "হাজিরা সংরক্ষণ করা হয়েছে",
        description: `মোট ${Object.keys(attendance).length} জন ছাত্রের হাজিরা নেওয়া হয়েছে।`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    const records = Object.entries(attendance).map(([id, status]) => ({
      studentId: Number(id),
      date: today,
      status,
    }));
    if (records.length === 0) return;
    saveMutation.mutate(records);
  };

  const markAllPresent = () => {
    const allPresent: Record<number, string> = {};
    students.forEach((s) => {
      allPresent[s.id] = "present";
    });
    setAttendance(allPresent);
  };

  if (studentsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-attendance">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-page-title">ছাত্র হাজিরা</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4" />
              <span data-testid="text-attendance-date">{format(new Date(), "PPP", { locale: bn })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent} data-testid="button-mark-all-present">সবাই উপস্থিত</Button>
            <Button onClick={handleSubmit} className="gap-2" disabled={saveMutation.isPending} data-testid="button-save-attendance">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center text-muted-foreground py-12" data-testid="text-no-students">
            কোনো ছাত্র পাওয়া যায়নি
          </div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md" data-testid={`card-student-${student.id}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                      <AvatarFallback>{student.nameBn[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-base" data-testid={`text-student-name-${student.id}`}>{student.nameBn}</h3>
                      <p className="text-sm text-muted-foreground">{student.department} — রোল: {student.roll || "—"}</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <RadioGroup
                      value={attendance[student.id]}
                      onValueChange={(val) => handleAttendanceChange(student.id, val)}
                      className="flex items-center gap-2 sm:gap-6 min-w-max"
                    >
                      <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                        <RadioGroupItem value="present" id={`present-${student.id}`} className="text-emerald-600 border-emerald-600" data-testid={`radio-present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`} className="cursor-pointer text-emerald-700 dark:text-emerald-300 font-medium">উপস্থিত</Label>
                      </div>

                      <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-full border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <RadioGroupItem value="absent" id={`absent-${student.id}`} className="text-red-600 border-red-600" data-testid={`radio-absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`} className="cursor-pointer text-red-700 dark:text-red-300 font-medium">অনুপস্থিত</Label>
                      </div>

                      <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                        <RadioGroupItem value="late" id={`late-${student.id}`} className="text-amber-600 border-amber-600" data-testid={`radio-late-${student.id}`} />
                        <Label htmlFor={`late-${student.id}`} className="cursor-pointer text-amber-700 dark:text-amber-300 font-medium">দেরি</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {attendance[student.id] && (
                    <div className="hidden md:flex animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 className={`h-6 w-6 ${
                        attendance[student.id] === "present" ? "text-emerald-500" :
                        attendance[student.id] === "absent" ? "text-red-500" : "text-amber-500"
                      }`} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
