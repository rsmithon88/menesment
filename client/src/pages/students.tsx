import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Student } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Students() {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "ছাত্র মুছে ফেলা হয়েছে",
        description: "সফলভাবে ডিলিট করা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6" data-testid="students-loading">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="students-page">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-students-title">ছাত্র/ছাত্রী ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">সকল ছাত্র/ছাত্রীদের তথ্য, এডিট এবং ডিলিট অপশন।</p>
          </div>
          <Button className="gap-2" data-testid="button-add-student">
            <Plus className="h-4 w-4" />
            নতুন ছাত্র যোগ করুন
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
              className="pl-9"
              data-testid="input-search-student"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Select defaultValue="all">
                <SelectTrigger className="w-[180px]" data-testid="select-department-filter">
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  <SelectItem value="hefz">হেফজ বিভাগ</SelectItem>
                  <SelectItem value="kitab">কিতাব বিভাগ</SelectItem>
                  <SelectItem value="nazera">নাজেরা বিভাগ</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>আইডি</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>শ্রেণী/বিভাগ</TableHead>
                <TableHead>রোল</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>বেতন</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                  <TableCell className="font-medium" data-testid={`text-studentid-${student.id}`}>{student.studentId}</TableCell>
                  <TableCell data-testid={`text-studentname-${student.id}`}>{student.nameBn}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.roll}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "active" ? "default" : "secondary"} className={student.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} data-testid={`badge-status-${student.id}`}>
                      {student.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={student.feeStatus === "paid" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"} data-testid={`badge-fee-${student.id}`}>
                      {student.feeStatus === "paid" ? "পরিশোধিত" : "বকেয়া"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${student.id}`}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> সম্পাদনা করুন
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(student.id)} data-testid={`button-delete-${student.id}`}>
                            <Trash2 className="mr-2 h-4 w-4" /> ডিলিট করুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
