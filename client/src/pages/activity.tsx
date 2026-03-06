import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, User } from "lucide-react";
import type { ActivityLog } from "@shared/schema";

export default function ActivityPage() {
  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity"],
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 data-testid="text-page-title" className="text-3xl font-bold tracking-tight">কার্যকলাপ লগ</h1>
          <p className="text-muted-foreground mt-2">সিস্টেমের সকল কার্যক্রমের রেকর্ড।</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">মোট কার্যকলাপ</p>
                <h3 data-testid="text-total-activities" className="text-xl font-bold">{activities.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              কোনো কার্যকলাপ রেকর্ড পাওয়া যায়নি।
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border bg-card shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold">সাম্প্রতিক কার্যকলাপ</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কার্যক্রম</TableHead>
                  <TableHead>বিবরণ</TableHead>
                  <TableHead>ব্যবহারকারী</TableHead>
                  <TableHead>সময়</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-activity-details-${activity.id}`} className="text-muted-foreground">
                      {activity.details || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {activity.user}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {activity.timestamp}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
