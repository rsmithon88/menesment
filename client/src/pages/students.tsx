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
import { MoreHorizontal, Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const students = [
  { id: "ST-001", name: "আব্দুর রহমান", class: "হেফজ বিভাগ", roll: "০১", status: "Active", fees: "Paid" },
  { id: "ST-002", name: "মোহাম্মদ ইউসুফ", class: "কিতাব বিভাগ", roll: "১২", status: "Active", fees: "Due" },
  { id: "ST-003", name: "ইব্রাহিম খলিল", class: "নাজেরা বিভাগ", roll: "০৫", status: "Inactive", fees: "Paid" },
  { id: "ST-004", name: "হাসান মাহমুদ", class: "হেফজ বিভাগ", roll: "০৩", status: "Active", fees: "Paid" },
  { id: "ST-005", name: "ওমর ফারুক", class: "কিতাব বিভাগ", roll: "০৮", status: "Active", fees: "Due" },
];

export default function Students() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ছাত্র/ছাত্রী তালিকা</h1>
            <p className="text-muted-foreground mt-2">সকল ছাত্র/ছাত্রীদের তথ্য ও অবস্থা।</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            নতুন ছাত্র যোগ করুন
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            ফিল্টার
          </Button>
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
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.roll}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"} className={student.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}>
                      {student.status === "Active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={student.fees === "Paid" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}>
                      {student.fees === "Paid" ? "পরিশোধিত" : "বকেয়া"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                        <DropdownMenuItem>বিস্তারিত দেখুন</DropdownMenuItem>
                        <DropdownMenuItem>সম্পাদনা করুন</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">ডিলিট করুন</DropdownMenuItem>
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
