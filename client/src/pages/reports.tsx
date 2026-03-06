import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, GraduationCap, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Fee, Expense, Salary } from "@shared/schema";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: feesData = [], isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: expensesData = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: salariesData = [], isLoading: salariesLoading } = useQuery<Salary[]>({
    queryKey: ["/api/salaries"],
  });

  const isLoading = statsLoading || feesLoading || expensesLoading || salariesLoading;

  const totalFeeCollected = feesData.filter(f => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
  const totalFeeDue = feesData.filter(f => f.status === "due").reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expensesData.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = salariesData.filter(s => s.status === "paid").reduce((sum, s) => sum + s.amount, 0);
  const totalIncome = totalFeeCollected;
  const totalOutflow = totalExpenses + totalSalaries;
  const balance = totalIncome - totalOutflow;

  const incomeExpenseData = [
    { name: "আয় (ফি)", value: totalIncome },
    { name: "ব্যয়", value: totalExpenses },
    { name: "বেতন", value: totalSalaries },
  ];

  const feeStatusData = [
    { name: "পরিশোধিত", value: totalFeeCollected },
    { name: "বকেয়া", value: totalFeeDue },
  ];

  const expenseByCategory: Record<string, number> = {};
  expensesData.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });
  const expenseCategoryData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 data-testid="text-page-title" className="text-3xl font-bold tracking-tight">রিপোর্ট ও বিশ্লেষণ</h1>
          <p className="text-muted-foreground mt-2">আর্থিক ও প্রশাসনিক সামগ্রিক প্রতিবেদন।</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card data-testid="card-total-students" className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    মোট শিক্ষার্থী
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-students" className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total-teachers" className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    মোট শিক্ষক
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-teachers" className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total-income" className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    মোট আয়
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-income" className="text-2xl font-bold text-green-600">৳ {totalIncome.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-balance" className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    ব্যালেন্স
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-balance" className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ৳ {balance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 data-testid="text-chart-income-expense" className="text-center font-medium mb-4">আয় বনাম ব্যয়</h3>
                  <div className="h-[300px] w-full">
                    {incomeExpenseData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeExpenseData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#3b82f6">
                            {incomeExpenseData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">তথ্য পাওয়া যায়নি</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 data-testid="text-chart-fee-status" className="text-center font-medium mb-4">ফি আদায় পরিস্থিতি</h3>
                  <div className="h-[300px] w-full">
                    {feeStatusData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">তথ্য পাওয়া যায়নি</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm md:col-span-2">
                <CardContent className="p-6">
                  <h3 data-testid="text-chart-expense-category" className="text-center font-medium mb-4">ক্যাটেগরি অনুযায়ী ব্যয়</h3>
                  <div className="h-[300px] w-full">
                    {expenseCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expenseCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8b5cf6">
                            {expenseCategoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">ব্যয়ের তথ্য পাওয়া যায়নি</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    মোট ব্যয়
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-expenses" className="text-2xl font-bold text-red-600">৳ {totalExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    মোট বেতন প্রদান
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-salaries" className="text-2xl font-bold">৳ {totalSalaries.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    মোট ফি বকেয়া
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="text-total-due" className="text-2xl font-bold text-amber-600">৳ {totalFeeDue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
