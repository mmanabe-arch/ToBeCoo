import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';

import SetupScreen from './components/setup/SetupScreen';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './components/dashboard/Dashboard';
import VisionPage from './components/dashboard/VisionPage';
import TasksPage from './components/tasks/TasksPage';
import ProjectsPage from './components/tasks/ProjectsPage';
import ProjectSettingsPage from './components/tasks/ProjectSettingsPage';
import MorningCheckin from './components/routine/MorningCheckin';
import EveningCheckout from './components/routine/EveningCheckout';
import RoutinesManagePage from './components/routine/RoutinesManagePage';
import ReflectionPage from './components/reflection/ReflectionPage';
import WeeklyReflectionPage from './components/reflection/WeeklyReflection';
import SkillsTabPage from './components/skills/SkillsTabPage';
import MemoPage from './components/memo/MemoPage';
import QuarterPage from './components/quarter/QuarterPage';
import QuarterDetail from './components/quarter/QuarterDetail';

function AppRoutes() {
  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectSettingsPage />} />
        <Route path="/routine/morning" element={<MorningCheckin />} />
        <Route path="/routine/evening" element={<EveningCheckout />} />
        <Route path="/routines" element={<RoutinesManagePage />} />
        <Route path="/reflection" element={<ReflectionPage />} />
        <Route path="/reflection/weekly" element={<WeeklyReflectionPage />} />
        <Route path="/reflection/weekly/:weekKey" element={<WeeklyReflectionPage />} />
        <Route path="/skills" element={<SkillsTabPage />} />
        <Route path="/memo" element={<MemoPage />} />
        <Route path="/quarter" element={<QuarterPage />} />
        <Route path="/quarter/:id" element={<QuarterDetail />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const profile = useStore(s => s.profile);

  if (!profile?.setupCompleted) {
    return <SetupScreen />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
