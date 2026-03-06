import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Events() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("general");
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setType("general");
      toast({ title: "ইভেন্ট যোগ করা হয়েছে" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "ইভেন্ট মুছে ফেলা হয়েছে" });
    },
  });

  const handleCreate = () => {
    if (!title || !date) {
      toast({ title: "শিরোনাম ও তারিখ আবশ্যক", variant: "destructive" });
      return;
    }
    createMutation.mutate({ title, description, date, time, type });
  };

  const typeLabels: Record<string, string> = {
    general: "সাধারণ",
    academic: "শিক্ষা",
    cultural: "সাংস্কৃতিক",
    religious: "ধর্মীয়",
    sports: "ক্রীড়া",
  };

  const typeColors: Record<string, string> = {
    general: "bg-blue-100 text-blue-700",
    academic: "bg-green-100 text-green-700",
    cultural: "bg-purple-100 text-purple-700",
    religious: "bg-amber-100 text-amber-700",
    sports: "bg-red-100 text-red-700",
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 data-testid="text-page-title" className="text-3xl font-bold tracking-tight">ইভেন্ট ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">মাদরাসার সকল অনুষ্ঠান ও কার্যক্রম।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-event" className="gap-2">
                <Plus className="h-4 w-4" />
                নতুন ইভেন্ট
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন ইভেন্ট যোগ করুন</DialogTitle>
                <DialogDescription>ইভেন্টের তথ্য প্রদান করুন।</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">শিরোনাম</Label>
                  <Input data-testid="input-event-title" className="col-span-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ইভেন্টের শিরোনাম" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">বিবরণ</Label>
                  <Textarea data-testid="input-event-description" className="col-span-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="বিবরণ লিখুন" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">তারিখ</Label>
                  <Input data-testid="input-event-date" className="col-span-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">সময়</Label>
                  <Input data-testid="input-event-time" className="col-span-3" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ধরন</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger data-testid="select-event-type" className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">সাধারণ</SelectItem>
                      <SelectItem value="academic">শিক্ষা</SelectItem>
                      <SelectItem value="cultural">সাংস্কৃতিক</SelectItem>
                      <SelectItem value="religious">ধর্মীয়</SelectItem>
                      <SelectItem value="sports">ক্রীড়া</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button data-testid="button-submit-event" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              কোনো ইভেন্ট পাওয়া যায়নি। নতুন ইভেন্ট যোগ করুন।
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} data-testid={`card-event-${event.id}`} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={typeColors[event.type] || typeColors.general}>
                      {typeLabels[event.type] || event.type}
                    </Badge>
                    <Button
                      data-testid={`button-delete-event-${event.id}`}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 data-testid={`text-event-title-${event.id}`} className="font-semibold text-lg mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.date}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {event.time}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
