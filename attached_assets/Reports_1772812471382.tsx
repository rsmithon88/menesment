import React, { useState, useMemo } from 'react';
import { Student, Attendance, Fee, Expense, TeacherSalary, Teacher } from '../types';
import { BarChart } from './Charts';
import { printContent } from './utils';

interface ReportsProps {
  data: {
    students: Student[];
    teachers: Teacher[];
    attendance: Attendance[];
    fees: Fee[];
    expenses: Expense[];
    teacherSalaries: TeacherSalary[];
  };
  classOptions: string[];
}

const ReportCard: React.FC<{ title: string; children: React.ReactNode; onPrint?: () => void; }> = ({ title, children, onPrint }) => (
    <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            {onPrint && (
                <button
                    onClick={onPrint}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-print"
                >
                    প্রিন্ট
                </button>
            )}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);


const Reports: React.FC<ReportsProps> = ({ data, classOptions }) => {
  const { students, teachers, attendance, fees, expenses, teacherSalaries } = data;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayISO = today.toISOString().split('T')[0];

  const [finStartDate, setFinStartDate] = useState(firstDayOfMonth);
  const [finEndDate, setFinEndDate] = useState(todayISO);
  const [attClass, setAttClass] = useState(classOptions[0] || '');
  const [attStartDate, setAttStartDate] = useState(firstDayOfMonth);
  const [attEndDate, setAttEndDate] = useState(todayISO);

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const financialData = useMemo(() => {
    const start = new Date(finStartDate);
    const end = new Date(finEndDate);
    end.setHours(23, 59, 59, 999); // Include entire end day

    // Detailed Income
    const incomeDetails = fees
      .filter(f => {
          const paymentDate = f.paymentDate ? new Date(f.paymentDate) : null;
          return f.status === 'পরিশোধিত' && paymentDate && paymentDate >= start && paymentDate <= end;
      })
      .map(f => ({
          ...f,
          student: studentMap.get(f.studentId)
      }))
      .sort((a, b) => new Date(a.paymentDate!).getTime() - new Date(b.paymentDate!).getTime());

    // Detailed Expenses
    const generalExpenses = expenses
      .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate >= start && expenseDate <= end;
      })
      .map(e => ({ ...e, type: 'সাধারণ' }));

    const salaryExpenses = teacherSalaries
      .filter(s => {
          const paymentDate = s.paymentDate ? new Date(s.paymentDate) : null;
          return s.status === 'পরিশোধিত' && paymentDate && paymentDate >= start && paymentDate <= end;
      })
      .map(s => ({
          ...s,
          teacherName: teacherMap.get(s.teacherId) || 'অজানা',
          type: 'বেতন'
      }));

    const expenseDetails = [...generalExpenses, ...salaryExpenses]
        .sort((a, b) => new Date(a.date || a.paymentDate!).getTime() - new Date(b.date || b.paymentDate!).getTime());

    // Summary Calculations
    const totalCollection = incomeDetails.reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = generalExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSalary = salaryExpenses.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenditure = totalExpenses + totalSalary;
    const net = totalCollection - totalExpenditure;

    return { incomeDetails, expenseDetails, totalCollection, totalExpenses, totalSalary, totalExpenditure, net };
  }, [fees, expenses, teacherSalaries, students, teachers, finStartDate, finEndDate]);

  const attendanceSummary = useMemo(() => {
      const start = new Date(attStartDate);
      const end = new Date(attEndDate);
      end.setHours(23, 59, 59, 999);
      const relevantStudents = students.filter(s => s.class === attClass);
      const studentIds = new Set(relevantStudents.map(s => s.id));

      const relevantAttendance = attendance.filter(a => {
          const attDate = new Date(a.date);
          return studentIds.has(a.studentId) && attDate >= start && attDate <= end;
      });

      return relevantStudents.map(student => {
          const studentAttendance = relevantAttendance.filter(a => a.studentId === student.id);
          const presentDays = studentAttendance.filter(a => a.status === 'উপস্থিত').length;
          const totalDays = studentAttendance.length;
          const rate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
          return {
              roll: student.rollNumber,
              name: student.name,
              totalDays,
              presentDays,
              absentDays: totalDays - presentDays,
              rate,
          };
      });
  }, [students, attendance, attClass, attStartDate, attEndDate]);


  return (
    <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold text-text-primary">আর্থিক রিপোর্টসমূহ</h3>
                <div className="flex items-center gap-4 no-print">
                    <div>
                        <label className="text-sm font-medium text-gray-700">শুরুর তারিখ: </label>
                        <input type="date" value={finStartDate} onChange={e => setFinStartDate(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">শেষ তারিখ: </label>
                        <input type="date" value={finEndDate} onChange={e => setFinEndDate(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg"/>
                    </div>
                    <button onClick={() => printContent('financial-reports', 'আর্থিক রিপোর্ট')} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">সব প্রিন্ট করুন</button>
                </div>
            </div>
            <div id="financial-reports" className="p-6 space-y-8">
                {/* Financial Summary */}
                <section>
                    <h4 className="font-semibold text-lg mb-2">আয়-ব্যয়ের সারাংশ</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr><td className="px-4 py-2">মোট ফি সংগ্রহ</td><td className="px-4 py-2 text-right font-mono text-green-600">৳{financialData.totalCollection.toLocaleString('bn-BD')}</td></tr>
                                <tr><td className="px-4 py-2">শিক্ষকদের বেতন প্রদান</td><td className="px-4 py-2 text-right font-mono text-red-600">৳{financialData.totalSalary.toLocaleString('bn-BD')}</td></tr>
                                <tr><td className="px-4 py-2">অন্যান্য ব্যয়</td><td className="px-4 py-2 text-right font-mono text-red-600">৳{financialData.totalExpenses.toLocaleString('bn-BD')}</td></tr>
                                <tr className="font-bold bg-gray-50"><td className="px-4 py-2">মোট ব্যয়</td><td className="px-4 py-2 text-right font-mono text-red-700">৳{financialData.totalExpenditure.toLocaleString('bn-BD')}</td></tr>
                                <tr className="font-bold bg-gray-50"><td className="px-4 py-2">নীট লাভ/ক্ষতি</td><td className="px-4 py-2 text-right font-mono text-blue-700">৳{financialData.net.toLocaleString('bn-BD')}</td></tr>
                            </tbody>
                        </table>
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-center">আয় বনাম ব্যয়</h4>
                            <BarChart data={[{ label: 'আয়', value: financialData.totalCollection }, { label: 'ব্যয়', value: financialData.totalExpenditure }]} color="#3b82f6" />
                        </div>
                    </div>
                </section>

                {/* Detailed Income Report */}
                <section>
                    <h4 className="font-semibold text-lg mb-2 pt-4 border-t">বিস্তারিত আয়ের রিপোর্ট</h4>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">তারিখ</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">শিক্ষার্থীর নাম</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">শ্রেণী</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">রশিদ নং</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {financialData.incomeDetails.map(fee => (
                                    <tr key={fee.id}>
                                        <td className="px-3 py-2">{new Date(fee.paymentDate!).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-3 py-2">{fee.student?.name}</td>
                                        <td className="px-3 py-2">{fee.student?.class}</td>
                                        <td className="px-3 py-2">{fee.bookNumber}-{fee.receiptNumber}</td>
                                        <td className="px-3 py-2 text-right font-mono">৳{fee.amount.toLocaleString('bn-BD')}</td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 text-right">মোট আয়:</td>
                                    <td className="px-3 py-2 text-right font-mono">৳{financialData.totalCollection.toLocaleString('bn-BD')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>

                {/* Detailed Expense Report */}
                <section>
                    <h4 className="font-semibold text-lg mb-2 pt-4 border-t">বিস্তারিত ব্যয়ের রিপোর্ট</h4>
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">তারিখ</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">বিবরণ</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">বিভাগ</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {financialData.expenseDetails.map((exp, index) => (
                                    <tr key={index}>
                                        <td className="px-3 py-2">{new Date(exp.date || exp.paymentDate!).toLocaleDateString('bn-BD')}</td>
                                        <td className="px-3 py-2">{exp.type === 'বেতন' ? `${exp.teacherName}-এর বেতন (${exp.month}, ${exp.year})` : exp.title}</td>
                                        <td className="px-3 py-2">{exp.category}</td>
                                        <td className="px-3 py-2 text-right font-mono">৳{exp.amount.toLocaleString('bn-BD')}</td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td colSpan={3} className="px-3 py-2 text-right">মোট ব্যয়:</td>
                                    <td className="px-3 py-2 text-right font-mono">৳{financialData.totalExpenditure.toLocaleString('bn-BD')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            </div>
        </div>

        {/* Attendance Report */}
        <div id="attendance-report-print-area">
             <div className="hidden print:block text-center mb-6">
                <h2 className="text-xl font-bold">হাজিরা রিপোর্ট</h2>
                <p>শ্রেণী: {attClass} | তারিখ: {new Date(attStartDate).toLocaleDateString('bn-BD')} থেকে {new Date(attEndDate).toLocaleDateString('bn-BD')}</p>
            </div>
            <ReportCard title="শিক্ষার্থী হাজিরা রিপোর্ট" onPrint={() => printContent('attendance-report-print-area', 'হাজিরা রিপোর্ট')}>
                <div className="flex flex-col md:flex-row gap-4 mb-6 no-print">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">শ্রেণী</label>
                        <select value={attClass} onChange={e => setAttClass(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">শুরুর তারিখ</label>
                        <input type="date" value={attStartDate} onChange={e => setAttStartDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">শেষ তারিখ</label>
                        <input type="date" value={attEndDate} onChange={e => setAttEndDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">রোল</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">নাম</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">মোট দিন</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">উপস্থিত</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">অনুপস্থিত</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">হার (%)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceSummary.map(s => (
                                <tr key={s.roll}>
                                    <td className="px-4 py-2 whitespace-nowrap">{s.roll}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{s.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center">{s.totalDays}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-green-600">{s.presentDays}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-red-600">{s.absentDays}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{s.rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportCard>
        </div>
    </div>
  );
};

export default Reports;