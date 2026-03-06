import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wallet, TrendingDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Expense } from "@shared/schema";

export default function Expenses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const createMutation = useMutation({
    mutationFn: async (data: { category: string; description: string; amount: number; date: string }) => {
      await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setOpen(false);
      setCategory("");
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      toast({ title: "খরচ যোগ করা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "খরচ মুছে ফেলা হয়েছে", variant: "destructive" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !date) return;
    createMutation.mutate({ category, description, amount: Number(amount), date });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64" data-testid="loading-expenses">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">খরচ ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">সকল খরচের হিসাব দেখুন ও নতুন খরচ যোগ করুন।</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-expense">
                <Plus className="h-4 w-4" />
                নতুন খরচ যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন খরচ</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>ক্যাটাগরি *</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="যেমন: বিদ্যুৎ, পানি, মেরামত" data-testid="input-expense-category" />
                </div>
                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="খরচের বিবরণ" data-testid="input-expense-description" />
                </div>
                <div className="space-y-2">
                  <Label>পরিমাণ (৳) *</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="টাকার পরিমাণ" data-testid="input-expense-amount" />
                </div>
                <div className="space-y-2">
                  <Label>তারিখ *</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-expense-date" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-expense">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  খরচ যোগ করুন
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">মোট খরচ</p>
                <p className="text-2xl font-bold" data-testid="text-total-expenses">৳{totalExpenses.toLocaleString("bn-BD")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">মোট এন্ট্রি</p>
                <p className="text-2xl font-bold" data-testid="text-total-entries">{expenses.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>বিবরণ</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8" data-testid="text-no-expenses">
                    কোনো খরচ পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{expense.description || "—"}</TableCell>
                    <TableCell>৳{expense.amount.toLocaleString("bn-BD")}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(expense.id)}
                        data-testid={`button-delete-expense-${expense.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
