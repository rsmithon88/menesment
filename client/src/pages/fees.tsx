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

const fees = [
  { id: "INV-001", student: "আব্দুর রহমান", type: "মাসিক বেতন", month: "ডিসেম্বর ২০২৫", amount: "১৫০০", status: "Paid", date: "১০/১২/২০২৫" },
  { id: "INV-002", student: "মোহাম্মদ ইউসুফ", type: "পরীক্ষার ফি", month: "ডিসেম্বর ২০২৫", amount: "৫০০", status: "Due", date: "-" },
  { id: "INV-003", student: "ইব্রাহিম খলিল", type: "মাসিক বেতন", month: "ডিসেম্বর ২০২৫", amount: "১৫০০", status: "Paid", date: "১২/১২/২০২৫" },
  { id: "INV-004", student: "হাসান মাহমুদ", type: "বোর্ডিং ফি", month: "ডিসেম্বর ২০২৫", amount: "২০০০", status: "Paid", date: "০৫/১২/২০২৫" },
  { id: "INV-005", student: "ওমর ফারুক", type: "মাসিক বেতন", month: "নভেম্বর ২০২৫", amount: "১৫০০", status: "Due", date: "-" },
];

export default function Fees() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCollectFee = () => {
    setIsOpen(false);
    toast({
      title: "ফি গ্রহণ সফল হয়েছে",
      description: "অভিভাবকের কাছে স্বয়ংক্রিয় SMS পাঠানো হয়েছে।",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ফি ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">ফি আদায় এবং লেনদেনের হিসাব।</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              রিপোর্ট
            </Button>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  নতুন ফি গ্রহণ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ফি গ্রহণ করুন</DialogTitle>
                  <DialogDescription>
                    ছাত্রের ফি গ্রহণের তথ্য দিন। অটোমেটিক SMS পাঠানো হবে।
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ছাত্র</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s1">আব্দুর রহমান</SelectItem>
                        <SelectItem value="s2">মোহাম্মদ ইউসুফ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ফি-এর ধরন</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">মাসিক বেতন</SelectItem>
                        <SelectItem value="exam">পরীক্ষার ফি</SelectItem>
                        <SelectItem value="boarding">বোর্ডিং ফি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">পরিমাণ</Label>
                    <Input className="col-span-3" placeholder="৳" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCollectFee} className="gap-2">
                    <Send className="h-4 w-4" />
                    গ্রহণ ও SMS পাঠান
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-primary text-primary-foreground border-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">আজকের আদায়</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳ ১২,৫০০</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">চলতি মাসে আদায়</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳ ২,৪৫,০০০</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">মোট বকেয়া</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">৳ ৪৫,০০০</div>
                </CardContent>
            </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">সাম্প্রতিক লেনদেন</h3>
            <Button variant="ghost" size="sm" className="gap-2">
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
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.id}</TableCell>
                  <TableCell>{fee.student}</TableCell>
                  <TableCell>{fee.type}</TableCell>
                  <TableCell>{fee.month}</TableCell>
                  <TableCell>৳{fee.amount}</TableCell>
                  <TableCell>{fee.date}</TableCell>
                  <TableCell>
                    <Badge variant={fee.status === "Paid" ? "default" : "destructive"} className={fee.status === "Paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                      {fee.status === "Paid" ? "পরিশোধিত" : "বকেয়া"}
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
