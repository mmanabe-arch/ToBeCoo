import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, BookOpen, Layers, FileText } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'ホーム' },
  { to: '/tasks', icon: CheckSquare, label: 'タスク' },
  { to: '/reflection', icon: BookOpen, label: '振り返り' },
  { to: '/skills', icon: Layers, label: 'スキル' },
  { to: '/memo', icon: FileText, label: 'メモ' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border-color safe-bottom z-50">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                isActive
                  ? 'text-text-primary'
                  : 'text-text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-text-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
