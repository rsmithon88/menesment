import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2, Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Salary as SalaryType, Teacher } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Salary() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  const { data: salaries = [], isLoading } = useQuery<SalaryType[]>({
    queryKey: ["/api/salaries"],
  });

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/salaries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsOpen(false);
      setSelectedTeacher("");
      setMonth("");
      setAmount("");
      toast({
        title: "বেতন পরিশোধ সফল হয়েছে",
        description: "বেতন সফলভাবে রেকর্ড করা হয়েছে।",
      });
    },
  });

  const handlePayment = () => {
    const teacher = teachers.find(t => t.id.toString() === selectedTeacher);
    if (!teacher || !month || !amount) return;
    addMutation.mutate({
      salaryId: `SAL-${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      month,
      amount: parseInt(amount),
      status: "paid",
      date: new Date().toLocaleDateString("bn-BD"),
    });
  };

  const totalPaid = salaries.filter(s => s.status === "paid").reduce((sum, s) => sum + s.amount, 0);
  const totalPending = salaries.filter(s => s.status === "pending").reduce((sum, s) => sum + s.amount, 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6" data-testid="salary-loading">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="salary-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-salary-title">বেতন ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">শিক্ষকদের বেতন ও ভাতার হিসাব।</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-salary">
                <Plus className="h-4 w-4" />
                নতুন পেমেন্ট এন্ট্রি
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>বেতন পরিশোধ</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">শিক্ষক</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="col-span-3" data-testid="select-salary-teacher">
                      <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">মাস</Label>
                  <Input className="col-span-3" placeholder="যেমন: ডিসেম্বর ২০২৫" value={month} onChange={e => setMonth(e.target.value)} data-testid="input-salary-month" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">পরিমাণ</Label>
                  <Input className="col-span-3" placeholder="৳" type="number" value={amount} onChange={e => setAmount(e.target.value)} data-testid="input-salary-amount" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handlePayment} disabled={addMutation.isPending} data-testid="button-submit-salary">পরিশোধ করুন</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/20" data-testid="card-salary-paid">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">মোট পরিশোধিত</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-salary-paid">৳ {totalPaid.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20" data-testid="card-salary-pending">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">মোট বকেয়া</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300" data-testid="text-salary-pending">৳ {totalPending.toLocaleString()}</div>
                </CardContent>
            </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="শিক্ষক খুঁজুন..." className="pl-9" data-testid="input-search-salary" />
              </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>আইডি</TableHead>
                <TableHead>শিক্ষকের নাম</TableHead>
                <TableHead>মাস</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>SMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.map((salary) => (
                <TableRow key={salary.id} data-testid={`row-salary-${salary.id}`}>
                  <TableCell className="font-medium">{salary.salaryId}</TableCell>
                  <TableCell>{salary.teacherName}</TableCell>
                  <TableCell>{salary.month}</TableCell>
                  <TableCell>৳{salary.amount.toLocaleString()}</TableCell>
                  <TableCell>{salary.date || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={salary.status === "paid" ? "default" : "outline"} className={salary.status === "paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "text-amber-600 border-amber-200"} data-testid={`badge-salary-status-${salary.id}`}>
                      {salary.status === "paid" ? "পরিশোধিত" : "প্রক্রিয়াধীন"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {salary.status === "paid" && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                            Sent
                        </div>
                    )}
                    {salary.status === "pending" && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" data-testid={`button-notify-${salary.id}`}>
                            <Send className="h-3 w-3" />
                            Notify
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
