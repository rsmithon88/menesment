import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter, Plus, Send } from "lucide-react";
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
import type { Fee, Student } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Fees() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [feeType, setFeeType] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");

  const { data: fees = [], isLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/fees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsOpen(false);
      setSelectedStudent("");
      setFeeType("");
      setAmount("");
      setMonth("");
      toast({
        title: "ফি গ্রহণ সফল হয়েছে",
        description: "ফি সফলভাবে রেকর্ড করা হয়েছে।",
      });
    },
  });

  const handleCollectFee = () => {
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student || !feeType || !amount) return;
    addMutation.mutate({
      invoiceId: `INV-${Date.now()}`,
      studentId: student.id,
      studentName: student.nameBn,
      type: feeType,
      month: month || "চলতি মাস",
      amount: parseInt(amount),
      status: "paid",
      date: new Date().toLocaleDateString("bn-BD"),
    });
  };

  const totalPaid = fees.filter(f => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
  const totalDue = fees.filter(f => f.status === "due").reduce((sum, f) => sum + f.amount, 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6" data-testid="fees-loading">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="fees-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-fees-title">ফি ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">ফি আদায় এবং লেনদেনের হিসাব।</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" data-testid="button-download-report">
              <Download className="h-4 w-4" />
              রিপোর্ট
            </Button>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-fee">
                  <Plus className="h-4 w-4" />
                  নতুন ফি গ্রহণ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ফি গ্রহণ করুন</DialogTitle>
                  <DialogDescription>
                    ছাত্রের ফি গ্রহণের তথ্য দিন।
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ছাত্র</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="col-span-3" data-testid="select-fee-student">
                        <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.nameBn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ফি-এর ধরন</Label>
                    <Select value={feeType} onValueChange={setFeeType}>
                      <SelectTrigger className="col-span-3" data-testid="select-fee-type">
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="মাসিক বেতন">মাসিক বেতন</SelectItem>
                        <SelectItem value="পরীক্ষার ফি">পরীক্ষার ফি</SelectItem>
                        <SelectItem value="বোর্ডিং ফি">বোর্ডিং ফি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">মাস</Label>
                    <Input className="col-span-3" placeholder="যেমন: ডিসেম্বর ২০২৫" value={month} onChange={e => setMonth(e.target.value)} data-testid="input-fee-month" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">পরিমাণ</Label>
                    <Input className="col-span-3" placeholder="৳" type="number" value={amount} onChange={e => setAmount(e.target.value)} data-testid="input-fee-amount" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCollectFee} className="gap-2" disabled={addMutation.isPending} data-testid="button-submit-fee">
                    <Send className="h-4 w-4" />
                    গ্রহণ করুন
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-primary text-primary-foreground border-none" data-testid="card-total-paid">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">মোট আদায়</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-paid">৳ {totalPaid.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">মোট রেকর্ড</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-records">{fees.length}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">মোট বকেয়া</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive" data-testid="text-total-due">৳ {totalDue.toLocaleString()}</div>
                </CardContent>
            </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">সাম্প্রতিক লেনদেন</h3>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-filter-fees">
                <Filter className="h-4 w-4" />
                ফিল্টার
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ইনভয়েস</TableHead>
                <TableHead>ছাত্রের নাম</TableHead>
                <TableHead>বিবরণ</TableHead>
                <TableHead>মাস</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id} data-testid={`row-fee-${fee.id}`}>
                  <TableCell className="font-medium">{fee.invoiceId}</TableCell>
                  <TableCell>{fee.studentName}</TableCell>
                  <TableCell>{fee.type}</TableCell>
                  <TableCell>{fee.month}</TableCell>
                  <TableCell>৳{fee.amount.toLocaleString()}</TableCell>
                  <TableCell>{fee.date || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={fee.status === "paid" ? "default" : "destructive"} className={fee.status === "paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"} data-testid={`badge-fee-status-${fee.id}`}>
                      {fee.status === "paid" ? "পরিশোধিত" : "বকেয়া"}
                    </Badge>
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
