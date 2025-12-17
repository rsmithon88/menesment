import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Mail, Phone } from "lucide-react";

const teachers = [
  { name: "মাওলানা আব্দুল করিম", subject: "কুরআন ও হাদিস", phone: "01711-xxxxxx", email: "karim@madrasa.com" },
  { name: "হাফেজ মোঃ ইসমাইল", subject: "হিফজুল কুরআন", phone: "01811-xxxxxx", email: "ismail@madrasa.com" },
  { name: "মুফতি আব্দুর রহিম", subject: "ফিকহ ও উসুল", phone: "01911-xxxxxx", email: "rahim@madrasa.com" },
  { name: "জনাব রফিকুল ইসলাম", subject: "বাংলা ও ইংরেজি", phone: "01611-xxxxxx", email: "rafiq@madrasa.com" },
  { name: "ক্বারী মোঃ ইউনুস", subject: "তেলাওয়াত", phone: "01511-xxxxxx", email: "yunus@madrasa.com" },
  { name: "মাওলানা জুবায়ের", subject: "আরবি সাহিত্য", phone: "01311-xxxxxx", email: "zubair@madrasa.com" },
];

export default function Teachers() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">শিক্ষকবৃন্দ</h1>
            <p className="text-muted-foreground mt-2">আমাদের সম্মানিত শিক্ষক মণ্ডলী।</p>
          </div>
          <Button>নতুন শিক্ষক যোগ করুন</Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="শিক্ষক খুঁজুন..." className="pl-9" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
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
