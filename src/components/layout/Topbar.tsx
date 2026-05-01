import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NotificationsDropdown } from '../ui/Notifications';
import type { Project } from '../../types';

interface TopbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  onAddProject?: () => void;
  projects?: Project[];
}

export function Topbar({ search, onSearchChange, onAddProject, projects }: TopbarProps) {
  const items = (projects ?? [])
    .flatMap((p) => p.logs.map((l) => ({ id: l.id, title: l.message, description: l.details, time: l.timestamp })))
    .slice(0, 6);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-app-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <Input
            placeholder="Search monitors, projects, alerts, incidents"
            value={search ?? ''}
            onChange={(event) => onSearchChange?.(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Global search"
          />
        </div>

        <div className="flex items-center gap-2">
          <NotificationsDropdown items={items} />
          {onAddProject ? (
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onAddProject}>
              Add Project
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
