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

const sample: NotificationItem[] = [
  { id: 'n1', title: 'Payment API latency spike', description: 'Response time exceeded 500ms', time: '2m' },
  { id: 'n2', title: 'New user signup goal reached', description: 'Signup rate up 12%', time: '1h' },
  { id: 'n3', title: 'Deployment succeeded', description: 'Frontend deployed to production', time: '3h' },
];

export function NotificationsDropdown() {
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
            {sample.map((n) => (
              <li key={n.id} className="rounded-lg p-2 hover:bg-white/3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-400">{n.description}</p>
                <p className="mt-1 text-xs text-gray-500">{n.time} ago</p>
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
