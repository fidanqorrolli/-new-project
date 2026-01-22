import { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Dashboard = () => {
  const { employees, entries } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);

  const calculateStats = (employeeId: string, start: Date, end: Date) => {
    const employeeEntries = entries.filter(e => 
      e.employeeId === employeeId && 
      isWithinInterval(parseISO(e.date), { start, end })
    );

    return {
      working: employeeEntries.filter(e => e.type === 'WORKING').length,
      vacation: employeeEntries.filter(e => e.type === 'VACATION').length,
      sick: employeeEntries.filter(e => e.type === 'SICK').length,
      nonWorking: employeeEntries.filter(e => e.type === 'NON_WORKING').length,
    };
  };

  return (
    <div className="space-y-8">
      {/* Monthly Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Monthly Summary</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Working Days</th>
                <th className="px-6 py-4">Vacation</th>
                <th className="px-6 py-4">Sick Leave</th>
                <th className="px-6 py-4">Total Days Tracked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                  employees.map(emp => {
                    const stats = calculateStats(emp.id, monthStart, monthEnd);
                    const total = stats.working + stats.vacation + stats.sick; 
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">{stats.working}</td>
                        <td className="px-6 py-4 text-amber-600">{stats.vacation}</td>
                        <td className="px-6 py-4 text-red-600">{stats.sick}</td>
                        <td className="px-6 py-4 text-gray-600">{total}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Yearly Summary ({format(currentDate, 'yyyy')})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Working Days</th>
                <th className="px-6 py-4">Vacation</th>
                <th className="px-6 py-4">Sick Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                  employees.map(emp => {
                    const stats = calculateStats(emp.id, yearStart, yearEnd);
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">{stats.working}</td>
                        <td className="px-6 py-4 text-amber-600">{stats.vacation}</td>
                        <td className="px-6 py-4 text-red-600">{stats.sick}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
