import { useState } from 'react';
import { Layout, type View } from './components/Layout';
import { CalendarView } from './components/CalendarView';
import { Dashboard } from './components/Dashboard';
import { EmployeeManager } from './components/EmployeeManager';
import { ExportView } from './components/ExportView';

function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <Layout currentView={view} setView={setView}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'calendar' && <CalendarView />}
      {view === 'employees' && <EmployeeManager />}
      {view === 'export' && <ExportView />}
    </Layout>
  );
}

export default App;
