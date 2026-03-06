import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock, Filter } from "lucide-react";
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
import type { Routine } from "@shared/schema";

const days = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"];
const departments = ["হিফজ", "নাযেরা", "কিতাব", "জেনারেল"];

export default function RoutinePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [department, setDepartment] = useState("");
  const queryClient = useQueryClient();

  const { data: routines = [], isLoading } = useQuery<Routine[]>({
    queryKey: ["/api/routines"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { day: string; time: string; subject: string; teacher: string; department: string }) => {
      await apiRequest("POST", "/api/routines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      setIsOpen(false);
      setDay("");
      setTime("");
      setSubject("");
      setTeacher("");
      setDepartment("");
      toast({ title: "রুটিন যোগ করা হয়েছে", description: "নতুন ক্লাস রুটিনে যোগ করা হয়েছে।" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/routines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "রুটিন মুছে ফেলা হয়েছে" });
    },
  });

  const handleAdd = () => {
    if (!day || !time || !subject || !department) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" });
      return;
    }
    addMutation.mutate({ day, time, subject, teacher, department });
  };

  const filtered = filterDept === "all" ? routines : routines.filter((r) => r.department === filterDept);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-routine">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-routine-title">ক্লাস রুটিন</h1>
            <p className="text-muted-foreground mt-2">বিভাগ অনুযায়ী ক্লাসের সময়সূচি।</p>
          </div>
          <div className="flex gap-2">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[150px]" data-testid="select-filter-department">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="বিভাগ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব বিভাগ</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-routine">
                  <Plus className="h-4 w-4" />
                  নতুন রুটিন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন ক্লাস যোগ করুন</DialogTitle>
                  <DialogDescription>ক্লাস রুটিনে নতুন এন্ট্রি যোগ করুন।</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">বিভাগ</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="col-span-3" data-testid="select-routine-department">
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">দিন</Label>
                    <Select value={day} onValueChange={setDay}>
                      <SelectTrigger className="col-span-3" data-testid="select-routine-day">
                        <SelectValue placeholder="দিন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">সময়</Label>
                    <Input className="col-span-3" placeholder="যেমন: ৮:০০ - ৯:০০" value={time} onChange={(e) => setTime(e.target.value)} data-testid="input-routine-time" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">বিষয়</Label>
                    <Input className="col-span-3" placeholder="বিষয়ের নাম" value={subject} onChange={(e) => setSubject(e.target.value)} data-testid="input-routine-subject" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">শিক্ষক</Label>
                    <Input className="col-span-3" placeholder="শিক্ষকের নাম" value={teacher} onChange={(e) => setTeacher(e.target.value)} data-testid="input-routine-teacher" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={addMutation.isPending} data-testid="button-submit-routine">
                    {addMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">মোট ক্লাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-routines">{routines.length}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">বিভাগ সংখ্যা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-departments">{new Set(routines.map((r) => r.department)).size}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">শিক্ষক সংখ্যা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-routine-teachers">{new Set(routines.map((r) => r.teacher).filter(Boolean)).size}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              সময়সূচি
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>বিভাগ</TableHead>
                <TableHead>দিন</TableHead>
                <TableHead>সময়</TableHead>
                <TableHead>বিষয়</TableHead>
                <TableHead>শিক্ষক</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    কোনো রুটিন পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((routine) => (
                  <TableRow key={routine.id} data-testid={`row-routine-${routine.id}`}>
                    <TableCell className="font-medium">{routine.department}</TableCell>
                    <TableCell>{routine.day}</TableCell>
                    <TableCell>{routine.time}</TableCell>
                    <TableCell>{routine.subject}</TableCell>
                    <TableCell>{routine.teacher || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(routine.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-routine-${routine.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
