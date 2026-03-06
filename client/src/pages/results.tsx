import { Layout } from "@/components/layout/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";
import type { Result, Exam, Student } from "@shared/schema";

function calculateGrade(marks: number, totalMarks: number): string {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

export default function Results() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const queryClient = useQueryClient();

  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
  });

  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/results", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      setIsOpen(false);
      setSelectedExamId("");
      setSelectedStudentId("");
      setMarks("");
      toast({ title: "ফলাফল যোগ হয়েছে", description: "ছাত্রের ফলাফল সফলভাবে সংরক্ষণ করা হয়েছে।" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "ফলাফল সংরক্ষণে সমস্যা হয়েছে।", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!selectedExamId || !selectedStudentId || !marks) {
      toast({ title: "ত্রুটি", description: "সকল প্রয়োজনীয় তথ্য দিন।", variant: "destructive" });
      return;
    }
    const exam = exams.find((e) => e.id === parseInt(selectedExamId));
    const student = students.find((s) => s.id === parseInt(selectedStudentId));
    if (!exam || !student) return;

    const marksNum = parseInt(marks);
    const grade = calculateGrade(marksNum, exam.totalMarks || 100);

    createMutation.mutate({
      examId: exam.id,
      studentId: student.id,
      studentName: student.nameBn,
      department: student.department,
      marks: marksNum,
      grade,
      examName: exam.name,
    });
  };

  if (resultsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-results">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  const gradeColor = (grade: string | null) => {
    switch (grade) {
      case "A+": return "bg-emerald-100 text-emerald-700";
      case "A": return "bg-green-100 text-green-700";
      case "B": return "bg-blue-100 text-blue-700";
      case "C": return "bg-yellow-100 text-yellow-700";
      case "D": return "bg-orange-100 text-orange-700";
      case "F": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">ফলাফল ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">ছাত্রদের পরীক্ষার ফলাফল পরিচালনা।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-result">
                <Plus className="h-4 w-4" />
                নতুন ফলাফল যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ফলাফল প্রবেশ করুন</DialogTitle>
                <DialogDescription>ছাত্রের পরীক্ষার ফলাফল দিন।</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">পরীক্ষা</Label>
                  <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                    <SelectTrigger className="col-span-3" data-testid="select-result-exam">
                      <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={String(exam.id)}>
                          {exam.name} - {exam.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ছাত্র</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="col-span-3" data-testid="select-result-student">
                      <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.nameBn} - {student.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">প্রাপ্ত নম্বর</Label>
                  <Input type="number" className="col-span-3" placeholder="নম্বর লিখুন" value={marks} onChange={(e) => setMarks(e.target.value)} data-testid="input-result-marks" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-result">
                  {createMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ছাত্রের নাম</TableHead>
                <TableHead>পরীক্ষা</TableHead>
                <TableHead>বিভাগ</TableHead>
                <TableHead>প্রাপ্ত নম্বর</TableHead>
                <TableHead>গ্রেড</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    কোনো ফলাফল পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                    <TableCell className="font-medium">{result.studentName}</TableCell>
                    <TableCell>{result.examName || "-"}</TableCell>
                    <TableCell>{result.department}</TableCell>
                    <TableCell>{result.marks}</TableCell>
                    <TableCell>
                      <Badge className={gradeColor(result.grade)}>
                        {result.grade || "-"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
