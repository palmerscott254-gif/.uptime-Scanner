import { ArrowDownRight, ArrowUpRight, Clock3, TriangleAlert } from 'lucide-react';
import type { LogEntry } from '../types';
import { cn, statusMeta } from '../utils';

interface LogsTimelineProps {
  logs: LogEntry[];
}

export function LogsTimeline({ logs }: LogsTimelineProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Logs Timeline</h3>
          <p className="mt-1 text-sm text-gray-400">System-generated checks and incident transitions</p>
        </div>
        <Clock3 className="h-5 w-5 text-gray-500" />
      </div>

      {logs.length ? (
        <div className="mt-6 space-y-4">
          {logs.map((log, index) => {
            const meta = statusMeta[log.type];
            return (
              <div key={log.id} className="relative pl-8">
                {index < logs.length - 1 ? <span className="absolute left-3 top-8 h-full w-px bg-white/10" /> : null}
                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] ring-1 ring-white/10">
                  {log.type === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                  ) : log.type === 'down' ? (
                    <TriangleAlert className="h-3.5 w-3.5 text-danger" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-warning" />
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
                      <p className="font-medium text-white">{log.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  {log.details ? <p className="mt-2 text-sm text-gray-400">{log.details}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-gray-400">
          No recent events yet.
        </div>
      )}
    </section>
  );
}
