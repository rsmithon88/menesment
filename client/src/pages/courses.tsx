import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";

export default function Courses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [teacher, setTeacher] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("");

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; department: string; teacher: string; description: string; schedule: string }) => {
      await apiRequest("POST", "/api/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setOpen(false);
      setName("");
      setDepartment("");
      setTeacher("");
      setDescription("");
      setSchedule("");
      toast({ title: "কোর্স যোগ করা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "কোর্স মুছে ফেলা হয়েছে", variant: "destructive" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) return;
    createMutation.mutate({ name, department, teacher, description, schedule });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-courses">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">কোর্স ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">সকল কোর্সের তথ্য দেখুন ও নতুন কোর্স যোগ করুন।</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-course">
                <Plus className="h-4 w-4" />
                নতুন কোর্স যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন কোর্স</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>কোর্সের নাম *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="কোর্সের নাম লিখুন" data-testid="input-course-name" />
                </div>
                <div className="space-y-2">
                  <Label>বিভাগ *</Label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="বিভাগ লিখুন" data-testid="input-course-department" />
                </div>
                <div className="space-y-2">
                  <Label>শিক্ষক</Label>
                  <Input value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="শিক্ষকের নাম" data-testid="input-course-teacher" />
                </div>
                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="কোর্সের বিবরণ" data-testid="input-course-description" />
                </div>
                <div className="space-y-2">
                  <Label>সময়সূচী</Label>
                  <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="সময়সূচী লিখুন" data-testid="input-course-schedule" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-course">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  কোর্স যোগ করুন
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-5 w-5" />
          <span data-testid="text-course-count">মোট কোর্স: {courses.length}</span>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কোর্সের নাম</TableHead>
                <TableHead>বিভাগ</TableHead>
                <TableHead>শিক্ষক</TableHead>
                <TableHead>সময়সূচী</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8" data-testid="text-no-courses">
                    কোনো কোর্স পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{course.teacher || "—"}</TableCell>
                    <TableCell>{course.schedule || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(course.id)}
                        data-testid={`button-delete-course-${course.id}`}
                      >
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
