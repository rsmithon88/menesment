import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, Wallet, UserX, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS_GENDER = ['#3b82f6', '#f59e0b'];
const COLORS_ACTIVE = ['#10b981', '#ef4444'];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    totalTeachers: number;
    totalFees: number;
    totalExpenses: number;
    totalDue: number;
    inactiveStudents: number;
    maleStudents: number;
    femaleStudents: number;
    activeStudents: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const genderData = [
    { name: 'ছাত্র', value: stats?.maleStudents ?? 0 },
    { name: 'ছাত্রী', value: stats?.femaleStudents ?? 0 },
  ];

  const activeData = [
    { name: 'সক্রিয়', value: stats?.activeStudents ?? 0 },
    { name: 'নিষ্ক্রিয়', value: stats?.inactiveStudents ?? 0 },
  ];

  const statCards = [
    {
      title: "মোট শিক্ষার্থী",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      bg: "bg-blue-500",
    },
    {
      title: "সর্বমোট সংগ্রহ",
      value: stats?.totalFees ?? 0,
      icon: DollarSign,
      bg: "bg-emerald-500",
    },
    {
      title: "সর্বমোট খরচ",
      value: stats?.totalExpenses ?? 0,
      icon: DollarSign,
      bg: "bg-red-500",
    },
    {
      title: "বর্তমান ব্যালেন্স",
      value: (stats?.totalFees ?? 0) - (stats?.totalExpenses ?? 0),
      icon: Wallet,
      bg: "bg-indigo-500",
    },
    {
      title: "মোট শিক্ষক",
      value: stats?.totalTeachers ?? 0,
      icon: GraduationCap,
      bg: "bg-purple-500",
    },
    {
      title: "নিষ্ক্রিয় শিক্ষার্থী",
      value: stats?.inactiveStudents ?? 0,
      icon: UserX,
      bg: "bg-yellow-500",
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 pb-20" data-testid="dashboard-loading">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-20 relative" data-testid="dashboard-page">
        <div>
          <h1 className="text-xl font-medium text-foreground" data-testid="text-dashboard-title">প্রধান পরিসংখ্যান</h1>
        </div>

        <div className="grid grid-cols-2 gap-4" data-testid="stats-grid">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-none shadow-sm" data-testid={`card-stat-${index}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-xl font-bold" data-testid={`text-stat-value-${index}`}>{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg} text-white`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h1 className="text-xl font-medium text-foreground mt-8 mb-4">ড্যাশবোর্ড বিশ্লেষণ</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-center font-medium mb-4">লিঙ্গ অনুপাত</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-center font-medium mb-4">সক্রিয় বনাম নিষ্ক্রিয় শিক্ষার্থী</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {activeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_ACTIVE[index % COLORS_ACTIVE.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <Button size="icon" className="h-14 w-14 rounded-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 shadow-lg" data-testid="button-fab">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
