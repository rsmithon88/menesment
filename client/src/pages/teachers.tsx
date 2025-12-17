import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Mail, Phone, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const teachers = [
  { id: 1, name: "মাওলানা আব্দুল করিম", subject: "কুরআন ও হাদিস", phone: "01711-xxxxxx", email: "karim@madrasa.com" },
  { id: 2, name: "হাফেজ মোঃ ইসমাইল", subject: "হিফজুল কুরআন", phone: "01811-xxxxxx", email: "ismail@madrasa.com" },
  { id: 3, name: "মুফতি আব্দুর রহিম", subject: "ফিকহ ও উসুল", phone: "01911-xxxxxx", email: "rahim@madrasa.com" },
  { id: 4, name: "জনাব রফিকুল ইসলাম", subject: "বাংলা ও ইংরেজি", phone: "01611-xxxxxx", email: "rafiq@madrasa.com" },
  { id: 5, name: "ক্বারী মোঃ ইউনুস", subject: "তেলাওয়াত", phone: "01511-xxxxxx", email: "yunus@madrasa.com" },
  { id: 6, name: "মাওলানা জুবায়ের", subject: "আরবি সাহিত্য", phone: "01311-xxxxxx", email: "zubair@madrasa.com" },
];

export default function Teachers() {
  const handleDelete = (name: string) => {
    toast({
      title: "শিক্ষক মুছে ফেলা হয়েছে",
      description: `${name} এর প্রোফাইল ডিলিট করা হয়েছে।`,
      variant: "destructive"
    });
  };

  const handleAdd = () => {
     toast({
      title: "সফল",
      description: "নতুন শিক্ষক সফলভাবে যোগ করা হয়েছে।",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">শিক্ষক ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">আমাদের সম্মানিত শিক্ষক মণ্ডলী এবং তাদের তথ্য।</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                নতুন শিক্ষক যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>নতুন শিক্ষক যোগ করুন</DialogTitle>
                <DialogDescription>
                  শিক্ষকের প্রয়োজনীয় তথ্য দিয়ে ফরমটি পূরণ করুন।
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">নাম</Label>
                  <Input id="name" placeholder="শিক্ষকের নাম" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">বিষয়</Label>
                  <Input id="subject" placeholder="কোন বিষয়ে পড়ান" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">ফোন</Label>
                  <Input id="phone" placeholder="মোবাইল নম্বর" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">ইমেইল</Label>
                  <Input id="email" placeholder="ইমেইল অ্যাড্রেস" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>সংরক্ষণ করুন</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="শিক্ষক খুঁজুন..." className="pl-9" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(teacher.name)}>
                        <Trash2 className="mr-2 h-4 w-4" /> ডিলিট
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                  <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-base">{teacher.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{teacher.email}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">প্রোফাইল দেখুন</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
