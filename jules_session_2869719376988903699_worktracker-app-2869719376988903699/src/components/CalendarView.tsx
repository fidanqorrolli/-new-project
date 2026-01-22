import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Plane, Thermometer, Ban } from 'lucide-react';
import { useApp, type DayType } from '../context/AppProvider';
import { cn } from '../lib/utils';

export const CalendarView = () => {
  const { employees, getDayStatus, setDayStatus } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDayClick = (date: Date) => {
    if (!selectedEmployeeId) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = getDayStatus(selectedEmployeeId, dateStr);

    let nextStatus: DayType | null = 'WORKING';
    if (currentStatus === 'WORKING') nextStatus = 'VACATION';
    else if (currentStatus === 'VACATION') nextStatus = 'SICK';
    else if (currentStatus === 'SICK') nextStatus = 'NON_WORKING';
    else if (currentStatus === 'NON_WORKING') nextStatus = null;

    setDayStatus(selectedEmployeeId, dateStr, nextStatus);
  };

  const getStatusColor = (status?: DayType) => {
    switch (status) {
      case 'WORKING': return 'bg-green-50 hover:bg-green-100 text-green-700';
      case 'VACATION': return 'bg-amber-50 hover:bg-amber-100 text-amber-700';
      case 'SICK': return 'bg-red-50 hover:bg-red-100 text-red-700';
      case 'NON_WORKING': return 'bg-gray-100 hover:bg-gray-200 text-gray-500';
      default: return 'hover:bg-gray-50';
    }
  };

  const getStatusIcon = (status?: DayType) => {
    switch (status) {
      case 'WORKING': return <Check className="w-4 h-4" />;
      case 'VACATION': return <Plane className="w-4 h-4" />;
      case 'SICK': return <Thermometer className="w-4 h-4" />;
      case 'NON_WORKING': return <Ban className="w-4 h-4" />;
      default: return null;
    }
  };

  if (employees.length === 0) {
    return <div className="p-8 text-center text-gray-500">Please add employees first in the Employees tab.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="w-full md:w-auto">
           <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="block w-full md:min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold w-40 text-center text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 text-xs font-medium text-gray-600 hidden md:flex">
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Working</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div> Vacation</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Sick</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-gray-200 gap-px border-gray-200">
          {days.map((day) => {
             const dateStr = format(day, 'yyyy-MM-dd');
             const status = getDayStatus(selectedEmployeeId, dateStr);
             const isCurrentMonth = isSameMonth(day, currentDate);
             const isToday = isSameDay(day, new Date());

             return (
               <button
                 key={dateStr}
                 onClick={() => handleDayClick(day)}
                 className={cn(
                   "min-h-[100px] p-2 flex flex-col items-start justify-between transition-colors bg-white hover:z-10 focus:z-10 focus:outline-none",
                   !isCurrentMonth && "bg-gray-50 text-gray-400",
                   getStatusColor(status)
                 )}
               >
                 <span className={cn(
                   "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                   isToday ? "bg-blue-600 text-white" : ""
                 )}>
                   {format(day, 'd')}
                 </span>

                 <div className="w-full flex justify-between items-end mt-2">
                    {status && (
                     <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                       {status.replace('_', ' ')}
                     </span>
                   )}
                   {status && getStatusIcon(status)}
                 </div>
               </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};
