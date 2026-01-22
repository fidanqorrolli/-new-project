import { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, eachMonthOfInterval } from 'date-fns';
import { FileSpreadsheet, FileText } from 'lucide-react';

export const ExportView = () => {
  const { employees, entries } = useApp();
  const [year, setYear] = useState(new Date().getFullYear());

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Yearly Summary Sheet
    const yearlyData = employees.map(emp => {
      const empEntries = entries.filter(e => e.employeeId === emp.id && e.date.startsWith(year.toString()));
      return {
        Employee: `${emp.firstName} ${emp.lastName}`,
        Working: empEntries.filter(e => e.type === 'WORKING').length,
        Vacation: empEntries.filter(e => e.type === 'VACATION').length,
        Sick: empEntries.filter(e => e.type === 'SICK').length,
        NonWorking: empEntries.filter(e => e.type === 'NON_WORKING').length,
      };
    });
    const wsYearly = XLSX.utils.json_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(wb, wsYearly, "Yearly Summary");

    // Monthly Summary Sheet
    const months = eachMonthOfInterval({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
    });
    
    const monthlyData: any[] = [];
    months.forEach(month => {
        const monthStr = format(month, 'yyyy-MM');
        employees.forEach(emp => {
             const empEntries = entries.filter(e => e.employeeId === emp.id && e.date.startsWith(monthStr));
             monthlyData.push({
                 Month: format(month, 'MMMM'),
                 Employee: `${emp.firstName} ${emp.lastName}`,
                 Working: empEntries.filter(e => e.type === 'WORKING').length,
                 Vacation: empEntries.filter(e => e.type === 'VACATION').length,
                 Sick: empEntries.filter(e => e.type === 'SICK').length,
             });
        });
    });
    const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Summary");

    // Raw Data
    const rawData = entries
        .filter(e => e.date.startsWith(year.toString()))
        .map(e => {
            const emp = employees.find(emp => emp.id === e.employeeId);
            return {
                Date: e.date,
                Employee: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
                Type: e.type
            };
        })
        .sort((a, b) => a.Date.localeCompare(b.Date));
        
    const wsRaw = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, wsRaw, "Raw Data");

    XLSX.writeFile(wb, `WorkTracker_Export_${year}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`WorkTracker Summary - ${year}`, 14, 22);
    
    // Yearly Summary Table
    doc.setFontSize(14);
    doc.text("Yearly Summary", 14, 32);
    
    const yearlyData = employees.map(emp => {
      const empEntries = entries.filter(e => e.employeeId === emp.id && e.date.startsWith(year.toString()));
      return [
        `${emp.firstName} ${emp.lastName}`,
        empEntries.filter(e => e.type === 'WORKING').length,
        empEntries.filter(e => e.type === 'VACATION').length,
        empEntries.filter(e => e.type === 'SICK').length,
      ];
    });

    autoTable(doc, {
        head: [['Employee', 'Working', 'Vacation', 'Sick']],
        body: yearlyData,
        startY: 36,
    });
    
    // Monthly Breakdown
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.text("Monthly Breakdown", 14, finalY + 10);
    
    const monthlyRows: any[] = [];
    const months = eachMonthOfInterval({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
    });
    
    months.forEach(month => {
        employees.forEach(emp => {
             const monthStr = format(month, 'yyyy-MM');
             const empEntries = entries.filter(e => e.employeeId === emp.id && e.date.startsWith(monthStr));
             monthlyRows.push([
                 format(month, 'MMMM'),
                 `${emp.firstName} ${emp.lastName}`,
                 empEntries.filter(e => e.type === 'WORKING').length,
                 empEntries.filter(e => e.type === 'VACATION').length,
                 empEntries.filter(e => e.type === 'SICK').length,
             ]);
        });
    });

    autoTable(doc, {
        head: [['Month', 'Employee', 'Working', 'Vacation', 'Sick']],
        body: monthlyRows,
        startY: finalY + 14,
    });

    doc.save(`WorkTracker_Report_${year}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Export Data</h3>
        <p className="text-sm text-gray-500 mt-1">Download summaries and reports.</p>
      </div>
      
      <div className="p-8 space-y-8">
         <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Select Year:</label>
            <input 
                type="number" 
                value={year} 
                onChange={e => setYear(parseInt(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 w-24 text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
                onClick={exportExcel}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
                <div className="p-4 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <span className="font-semibold text-gray-900">Export to Excel</span>
                <span className="text-sm text-gray-500 mt-1">.xlsx format</span>
            </button>

            <button 
                onClick={exportPDF}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
            >
                <div className="p-4 bg-red-100 rounded-full mb-4 group-hover:bg-red-200 transition-colors">
                    <FileText className="w-8 h-8 text-red-600" />
                </div>
                <span className="font-semibold text-gray-900">Export to PDF</span>
                <span className="text-sm text-gray-500 mt-1">.pdf format</span>
            </button>
         </div>
      </div>
    </div>
  );
};
