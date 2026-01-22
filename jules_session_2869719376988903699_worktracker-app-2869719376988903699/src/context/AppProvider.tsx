import React, { createContext, useContext, useEffect, useState } from 'react';

export type DayType = 'WORKING' | 'VACATION' | 'SICK' | 'NON_WORKING';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: DayType;
}

interface AppContextType {
  employees: Employee[];
  entries: AttendanceEntry[];
  addEmployee: (firstName: string, lastName: string) => void;
  updateEmployee: (id: string, firstName: string, lastName: string) => void;
  deleteEmployee: (id: string) => void;
  setDayStatus: (employeeId: string, date: string, type: DayType | null) => void;
  getEmployeeEntries: (employeeId: string) => AttendanceEntry[];
  getDayStatus: (employeeId: string, date: string) => DayType | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'work_tracker_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEmployees(parsed.employees || []);
        setEntries(parsed.entries || []);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    } else {
      // Initialize with 3 employees if empty
      setEmployees([
        { id: '1', firstName: 'Employee', lastName: 'One' },
        { id: '2', firstName: 'Employee', lastName: 'Two' },
        { id: '3', firstName: 'Employee', lastName: 'Three' },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ employees, entries }));
    }
  }, [employees, entries, isLoaded]);

  const addEmployee = (firstName: string, lastName: string) => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
    };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: string, firstName: string, lastName: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, firstName, lastName } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    setEntries(entries.filter(e => e.employeeId !== id));
  };

  const setDayStatus = (employeeId: string, date: string, type: DayType | null) => {
    setEntries(prev => {
      // Remove existing entry for this day/employee
      const filtered = prev.filter(e => !(e.employeeId === employeeId && e.date === date));
      if (type) {
        return [...filtered, { id: crypto.randomUUID(), employeeId, date, type }];
      }
      return filtered;
    });
  };

  const getEmployeeEntries = (employeeId: string) => {
    return entries.filter(e => e.employeeId === employeeId);
  };

  const getDayStatus = (employeeId: string, date: string) => {
    return entries.find(e => e.employeeId === employeeId && e.date === date)?.type;
  };

  return (
    <AppContext.Provider value={{ employees, entries, addEmployee, updateEmployee, deleteEmployee, setDayStatus, getEmployeeEntries, getDayStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
