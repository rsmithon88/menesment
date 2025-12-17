import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Save } from "lucide-react";

export default function Settings() {
  const { madrasaName, setMadrasaName } = useSettings();
  const [name, setName] = useState(madrasaName);

  const handleSave = () => {
    setMadrasaName(name);
    toast({
      title: "সেটিংস আপডেট করা হয়েছে",
      description: "মাদ্রাসার নাম সফলভাবে পরিবর্তন করা হয়েছে।",
    });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">সেটিংস</h1>
          <p className="text-muted-foreground mt-2">সিস্টেম কনফিগারেশন এবং সাধারণ সেটিংস।</p>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>সাধারণ সেটিংস</CardTitle>
            <CardDescription>আপনার প্রতিষ্ঠানের মৌলিক তথ্য আপডেট করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="madrasaName">প্রতিষ্ঠানের নাম</Label>
              <Input 
                id="madrasaName" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="মাদ্রাসার নাম লিখুন"
              />
              <p className="text-xs text-muted-foreground">এই নামটি ড্যাশবোর্ড এবং সাইডবারে প্রদর্শিত হবে।</p>
            </div>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
