import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Admissions() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nameBn: "",
    nameEn: "",
    dob: "",
    gender: "",
    fatherName: "",
    motherName: "",
    department: "",
    session: "2025",
    address: "",
    phone: "",
  });

  const admissionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setFormData({
        nameBn: "",
        nameEn: "",
        dob: "",
        gender: "",
        fatherName: "",
        motherName: "",
        department: "",
        session: "2025",
        address: "",
        phone: "",
      });
      toast({
        title: "ভর্তি সম্পন্ন হয়েছে",
        description: "নতুন ছাত্র সফলভাবে ভর্তি করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ভর্তি প্রক্রিয়ায় সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.nameBn || !formData.department) {
      toast({
        title: "ত্রুটি",
        description: "নাম এবং বিভাগ আবশ্যক।",
        variant: "destructive",
      });
      return;
    }
    admissionMutation.mutate({
      studentId: `ST-${Date.now()}`,
      nameBn: formData.nameBn,
      nameEn: formData.nameEn || null,
      dob: formData.dob || null,
      gender: formData.gender || null,
      fatherName: formData.fatherName || null,
      motherName: formData.motherName || null,
      department: formData.department,
      session: formData.session || null,
      address: formData.address || null,
      phone: formData.phone || null,
      status: "active",
      feeStatus: "due",
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6" data-testid="admissions-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-admissions-title">নতুন ছাত্র ভর্তি</h1>
          <p className="text-muted-foreground mt-2">নতুন ছাত্র ভর্তির জন্য ফরমটি পূরণ করুন।</p>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
            <CardDescription>ছাত্রের মৌলিক তথ্যাবলী</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">নাম (বাংলায়)</Label>
                <Input id="firstName" placeholder="ছাত্রের নাম" value={formData.nameBn} onChange={e => setFormData(p => ({ ...p, nameBn: e.target.value }))} data-testid="input-student-name-bn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">নাম (ইংরেজিতে)</Label>
                <Input id="lastName" placeholder="Student Name" value={formData.nameEn} onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))} data-testid="input-student-name-en" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">জন্ম তারিখ</Label>
                <Input id="dob" type="date" value={formData.dob} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} data-testid="input-student-dob" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">লিঙ্গ</Label>
                <Select value={formData.gender} onValueChange={v => setFormData(p => ({ ...p, gender: v }))}>
                  <SelectTrigger data-testid="select-student-gender">
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">পুরুষ</SelectItem>
                    <SelectItem value="female">মহিলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">পিতার নাম</Label>
              <Input id="fatherName" placeholder="পিতার নাম" value={formData.fatherName} onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value }))} data-testid="input-father-name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motherName">মাতার নাম</Label>
              <Input id="motherName" placeholder="মাতার নাম" value={formData.motherName} onChange={e => setFormData(p => ({ ...p, motherName: e.target.value }))} data-testid="input-mother-name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input id="phone" placeholder="মোবাইল নম্বর" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} data-testid="input-student-phone" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>একাডেমিক তথ্য</CardTitle>
            <CardDescription>ভর্তি সংক্রান্ত তথ্যাবলী</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class">বিভাগ/শ্রেণী</Label>
                <Select value={formData.department} onValueChange={v => setFormData(p => ({ ...p, department: v }))}>
                  <SelectTrigger data-testid="select-student-department">
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="হেফজ বিভাগ">হেফজ বিভাগ</SelectItem>
                    <SelectItem value="কিতাব বিভাগ">কিতাব বিভাগ</SelectItem>
                    <SelectItem value="নাজেরা বিভাগ">নাজেরা বিভাগ</SelectItem>
                    <SelectItem value="নূরানী বিভাগ">নূরানী বিভাগ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">সেশন/শিক্ষাবর্ষ</Label>
                <Select value={formData.session} onValueChange={v => setFormData(p => ({ ...p, session: v }))}>
                  <SelectTrigger data-testid="select-student-session">
                    <SelectValue placeholder="শিক্ষাবর্ষ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">২০২৪</SelectItem>
                    <SelectItem value="2025">২০২৫</SelectItem>
                    <SelectItem value="2026">২০২৬</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">বর্তমান ঠিকানা</Label>
              <Textarea id="address" placeholder="বিস্তারিত ঠিকানা..." value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} data-testid="input-student-address" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" data-testid="button-cancel-admission">বাতিল করুন</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={admissionMutation.isPending} data-testid="button-submit-admission">ভর্তি সম্পন্ন করুন</Button>
        </div>
      </div>
    </Layout>
  );
}
