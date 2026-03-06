import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LeaveApplication } from "@shared/schema";

const applicantTypes = [
  { value: "teacher", label: "শিক্ষক" },
  { value: "student", label: "ছাত্র" },
  { value: "staff", label: "কর্মচারী" },
];

export default function LeavePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantType, setApplicantType] = useState("");
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const queryClient = useQueryClient();

  const { data: leaves = [], isLoading } = useQuery<LeaveApplication[]>({
    queryKey: ["/api/leave"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { applicantName: string; applicantType: string; reason: string; fromDate: string; toDate: string }) => {
      await apiRequest("POST", "/api/leave", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave"] });
      setIsOpen(false);
      setApplicantName("");
      setApplicantType("");
      setReason("");
      setFromDate("");
      setToDate("");
      toast({ title: "আবেদন জমা হয়েছে", description: "ছুটির আবেদন সফলভাবে জমা হয়েছে।" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/leave/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave"] });
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
    },
  });

  const handleAdd = () => {
    if (!applicantName || !applicantType || !reason || !fromDate || !toDate) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" });
      return;
    }
    addMutation.mutate({ applicantName, applicantType, reason, fromDate, toDate });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">অনুমোদিত</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">প্রত্যাখ্যাত</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">অপেক্ষমান</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const found = applicantTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const pending = leaves.filter((l) => l.status === "pending").length;
  const approved = leaves.filter((l) => l.status === "approved").length;
  const rejected = leaves.filter((l) => l.status === "rejected").length;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-leave">
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
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-leave-title">ছুটির আবেদন</h1>
            <p className="text-muted-foreground mt-2">ছুটির আবেদন জমা ও অনুমোদন।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-leave">
                <Plus className="h-4 w-4" />
                নতুন আবেদন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ছুটির আবেদন</DialogTitle>
                <DialogDescription>ছুটির আবেদনের তথ্য দিন।</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">আবেদনকারী</Label>
                  <Input className="col-span-3" placeholder="নাম লিখুন" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} data-testid="input-leave-name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ধরন</Label>
                  <Select value={applicantType} onValueChange={setApplicantType}>
                    <SelectTrigger className="col-span-3" data-testid="select-leave-type">
                      <SelectValue placeholder="ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {applicantTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">কারণ</Label>
                  <Textarea className="col-span-3" placeholder="ছুটির কারণ লিখুন" value={reason} onChange={(e) => setReason(e.target.value)} data-testid="input-leave-reason" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">শুরু তারিখ</Label>
                  <Input className="col-span-3" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} data-testid="input-leave-from" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">শেষ তারিখ</Label>
                  <Input className="col-span-3" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} data-testid="input-leave-to" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={addMutation.isPending} data-testid="button-submit-leave">
                  {addMutation.isPending ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">অপেক্ষমান</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-leaves">{pending}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">অনুমোদিত</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600" data-testid="text-approved-leaves">{approved}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">প্রত্যাখ্যাত</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-rejected-leaves">{rejected}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold">আবেদনসমূহ</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>আবেদনকারী</TableHead>
                <TableHead>ধরন</TableHead>
                <TableHead>কারণ</TableHead>
                <TableHead>শুরু তারিখ</TableHead>
                <TableHead>শেষ তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    কোনো আবেদন পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id} data-testid={`row-leave-${leave.id}`}>
                    <TableCell className="font-medium">{leave.applicantName}</TableCell>
                    <TableCell>{getTypeLabel(leave.applicantType)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell>{leave.fromDate}</TableCell>
                    <TableCell>{leave.toDate}</TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-right">
                      {leave.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: leave.id, status: "approved" })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-approve-leave-${leave.id}`}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: leave.id, status: "rejected" })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-reject-leave-${leave.id}`}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
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
