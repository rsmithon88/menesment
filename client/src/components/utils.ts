const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    let result = '';

    const hundred = Math.floor(n / 100);
    if (hundred > 0) {
        result += units[hundred] + ' শত ';
    }

    const remainder = n % 100;
    if (remainder > 0) {
        if (remainder < 10) {
            result += units[remainder];
        } else if (remainder < 20) {
            result += teens[remainder - 10];
        } else {
            const ten = Math.floor(remainder / 10);
            const unit = remainder % 10;
            result += tens[ten] + (unit > 0 ? ' ' + units[unit] : '');
        }
    }

    return result.trim();
}

export function numberToBengaliWords(num: number): string {
    if (num === 0) return 'শূন্য';

    const crore = Math.floor(num / 10000000);
    let remainder = num % 10000000;

    const lakh = Math.floor(remainder / 100000);
    remainder %= 100000;

    const thousand = Math.floor(remainder / 1000);
    remainder %= 1000;

    const rest = remainder;

    let result = '';
    if (crore > 0) {
        result += numberToBengaliWords(crore) + ' কোটি ';
    }
    if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' লক্ষ ';
    }
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' হাজার ';
    }
    if (rest > 0) {
        result += convertLessThanThousand(rest);
    }

    return result.trim();
}

export function getGradeForMarks(marks: number, totalMarks: number): string {
    if (totalMarks === 0) return '-';
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'A-';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
}

export function calculateOverallResult(subjectResults: { marks: number, totalMarks: number }[]) {
    if (subjectResults.length === 0) {
        return { grade: '-', status: 'অপ্রযোজ্য' as 'পাশ' | 'ফেল' | 'অপ্রযোজ্য', totalObtainedMarks: 0, totalPossibleMarks: 0 };
    }

    const totalObtainedMarks = subjectResults.reduce((sum, r) => sum + r.marks, 0);
    const totalPossibleMarks = subjectResults.reduce((sum, r) => sum + r.totalMarks, 0);

    if (totalPossibleMarks === 0) {
       return { grade: '-', status: 'অপ্রযোজ্য' as 'পাশ' | 'ফেল' | 'অপ্রযোজ্য', totalObtainedMarks, totalPossibleMarks };
    }

    const failedAnySubject = subjectResults.some(r => getGradeForMarks(r.marks, r.totalMarks) === 'F');
    const overallGrade = getGradeForMarks(totalObtainedMarks, totalPossibleMarks);

    const status: 'পাশ' | 'ফেল' = failedAnySubject || overallGrade === 'F' ? 'ফেল' : 'পাশ';

    return { grade: overallGrade, status, totalObtainedMarks, totalPossibleMarks };
}

export function printContent(elementId: string, documentTitle: string, extraCss: string = '') {
    const printContentEl = document.getElementById(elementId);
    if (!printContentEl) {
        console.error(`Print Error: Element with id "${elementId}" not found.`);
        alert('প্রিন্ট করার জন্য কোনো তথ্য পাওয়া যায়নি।');
        return;
    }

    const printWindow = window.open('', '', 'width=900,height=650');
    if (!printWindow) {
        alert('প্রিন্ট উইন্ডো খুলতে সমস্যা হয়েছে। অনুগ্রহ করে পপ-আপ ব্লকার চেক করুন।');
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>${documentTitle}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @font-face {
                        font-family: 'SolaimanLipi';
                        src: url('https://cdn.jsdelivr.net/gh/nicholasgasior/fonts-solaimanlipi@master/SolaimanLipi.woff2') format('woff2');
                        font-weight: normal; font-style: normal;
                    }
                    @font-face {
                        font-family: 'SolaimanLipi';
                        src: url('https://cdn.jsdelivr.net/gh/nicholasgasior/fonts-solaimanlipi@master/SolaimanLipi_Bold.woff2') format('woff2');
                        font-weight: bold; font-style: normal;
                    }
                    body { 
                        font-family: 'SolaimanLipi', serif !important; 
                        -webkit-print-color-adjust: exact !important;
                    }
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .print\\:block {
                            display: block !important;
                        }
                    }
                    ${extraCss}
                </style>
            </head>
            <body>
                ${printContentEl.innerHTML}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        try {
            printWindow.print();
            printWindow.close();
        } catch (e) {
            console.error("Printing failed:", e);
            printWindow.close();
        }
    }, 500);
}

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(dp/2) * Math.sin(dp/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}
