import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Page, LoggedInUser } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';
import { printContent } from './utils';

interface VouchersProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  hasPermission: (page: Page) => boolean;
  madrasahName: string;
  madrasahAddress: string;
  currentUser: LoggedInUser;
}

const Vouchers: React.FC<VouchersProps> = ({ expenses, addExpense, updateExpense, deleteExpense, hasPermission, madrasahName, madrasahAddress, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [newExpense, setNewExpense] = useState({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
  
  const [selectedMonth, setSelectedMonth] = useState('');

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      if (expense.date) {
        months.add(expense.date.substring(0, 7));
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [expenses]);
  
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.category || !newExpense.amount || !newExpense.date) return;
    addExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
    });
    setNewExpense({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(false);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!expenseToEdit) return;
    const { name, value } = e.target;
    setExpenseToEdit({ ...expenseToEdit, [name]: value });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseToEdit) return;
    updateExpense({
      ...expenseToEdit,
      amount: parseFloat(String(expenseToEdit.amount)),
    });
    setIsEditModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleDelete = () => {
    if (!expenseToDelete) return;
    deleteExpense(expenseToDelete.id);
    setExpenseToDelete(null);
  };

  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) {
      return expenses;
    }
    return expenses.filter(expense => expense.date && expense.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);
  
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);
  
  const handlePrint = () => {
    const reportMonth = selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('bn-BD', { month: 'long', year: 'numeric' }) : 'সকল সময়';
    printContent('vouchers-print-area', `মাসিক খরচের রিপোর্ট - ${reportMonth}`);
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">ব্যয় ব্যবস্থাপনা (ভাউচার)</h2>
        <div className="flex items-center space-x-2">
            {isAdmin && (
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap" disabled={filteredExpenses.length === 0}>
                    প্রিন্ট রিপোর্ট
                </button>
            )}
            {hasPermission('ব্যয় ব্যবস্থাপনা') && (
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                নতুন খরচ যোগ করুন
                </button>
            )}
        </div>
      </div>
      
      {isAdmin ? (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 no-print">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700">মাস অনুযায়ী দেখুন</label>
                    <select
                    id="filterMonth"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1 w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                    <option value="">সকল মাস</option>
                    {availableMonths.map(month => (
                        <option key={month} value={month}>
                        {new Date(month + '-02').toLocaleString('bn-BD', { month: 'long', year: 'numeric' })}
                        </option>
                    ))}
                    </select>
                </div>
                </div>
            </div>

            <div id="vouchers-print-area">
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-3xl font-bold">{madrasahName}</h1>
                    <p>{madrasahAddress}</p>
                    <h2 className="text-xl font-semibold mt-4 underline">মাসিক খরচের রিপোর্ট</h2>
                    <p className="text-lg font-medium">
                        {selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('bn-BD', { month: 'long', year: 'numeric' }) : 'সকল সময়'}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <div className="p-4 border-b no-print">
                        <h3 className="text-lg font-semibold">
                            {selectedMonth ? `${new Date(selectedMonth + '-02').toLocaleString('bn-BD', { month: 'long', year: 'numeric' })} মাসের মোট খরচ:` : 'সর্বমোট খরচ:'}
                            <span className="text-primary ml-2">৳{totalAmount.toLocaleString('bn-BD')}</span>
                        </h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">খরচের বিভাগ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">খরচের বিবরণ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">পরিমাণ (৳)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
                        {hasPermission('ব্যয় ব্যবস্থাপনা') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider no-print">কার্যক্রম</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExpenses.map(expense => (
                        <tr key={expense.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.date).toLocaleDateString('bn-BD')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-mono">{expense.amount.toLocaleString('bn-BD')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.lastModifiedBy || expense.addedBy || '-'}</td>
                            {hasPermission('ব্যয় ব্যবস্থাপনা') && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                                    <div className="flex items-center justify-end space-x-4">
                                        <button onClick={() => { setExpenseToEdit(expense); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => setExpenseToDelete(expense)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={hasPermission('ব্যয় ব্যবস্থাপনা') ? 5 : 4} className="px-6 py-3 text-right text-sm">সর্বমোট খরচ:</td>
                            <td className="px-6 py-3 text-right text-sm font-mono">৳{totalAmount.toLocaleString('bn-BD')}</td>
                            {hasPermission('ব্যয় ব্যবস্থাপনা') && <td className="no-print"></td>}
                        </tr>
                    </tfoot>
                    </table>
                </div>
            </div>
        </>
      ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-blue-700">
                        আপনি এখান থেকে নতুন খরচ যোগ করতে পারবেন। খরচের তালিকা শুধুমাত্র অ্যাডমিন দেখতে পারেন।
                    </p>
                </div>
            </div>
          </div>
      )}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">নতুন খরচ যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <input type="text" name="category" value={newExpense.category} onChange={handleInputChange} placeholder="খরচের বিভাগ (যেমন, আপ্যায়ন)" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="text" name="title" value={newExpense.title} onChange={handleInputChange} placeholder="খরচের বিবরণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="number" name="amount" value={newExpense.amount} onChange={handleInputChange} placeholder="পরিমাণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
               <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">সংরক্ষণ করুন</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && expenseToEdit && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">খরচ সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
               <input type="text" name="category" value={expenseToEdit.category} onChange={handleEditInputChange} placeholder="খরচের বিভাগ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="text" name="title" value={expenseToEdit.title} onChange={handleEditInputChange} placeholder="খরচের বিবরণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="number" name="amount" value={expenseToEdit.amount} onChange={handleEditInputChange} placeholder="পরিমাণ" className="w-full px-4 py-2 border rounded-lg" required />
               <input type="date" name="date" value={expenseToEdit.date} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required />
               <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">আপডেট করুন</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {expenseToDelete && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি এই খরচের রেকর্ডটি মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setExpenseToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;