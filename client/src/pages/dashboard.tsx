import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "জানুয়ারি", total: 12000 },
  { name: "ফেব্রুয়ারি", total: 15000 },
  { name: "মার্চ", total: 18000 },
  { name: "এপ্রিল", total: 14000 },
  { name: "মে", total: 21000 },
  { name: "জুন", total: 19000 },
];

const stats = [
  {
    title: "মোট ছাত্র/ছাত্রী",
    value: "১,২৪৫",
    description: "+১২% গত মাস থেকে",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "মোট শিক্ষক",
    value: "৪৫",
    description: "৩ জন নতুন যোগ দিয়েছেন",
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    title: "মাসিক আয়",
    value: "৳ ২,৪৫,০০০",
    description: "+৮% গত মাস থেকে",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "বকেয়া ফি",
    value: "৳ ৪৫,০০০",
    description: "১৫ জন ছাত্রের বকেয়া",
    icon: TrendingUp,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground mt-2">মাদ্রাসা ম্যানেজমেন্ট সিস্টেমে স্বাগতম। আজকের সারসংক্ষেপ।</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle>মাসিক আয়-ব্যয় চিত্র</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `৳${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar
                      dataKey="total"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-none shadow-sm">
            <CardHeader>
              <CardTitle>নোটিশ বোর্ড</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "বার্ষিক পরীক্ষার রুটিন প্রকাশ", date: "১৭ ডিসেম্বর, ২০২৫", type: "জরুরী" },
                  { title: "ঈদ-উল-ফিতর এর ছুটি", date: "১৫ ডিসেম্বর, ২০২৫", type: "ছুটি" },
                  { title: "অভিভাবক সমাবেশ", date: "১০ ডিসেম্বর, ২০২৫", type: "সাধারণ" },
                  { title: "নতুন ভর্তি বিজ্ঞপ্তি", date: "৫ ডিসেম্বর, ২০২৫", type: "ভর্তি" },
                ].map((notice, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{notice.title}</p>
                      <div className="flex items-center gap-2">
                         <p className="text-xs text-muted-foreground">{notice.date}</p>
                         <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground font-medium">{notice.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
