import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  back?: boolean;
  right?: ReactNode;
}

export default function PageHeader({ title, back, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-border-color sticky top-0 bg-background z-40">
      <div className="flex items-center gap-2">
        {back && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-text-secondary">
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </header>
  );
}
