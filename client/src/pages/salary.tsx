import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, Send, CheckCircle2, Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const salaries = [
  { id: "SAL-001", teacher: "মাওলানা আব্দুল করিম", month: "নভেম্বর ২০২৫", amount: "১২,০০০", status: "Paid", date: "৩০/১১/২০২৫" },
  { id: "SAL-002", teacher: "হাফেজ মোঃ ইসমাইল", month: "নভেম্বর ২০২৫", amount: "১০,০০০", status: "Paid", date: "৩০/১১/২০২৫" },
  { id: "SAL-003", teacher: "মুফতি আব্দুর রহিম", month: "নভেম্বর ২০২৫", amount: "১৫,০০০", status: "Pending", date: "-" },
  { id: "SAL-004", teacher: "জনাব রফিকুল ইসলাম", month: "নভেম্বর ২০২৫", amount: "৮,০০০", status: "Pending", date: "-" },
];

export default function Salary() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePayment = () => {
    setIsOpen(false);
    toast({
      title: "বেতন পরিশোধ সফল হয়েছে",
      description: "শিক্ষকের মোবাইলে SMS পাঠানো হয়েছে।",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">বেতন ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">শিক্ষকদের বেতন ও ভাতার হিসাব।</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">মাওলানা আব্দুল করিম</SelectItem>
                      <SelectItem value="t2">মুফতি আব্দুর রহিম</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">মাস</Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="মাস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dec">ডিসেম্বর ২০২৫</SelectItem>
                      <SelectItem value="jan">জানুয়ারি ২০২৬</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">পরিমাণ</Label>
                  <Input className="col-span-3" placeholder="৳" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handlePayment}>পরিশোধ ও SMS পাঠান</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">মোট পরিশোধিত (চলতি মাস)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">৳ ২২,০০০</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">মোট বকেয়া (চলতি মাস)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">৳ ২৩,০০০</div>
                </CardContent>
            </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="শিক্ষক খুঁজুন..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল</SelectItem>
                  <SelectItem value="paid">পরিশোধিত</SelectItem>
                  <SelectItem value="pending">বকেয়া</SelectItem>
                </SelectContent>
              </Select>
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
                <TableRow key={salary.id}>
                  <TableCell className="font-medium">{salary.id}</TableCell>
                  <TableCell>{salary.teacher}</TableCell>
                  <TableCell>{salary.month}</TableCell>
                  <TableCell>৳{salary.amount}</TableCell>
                  <TableCell>{salary.date}</TableCell>
                  <TableCell>
                    <Badge variant={salary.status === "Paid" ? "default" : "outline"} className={salary.status === "Paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "text-amber-600 border-amber-200"}>
                      {salary.status === "Paid" ? "পরিশোধিত" : "প্রক্রিয়াধীন"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {salary.status === "Paid" && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                            Sent
                        </div>
                    )}
                    {salary.status === "Pending" && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
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
