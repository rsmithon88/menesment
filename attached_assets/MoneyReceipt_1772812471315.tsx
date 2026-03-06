import React from 'react';
import { Fee, Student } from '../types';
import { numberToBengaliWords, printContent } from './utils';

interface MoneyReceiptProps {
    feeData: Fee;
    student: Student;
    madrasahName: string;
    madrasahAddress: string;
    collectorName: string;
    onClose: () => void;
}

const MoneyReceipt: React.FC<MoneyReceiptProps> = ({ feeData, student, madrasahName, madrasahAddress, collectorName, onClose }) => {

    const handlePrint = () => {
        const extraCss = `
            @page {
                size: 6in 3in;
                margin: 0mm !important;
            }
            body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }
            .receipt-container {
                width: 6in !important;
                height: 3in !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
            }
        `;
        printContent('receipt-print-area', 'মানি রিসিট', extraCss);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl">
                <div id="receipt-print-area">
                    <div 
                        className="receipt-container relative bg-white p-2 border-2 border-dashed border-gray-400 font-sans flex flex-col"
                         style={{
                             width: '6in',
                             height: '3in',
                             backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23DDD' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                             backgroundSize: 'cover'
                         }}>
                        
                        {/* Header */}
                        <div className="text-center mb-2">
                            <h1 className="text-xl font-bold text-blue-800">{madrasahName}</h1>
                            <p className="text-xs">{madrasahAddress}</p>
                        </div>

                        {/* Info Section */}
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <div className="flex-1">
                                <p><span className="font-semibold">রশিদ নং:</span> {feeData.receiptNumber?.toString().padStart(4, '0')}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p><span className="font-semibold">বই নং:</span> {feeData.bookNumber?.toString().padStart(2, '0')}</p>
                            </div>
                            <div className="flex-1 text-right">
                                <p><span className="font-semibold">তারিখ:</span> {new Date(feeData.dueDate).toLocaleDateString('bn-BD')}</p>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-1 text-sm border-t border-b py-1 border-gray-300 border-dashed">
                             <div className="flex">
                                <p className="w-24 font-semibold shrink-0">নাম</p>
                                <p className="border-b border-dotted border-gray-400 flex-grow">: {student.name}</p>
                            </div>
                             <div className="flex">
                                <p className="w-24 font-semibold shrink-0">পিতার নাম</p>
                                <p className="border-b border-dotted border-gray-400 flex-grow">: {student.fatherName}</p>
                            </div>
                            <div className="flex">
                                <p className="w-24 font-semibold shrink-0">শ্রেণী</p>
                                <p className="border-b border-dotted border-gray-400 flex-grow">: {student.class}</p>
                            </div>
                            <div className="flex">
                                <p className="w-24 font-semibold shrink-0">রোল</p>
                                <p className="border-b border-dotted border-gray-400 flex-grow">: {student.rollNumber}</p>
                            </div>
                            <div className="flex items-center">
                                <div className="flex w-1/2 items-baseline">
                                    <p className="w-24 font-semibold shrink-0">টাকা</p>
                                    <p className="border-b border-dotted border-gray-400 flex-grow">: ৳{feeData.amount.toLocaleString('bn-BD')}/-</p>
                                </div>
                                <div className="flex w-1/2 ml-4 items-baseline">
                                    <p className="w-16 font-semibold shrink-0">বাবদ</p>
                                    <p className="border-b border-dotted border-gray-400 flex-grow">: {feeData.category}</p>
                                </div>
                            </div>
                            <div className="flex">
                                <p className="w-24 font-semibold shrink-0">কথায়</p>
                                <p className="border-b border-dotted border-gray-400 flex-grow">: {numberToBengaliWords(feeData.amount)} টাকা মাত্র</p>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-auto pt-1 flex justify-between items-end text-xs">
                            <div>
                                <p className="border-t-2 border-dotted border-gray-700 w-40 text-center pt-1">আদায়কারী</p>
                                <p className="text-center">{collectorName}</p>
                            </div>
                            <div>
                                <p className="border-t-2 border-dotted border-gray-700 w-40 text-center pt-1">মুহতামিম/Principal</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="bg-gray-100 px-6 py-3 flex justify-end space-x-3 no-print">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">বন্ধ করুন</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">প্রিন্ট করুন</button>
                </div>
            </div>
        </div>
    );
};

export default MoneyReceipt;