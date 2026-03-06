import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const queryClient = useQueryClient();
  const { madrasaName, setMadrasaName } = useSettings();
  const [name, setName] = useState(madrasaName);

  const { data: settingsData, isLoading } = useQuery<{ key: string; value: string }>({
    queryKey: ["/api/settings/madrasaName"],
  });

  useEffect(() => {
    if (settingsData && settingsData.value) {
      setName(settingsData.value);
      setMadrasaName(settingsData.value);
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      await apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/madrasaName"] });
      setMadrasaName(name);
      toast({
        title: "সেটিংস আপডেট করা হয়েছে",
        description: "মাদ্রাসার নাম সফলভাবে পরিবর্তন করা হয়েছে।",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ key: "madrasaName", value: name });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-2xl mx-auto" data-testid="settings-loading">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto" data-testid="settings-page">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-settings-title">সেটিংস</h1>
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
                data-testid="input-madrasa-name"
              />
              <p className="text-xs text-muted-foreground">এই নামটি ড্যাশবোর্ড এবং সাইডবারে প্রদর্শিত হবে।</p>
            </div>

            <Button onClick={handleSave} className="gap-2" disabled={saveMutation.isPending} data-testid="button-save-settings">
              <Save className="h-4 w-4" />
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
