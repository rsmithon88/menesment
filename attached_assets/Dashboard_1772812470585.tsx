import React from 'react';
import { Student, Teacher, Fee, Expense, TeacherSalary } from '../types';
import { UsersIcon, AcademicCapIcon, CurrencyDollarIcon, CashIcon } from '../constants';
import { PieChart, BarChart } from './Charts';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  fees: Fee[];
  expenses: Expense[];
  teacherSalaries: TeacherSalary[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-start justify-between">
    <div>
      <p className="text-sm text-text-secondary font-medium">{title}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    </div>
    <div className={`p-2 rounded-md ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

const SummaryCard: React.FC<{ title: string; amount: string; type: 'income' | 'expense' }> = ({ title, amount, type }) => {
    const isIncome = type === 'income';
    const categoryText = isIncome ? 'আয়' : 'ব্যয়';
    const categoryClasses = isIncome
        ? "text-green-600 bg-green-100"
        : "text-red-600 bg-red-100";
        
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <CashIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="font-semibold text-text-primary truncate" title={title}>{title}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryClasses}`}>{categoryText}</span>
            </div>
            <p className="text-xl font-bold text-text-primary mt-3">{amount}</p>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ students, teachers, fees, expenses, teacherSalaries }) => {
  const formatCurrency = (amount: number) => `৳${new Intl.NumberFormat('bn-BD').format(amount)}`;
  
  // Calculations
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const inactiveStudents = students.filter(s => s.status === 'inactive').length;

  const totalCollection = fees.filter(fee => fee.status === 'পরিশোধিত').reduce((sum, fee) => sum + fee.amount, 0);
  const totalSalaryPaid = teacherSalaries.filter(s => s.status === 'পরিশোধিত').reduce((sum, salary) => sum + salary.amount, 0);
  const totalOtherExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = totalSalaryPaid + totalOtherExpenses;
  const currentBalance = totalCollection - totalExpenses;

  // Income funds (from paid fees)
  const incomeFunds = fees
    .filter(fee => fee.status === 'পরিশোধিত')
    .reduce((acc: Record<string, number>, fee) => {
        const category = (fee.category || 'বিভাগবিহীন').trim();
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += fee.amount;
        return acc;
    }, {} as Record<string, number>);

  // Expense categories
  const expenseCategories = expenses.reduce((acc: Record<string, number>, expense) => {
    const category = (expense.category || 'বিভাগবিহীন').trim();
    if (!acc[category]) {
        acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);


  // Chart Data
  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;
  const genderData = [
    { label: 'ছাত্র', value: maleCount, color: '#3b82f6' },
    { label: 'ছাত্রী', value: femaleCount, color: '#f59e0b' },
  ];

  const activeStudents = totalStudents - inactiveStudents;
  const studentStatusData = [
    { label: 'সক্রিয়', value: activeStudents, color: '#10b981' },
    { label: 'নিষ্ক্রিয়', value: inactiveStudents, color: '#ef4444' },
  ];
  
  const monthlyCollection = fees
    .filter(fee => fee.status === 'পরিশোধিত')
    .reduce((acc: Record<string, number>, fee) => {
    const month = new Date(fee.dueDate).toLocaleString('bn-BD', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += fee.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // FIX: Changed Object.entries to Object.keys for better type inference
  const monthlyCollectionData = Object.keys(monthlyCollection)
                                    .map((label) => ({ label, value: monthlyCollection[label] }))
                                    .slice(-6); // Last 6 months

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">প্রধান পরিসংখ্যান</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <StatCard title="মোট শিক্ষার্থী" value={totalStudents.toLocaleString('bn-BD')} icon={UsersIcon} color="bg-blue-500" />
          <StatCard title="সর্বমোট সংগ্রহ" value={formatCurrency(totalCollection)} icon={CurrencyDollarIcon} color="bg-green-500" />
          <StatCard title="সর্বমোট খরচ" value={formatCurrency(totalExpenses)} icon={CurrencyDollarIcon} color="bg-red-500" />
          <StatCard title="বর্তমান ব্যালেন্স" value={formatCurrency(currentBalance)} icon={CurrencyDollarIcon} color="bg-indigo-500" />
          <StatCard title="মোট শিক্ষক" value={totalTeachers.toLocaleString('bn-BD')} icon={AcademicCapIcon} color="bg-purple-500" />
          <StatCard title="নিষ্ক্রিয় শিক্ষার্থী" value={inactiveStudents.toLocaleString('bn-BD')} icon={UsersIcon} color="bg-yellow-500" />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-text-primary">আয়ের উৎস</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {Object.keys(incomeFunds).map((category) => (
                <SummaryCard key={category} title={category} amount={formatCurrency(incomeFunds[category])} type="income" />
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-primary">ব্যয়ের খাত</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {totalSalaryPaid > 0 && (
                <SummaryCard title="শিক্ষকদের বেতন" amount={formatCurrency(totalSalaryPaid)} type="expense" />
            )}
            {Object.keys(expenseCategories).map((category) => (
                <SummaryCard key={category} title={category} amount={formatCurrency(expenseCategories[category])} type="expense" />
            ))}
        </div>
      </div>


      <div>
        <h2 className="text-xl font-semibold text-text-primary mt-6">ড্যাশবোর্ড বিশ্লেষণ</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-center font-semibold text-text-primary mb-2">লিঙ্গ অনুপাত</h3>
            <PieChart data={genderData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-center font-semibold text-text-primary mb-2">সক্রিয় বনাম নিষ্ক্রিয় শিক্ষার্থী</h3>
            <PieChart data={studentStatusData} isDonut={true} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow lg:col-span-3">
             <h3 className="text-center font-semibold text-text-primary mb-4">মাসভিত্তিক সংগ্রহ (পরিশোধিত)</h3>
             <BarChart data={monthlyCollectionData} color="#3b82f6" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;