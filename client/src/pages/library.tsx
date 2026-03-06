import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LibraryBook } from "@shared/schema";

const categories = ["কুরআন", "হাদিস", "ফিকহ", "আরবি সাহিত্য", "বাংলা", "ইংরেজি", "গণিত", "বিজ্ঞান", "ইতিহাস", "অন্যান্য"];

export default function LibraryPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("1");
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery<LibraryBook[]>({
    queryKey: ["/api/library"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { title: string; author: string; category: string; isbn: string; quantity: number; available: number }) => {
      await apiRequest("POST", "/api/library", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      setIsOpen(false);
      setTitle("");
      setAuthor("");
      setCategory("");
      setIsbn("");
      setQuantity("1");
      toast({ title: "বই যোগ করা হয়েছে", description: "লাইব্রেরিতে নতুন বই যোগ হয়েছে।" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({ title: "বই মুছে ফেলা হয়েছে" });
    },
  });

  const handleAdd = () => {
    if (!title || !category) {
      toast({ title: "বইয়ের নাম ও ক্যাটাগরি দিন", variant: "destructive" });
      return;
    }
    const qty = parseInt(quantity) || 1;
    addMutation.mutate({ title, author, category, isbn, quantity: qty, available: qty });
  };

  const totalBooks = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalAvailable = books.reduce((sum, b) => sum + (b.available || 0), 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-library">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-library-title">লাইব্রেরি</h1>
            <p className="text-muted-foreground mt-2">বই ব্যবস্থাপনা ও তথ্য।</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-book">
                <Plus className="h-4 w-4" />
                নতুন বই যোগ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন বই যোগ করুন</DialogTitle>
                <DialogDescription>লাইব্রেরিতে নতুন বইয়ের তথ্য দিন।</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">বইয়ের নাম</Label>
                  <Input className="col-span-3" placeholder="বইয়ের নাম লিখুন" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-book-title" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">লেখক</Label>
                  <Input className="col-span-3" placeholder="লেখকের নাম" value={author} onChange={(e) => setAuthor(e.target.value)} data-testid="input-book-author" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ক্যাটাগরি</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="col-span-3" data-testid="select-book-category">
                      <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ISBN</Label>
                  <Input className="col-span-3" placeholder="ISBN নম্বর" value={isbn} onChange={(e) => setIsbn(e.target.value)} data-testid="input-book-isbn" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">সংখ্যা</Label>
                  <Input className="col-span-3" type="number" min="1" placeholder="১" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="input-book-quantity" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={addMutation.isPending} data-testid="button-submit-book">
                  {addMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">মোট বই</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-books">{totalBooks}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">বই প্রকার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-book-types">{books.length}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">উপলব্ধ বই</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600" data-testid="text-available-books">{totalAvailable}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              বইয়ের তালিকা
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>বইয়ের নাম</TableHead>
                <TableHead>লেখক</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>সংখ্যা</TableHead>
                <TableHead>উপলব্ধ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    কোনো বই পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.category || "-"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{book.isbn || "-"}</TableCell>
                    <TableCell>{book.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={book.available && book.available > 0 ? "default" : "destructive"} className={book.available && book.available > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}>
                        {book.available}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(book.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-book-${book.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
