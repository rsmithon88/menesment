import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen, Calendar, ClipboardList } from "lucide-react";
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
import type { Exam } from "@shared/schema";

export default function Exams() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/exams", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setIsOpen(false);
      setName("");
      setDepartment("");
      setDate("");
      setTotalMarks("100");
      setDescription("");
      toast({ title: "পরীক্ষা যোগ হয়েছে", description: "নতুন পরীক্ষা সফলভাবে তৈরি করা হয়েছে।" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "পরীক্ষা তৈরি করতে সমস্যা হয়েছে।", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({ title: "পরীক্ষা মুছে ফেলা হয়েছে", description: "পরীক্ষা সফলভাবে ডিলিট করা হয়েছে।", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!name || !department || !date) {
      toast({ title: "ত্রুটি", description: "সকল প্রয়োজনীয় তথ্য দিন।", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      name,
      department,
      date,
      totalMarks: parseInt(totalMarks) || 100,
      description: description || null,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-exams">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">পরীক্ষা ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">পরীক্ষার সময়সূচী এবং তথ্য পরিচালনা।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-exam">
                <Plus className="h-4 w-4" />
                নতুন পরীক্ষা যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন পরীক্ষা তৈরি করুন</DialogTitle>
                <DialogDescription>পরীক্ষার বিস্তারিত তথ্য দিন।</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">পরীক্ষার নাম</Label>
                  <Input className="col-span-3" placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৫" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-exam-name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">বিভাগ</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="col-span-3" data-testid="select-exam-department">
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="হেফজ বিভাগ">হেফজ বিভাগ</SelectItem>
                      <SelectItem value="কিতাব বিভাগ">কিতাব বিভাগ</SelectItem>
                      <SelectItem value="নাজেরা বিভাগ">নাজেরা বিভাগ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">তারিখ</Label>
                  <Input type="date" className="col-span-3" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-exam-date" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">মোট নম্বর</Label>
                  <Input type="number" className="col-span-3" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} data-testid="input-exam-marks" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">বিবরণ</Label>
                  <Input className="col-span-3" placeholder="ঐচ্ছিক" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-exam-description" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-exam">
                  {createMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> মোট পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-exams">{exams.length}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> আসন্ন পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-upcoming-exams">
                {exams.filter((e) => new Date(e.date) >= new Date()).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> সম্পন্ন পরীক্ষা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-exams">
                {exams.filter((e) => new Date(e.date) < new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পরীক্ষার নাম</TableHead>
                <TableHead>বিভাগ</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>মোট নম্বর</TableHead>
                <TableHead>বিবরণ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    কোনো পরীক্ষা পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id} data-testid={`row-exam-${exam.id}`}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.department}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>{exam.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteMutation.mutate(exam.id)} data-testid={`button-delete-exam-${exam.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
