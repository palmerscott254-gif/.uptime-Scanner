import { Bell, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';
import { Button } from './Button';

interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
}

interface NotificationsDropdownProps {
  items?: NotificationItem[];
}

export function NotificationsDropdown({ items = [] }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="md" icon={<Bell className="h-4 w-4" />} onClick={() => setOpen((s) => !s)} aria-expanded={open} aria-haspopup="true">
        <span className="sr-only">Notifications</span>
      </Button>

      {open ? (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-app-card p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} icon={<X className="h-4 w-4" />} />
          </div>

          <ul className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {(items.length ? items : [{ id: 'empty', title: 'No notifications yet', description: 'New incidents and system updates will appear here.', time: 'Now' }]).map((n) => (
              <li key={n.id} className="rounded-lg p-2 hover:bg-white/3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-400">{n.description}</p>
                <p className="mt-1 text-xs text-gray-500">{n.time === 'Now' ? n.time : `${n.time} ago`}</p>
              </li>
            ))}
          </ul>

          <div className="mt-3 text-center">
            <Button variant="secondary" size="sm">View all</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
