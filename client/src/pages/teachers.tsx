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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Teacher } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Teachers() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", subject: "", phone: "", email: "" });

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string; phone: string; email: string }) => {
      await apiRequest("POST", "/api/teachers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      setIsOpen(false);
      setFormData({ name: "", subject: "", phone: "", email: "" });
      toast({
        title: "সফল",
        description: "নতুন শিক্ষক সফলভাবে যোগ করা হয়েছে।",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "শিক্ষক মুছে ফেলা হয়েছে",
        description: "শিক্ষকের প্রোফাইল ডিলিট করা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6" data-testid="teachers-loading">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="teachers-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-teachers-title">শিক্ষক ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">আমাদের সম্মানিত শিক্ষক মণ্ডলী এবং তাদের তথ্য।</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-teacher">
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
                  <Input id="name" placeholder="শিক্ষকের নাম" className="col-span-3" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} data-testid="input-teacher-name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">বিষয়</Label>
                  <Input id="subject" placeholder="কোন বিষয়ে পড়ান" className="col-span-3" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} data-testid="input-teacher-subject" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">ফোন</Label>
                  <Input id="phone" placeholder="মোবাইল নম্বর" className="col-span-3" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} data-testid="input-teacher-phone" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">ইমেইল</Label>
                  <Input id="email" placeholder="ইমেইল অ্যাড্রেস" className="col-span-3" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} data-testid="input-teacher-email" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => addMutation.mutate(formData)} disabled={addMutation.isPending} data-testid="button-save-teacher">সংরক্ষণ করুন</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="শিক্ষক খুঁজুন..." className="pl-9" data-testid="input-search-teacher" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, i) => (
            <Card key={teacher.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow relative group" data-testid={`card-teacher-${teacher.id}`}>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-teacher-menu-${teacher.id}`}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(teacher.id)} data-testid={`button-delete-teacher-${teacher.id}`}>
                        <Trash2 className="mr-2 h-4 w-4" /> ডিলিট
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`} />
                  <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-base" data-testid={`text-teacher-name-${teacher.id}`}>{teacher.name}</CardTitle>
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
                <Button variant="outline" size="sm" className="w-full mt-4" data-testid={`button-view-teacher-${teacher.id}`}>প্রোফাইল দেখুন</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
