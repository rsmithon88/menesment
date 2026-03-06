import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Bell, CheckCircle2, Plus, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Notifications() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "SMS", title: "", recipient: "", message: "" });

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsOpen(false);
      setFormData({ type: "SMS", title: "", recipient: "", message: "" });
      toast({
        title: "নোটিফিকেশন পাঠানো হয়েছে",
        description: "সফলভাবে নোটিফিকেশন তৈরি করা হয়েছে।",
      });
    },
  });

  const handleSend = () => {
    if (!formData.title || !formData.recipient || !formData.message) return;
    addMutation.mutate({
      ...formData,
      time: "এইমাত্র",
      status: "sent",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6" data-testid="notifications-loading">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="notifications-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-notifications-title">নোটিফিকেশন ও SMS</h1>
            <p className="text-muted-foreground mt-2">সকল পাঠানো বার্তা এবং সিস্টেম নোটিফিকেশন।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-notification">
                <Plus className="h-4 w-4" />
                নতুন নোটিফিকেশন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন নোটিফিকেশন পাঠান</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ধরন</Label>
                  <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="col-span-3" data-testid="select-notification-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="System">সিস্টেম</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">শিরোনাম</Label>
                  <Input className="col-span-3" placeholder="শিরোনাম" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} data-testid="input-notification-title" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">প্রাপক</Label>
                  <Input className="col-span-3" placeholder="প্রাপকের নাম" value={formData.recipient} onChange={e => setFormData(p => ({ ...p, recipient: e.target.value }))} data-testid="input-notification-recipient" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">বার্তা</Label>
                  <Textarea className="col-span-3" placeholder="বার্তা লিখুন..." value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} data-testid="input-notification-message" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSend} disabled={addMutation.isPending} className="gap-2" data-testid="button-send-notification">
                  <Send className="h-4 w-4" />
                  পাঠান
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="h-[600px] flex flex-col border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                SMS লগ
              </CardTitle>
              <CardDescription>প্রেরিত SMS এর তালিকা</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[500px] px-6">
                <div className="space-y-4 pb-6">
                  {notifications.filter(n => n.type === "SMS").map((notification) => (
                    <div key={notification.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors" data-testid={`card-sms-${notification.id}`}>
                      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${notification.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm" data-testid={`text-sms-recipient-${notification.id}`}>{notification.recipient}</p>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 pt-1">
                          {notification.status === 'sent' && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-[10px] h-5 px-1.5 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Sent
                            </Badge>
                          )}
                          {notification.status === 'failed' && (
                            <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] h-5 px-1.5">
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="h-[600px] flex flex-col border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                সিস্টেম নোটিফিকেশন
              </CardTitle>
              <CardDescription>অভ্যন্তরীণ নোটিফিকেশন সমূহ</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[500px] px-6">
                <div className="space-y-4 pb-6">
                  {notifications.filter(n => n.type === "System").map((notification) => (
                    <div key={notification.id} className="flex gap-4 p-4 rounded-lg bg-card border shadow-sm" data-testid={`card-system-notification-${notification.id}`}>
                      <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
