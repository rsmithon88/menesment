import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, Wallet, UserX, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const genderData = [
  { name: 'ছাত্র', value: 400 },
  { name: 'ছাত্রী', value: 300 },
];

const activeData = [
  { name: 'সক্রিয়', value: 650 },
  { name: 'নিষ্ক্রিয়', value: 50 },
];

const COLORS_GENDER = ['#3b82f6', '#f59e0b'];
const COLORS_ACTIVE = ['#10b981', '#ef4444'];

const stats = [
  {
    title: "মোট শিক্ষার্থী",
    value: "৯১",
    icon: Users,
    bg: "bg-blue-500",
  },
  {
    title: "সর্বমোট সংগ্রহ",
    value: "৮০",
    icon: DollarSign,
    bg: "bg-emerald-500",
  },
  {
    title: "সর্বমোট খরচ",
    value: "৮২৩,১৫৫",
    icon: DollarSign,
    bg: "bg-red-500",
  },
  {
    title: "বর্তমান ব্যালেন্স",
    value: "৮-২৩,১৫৫",
    icon: Wallet,
    bg: "bg-indigo-500",
  },
  {
    title: "মোট শিক্ষক",
    value: "৮",
    icon: GraduationCap,
    bg: "bg-purple-500",
  },
  {
    title: "নিষ্ক্রিয় শিক্ষার্থী",
    value: "০",
    icon: UserX,
    bg: "bg-yellow-500",
  },
];

const expenses = [
  { name: "শিক্ষকদের বেতন", amount: "৮১৪,০০০", icon: Wallet },
  { name: "বিদ্যুৎ বিল", amount: "৮৪,৭৩৫", icon: Wallet },
  { name: "কাঁচা বাজার", amount: "৮২,৭০০", icon: Wallet },
  { name: "কলিং বেল, ব্যাটারি", amount: "৮২৯০", icon: Wallet },
  { name: "বোর্ডিং", amount: "-", icon: Wallet },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6 pb-20 relative">
        <div>
          <h1 className="text-xl font-medium text-foreground">প্রধান পরিসংখ্যান</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-xl font-bold">{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bg} text-white`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expense Section */}
        <div className="mt-8">
          <h1 className="text-xl font-medium text-foreground mb-4">আয়ের উৎস</h1>
          {/* Income source placeholder if needed, matching screenshot layout */}
          
          <h1 className="text-xl font-medium text-foreground mb-4 mt-8">ব্যয়ের খাত</h1>
          <div className="grid grid-cols-2 gap-4">
            {expenses.map((expense, index) => (
              <Card key={index} className="border-none shadow-sm relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                     <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <expense.icon className="h-4 w-4" />
                     </div>
                     <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full">ব্যয়</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{expense.name}</p>
                  <h3 className="text-lg font-bold">{expense.amount}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Section */}
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

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="icon" className="h-14 w-14 rounded-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
