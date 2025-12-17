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
import { Separator } from "@/components/ui/separator";

export default function Admissions() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">নতুন ছাত্র ভর্তি</h1>
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
                <Input id="firstName" placeholder="ছাত্রের নাম" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">নাম (ইংরেজিতে)</Label>
                <Input id="lastName" placeholder="Student Name" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">জন্ম তারিখ</Label>
                <Input id="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">লিঙ্গ</Label>
                <Select>
                  <SelectTrigger>
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
              <Input id="fatherName" placeholder="পিতার নাম" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motherName">মাতার নাম</Label>
              <Input id="motherName" placeholder="মাতার নাম" />
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hefz">হেফজ বিভাগ</SelectItem>
                    <SelectItem value="kitab">কিতাব বিভাগ</SelectItem>
                    <SelectItem value="nazera">নাজেরা বিভাগ</SelectItem>
                    <SelectItem value="nurani">নূরানী বিভাগ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">সেশন/শিক্ষাবর্ষ</Label>
                <Select defaultValue="2025">
                  <SelectTrigger>
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
              <Textarea id="address" placeholder="বিস্তারিত ঠিকানা..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">বাতিল করুন</Button>
          <Button className="bg-primary hover:bg-primary/90">ভর্তি সম্পন্ন করুন</Button>
        </div>
      </div>
    </Layout>
  );
}
