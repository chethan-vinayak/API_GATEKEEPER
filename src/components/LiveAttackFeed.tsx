import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Eye,
  Volume2,
  Filter
} from 'lucide-react';
import type { SecurityEvent, ActionType } from '../gateway/types.ts';

interface LiveAttackFeedProps {
  events: SecurityEvent[];
  onSelectEvent: (event: SecurityEvent) => void;
  onVoiceDebrief: (event: SecurityEvent) => void;
}

export const LiveAttackFeed: React.FC<LiveAttackFeedProps> = ({
  events,
  onSelectEvent,
  onVoiceDebrief
}) => {
  const [actionFilter, setActionFilter] = useState<'all' | 'blocked' | 'rate_limited' | 'allowed'>('all');

  const filteredEvents = events.filter((e) => {
    if (actionFilter === 'all') return true;
    if (actionFilter === 'blocked') return e.action === 'blocked' || e.action === 'banned';
    if (actionFilter === 'rate_limited') return e.action === 'rate_limited';
    if (actionFilter === 'allowed') return e.action === 'allowed' || e.action === 'flagged';
    return true;
  });

  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case 'blocked':
      case 'banned':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold font-mono text-red-400 bg-red-950/60 border border-red-900/60 px-2 py-0.5 rounded">
            <ShieldAlert className="h-3 w-3" />
            <span>BLOCKED</span>
          </span>
        );
      case 'rate_limited':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold font-mono text-amber-400 bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 rounded">
            <AlertOctagon className="h-3 w-3" />
            <span>429 RATE LIMIT</span>
          </span>
        );
      case 'flagged':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold font-mono text-amber-300 bg-amber-900/40 border border-amber-700/60 px-2 py-0.5 rounded">
            <span>FLAGGED (MONITOR)</span>
          </span>
        );
      case 'allowed':
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded">
            <ShieldCheck className="h-3 w-3" />
            <span>ALLOWED</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Live Security Event Stream</h2>
          <span className="text-xs text-slate-400">
            {events.length} total events intercepted
          </span>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActionFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              actionFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActionFilter('blocked')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              actionFilter === 'blocked'
                ? 'bg-red-950 text-red-300 font-semibold border border-red-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Blocked
          </button>
          <button
            type="button"
            onClick={() => setActionFilter('rate_limited')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              actionFilter === 'rate_limited'
                ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            429s
          </button>
          <button
            type="button"
            onClick={() => setActionFilter('allowed')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              actionFilter === 'allowed'
                ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Allowed
          </button>
        </div>
      </div>

      {/* Events Table / Card Feed */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <div className="text-sm font-semibold text-slate-300 mb-1">
              {events.length === 0 ? 'No Intercepted Traffic Recorded' : 'No Events Match Current Filter'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {events.length === 0
                ? 'The gateway is running cleanly with zero hardcoded baseline events. Trigger simulated adversary traffic or send a real payload from the Request Lab.'
                : 'Try switching the filter to "All Events" to view intercepted traffic.'}
            </p>
            {events.length === 0 && (
              <span className="text-xs text-red-400 font-mono">
                Tip: Click "Run Attacks" in the top bar or navigate to "Request Lab" to test payloads.
              </span>
            )}
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`rounded-lg border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                evt.action === 'blocked' || evt.action === 'banned'
                  ? 'bg-red-950/10 border-red-950/40 hover:border-red-800/60'
                  : evt.action === 'rate_limited'
                  ? 'bg-amber-950/10 border-amber-950/40 hover:border-amber-800/60'
                  : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {getActionBadge(evt.action)}

                  <span className="font-mono text-xs font-semibold text-white">
                    {evt.method} {evt.path}
                  </span>

                  <span className="text-xs text-slate-400">· {evt.client_ip}</span>

                  {evt.primary_category !== 'benign' && (
                    <span className="text-xs font-mono font-medium text-slate-300 uppercase">
                      · {evt.primary_category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono">{evt.incident_id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {new Date(evt.ts).toLocaleTimeString()}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-300">
                    Score: {evt.score}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {evt.latency_ms}ms
                  </span>
                  {evt.findings.length > 0 && evt.findings[0].owasp && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300">OWASP {evt.findings[0].owasp}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onVoiceDebrief(evt)}
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                  title="Have Voice Sentinel debrief this incident"
                >
                  <Volume2 className="h-3.5 w-3.5 text-red-400" />
                  <span>Voice Debrief</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectEvent(evt)}
                  className="flex items-center gap-1 rounded bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-200 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
