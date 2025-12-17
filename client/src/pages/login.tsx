import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lock, Mail, Phone, ArrowRight } from "lucide-react";
import logoImage from "@assets/generated_images/islamic_geometric_pattern_background.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${logoImage})`, backgroundSize: 'cover' }} />
      
      <div className="w-full max-w-md p-4 z-10">
        <div className="flex flex-col items-center mb-8 space-y-2 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
             <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">মাদ্রাসা ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <Card className="border-none shadow-xl bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>স্বাগতম</CardTitle>
            <CardDescription>অ্যাডমিন বা শিক্ষক হিসেবে প্রবেশ করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">ইমেইল</TabsTrigger>
                <TabsTrigger value="phone">মোবাইল</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল অ্যাড্রেস</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="name@example.com" className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" className="pl-9" required />
                    </div>
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">মোবাইল নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="017XXXXXXXX" className="pl-9" required />
                    </div>
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "OTP পাঠান..." : "OTP পাঠান"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              পাসওয়ার্ড ভুলে গেছেন?
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
