import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Bell, CheckCircle2, Clock } from "lucide-react";

const notifications = [
  { id: 1, type: "SMS", title: "বেতন পেমেন্ট কনফার্মেশন", recipient: "আব্দুর রহমান (অভিভাবক)", message: "আপনার সন্তানের ডিসেম্বর মাসের বেতন ৳১৫০০ গ্রহণ করা হয়েছে। ধন্যবাদ।", time: "১০ মিনিট আগে", status: "sent" },
  { id: 2, type: "System", title: "নতুন ভর্তি", recipient: "অ্যাডমিন", message: "নতুন ছাত্র 'হাসান' হেফজ বিভাগে ভর্তি হয়েছে।", time: "১ ঘণ্টা আগে", status: "unread" },
  { id: 3, type: "SMS", title: "শিক্ষক বেতন", recipient: "মাওলানা আব্দুল করিম", message: "আপনার নভেম্বর মাসের বেতন ব্যাংক অ্যাকাউন্টে জমা হয়েছে।", time: "২ ঘণ্টা আগে", status: "sent" },
  { id: 4, type: "SMS", title: "বকেয়া নোটিশ", recipient: "কামাল হোসেন (অভিভাবক)", message: "আপনার সন্তানের গত মাসের বেতন বকেয়া আছে। অনুগ্রহ করে পরিশোধ করুন।", time: "গতকাল", status: "failed" },
  { id: 5, type: "System", title: "সিস্টেম আপডেট", recipient: "সকল ব্যবহারকারী", message: "সফটওয়্যার রক্ষণাবেক্ষণের কাজ সম্পন্ন হয়েছে।", time: "গতকাল", status: "read" },
];

export default function Notifications() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">নোটিফিকেশন ও SMS</h1>
          <p className="text-muted-foreground mt-2">সকল পাঠানো বার্তা এবং সিস্টেম নোটিফিকেশন।</p>
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
                    <div key={notification.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${notification.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.recipient}</p>
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
                    <div key={notification.id} className="flex gap-4 p-4 rounded-lg bg-card border shadow-sm">
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
                  
                  {/* Mock items to fill space */}
                  <div className="flex gap-4 p-4 rounded-lg bg-muted/20 border border-transparent">
                    <div className="mt-1 h-2 w-2 rounded-full bg-gray-300" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-muted-foreground">ব্যাকআপ সম্পন্ন</p>
                        <span className="text-xs text-muted-foreground">২ দিন আগে</span>
                      </div>
                      <p className="text-sm text-muted-foreground">সাপ্তাহিক ডাটাবেস ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে।</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
