import React, { useState } from 'react';
import {
  X,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  ArrowRight,
  Code,
  Copy,
  Check,
  Globe,
  Terminal,
  AlertTriangle,
  FileText,
  Activity,
  Cpu,
  Lock
} from 'lucide-react';
import type { SecurityEvent } from '../gateway/types.ts';

interface IncidentDrawerProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onVoiceDebrief: (event: SecurityEvent) => void;
  isSpeaking: boolean;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  event,
  onClose,
  onVoiceDebrief,
  isSpeaking
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'forensics' | 'rules' | 'remediation' | 'payload'>('forensics');

  if (!event) return null;

  const generateCurl = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
    let url = `${origin}${event.path}`;
    if (event.query) {
      url += `?${event.query}`;
    }
    return `curl -i -X ${event.method} "${url}" \\\n  -H "X-Forwarded-For: ${event.client_ip}" \\\n  -H "User-Agent: ${event.user_agent.replace(/"/g, '\\"')}"`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-[#070d19] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-mono">
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                DEEP FORENSIC TELEMETRY INSPECTOR
              </span>
              <span aria-hidden="true">·</span>
              <span>{new Date(event.ts).toLocaleString()}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
              <span className="font-mono">{event.method} {event.path}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                event.action === 'blocked' || event.action === 'banned'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {event.action.toUpperCase()} ({event.status_code})
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVoiceDebrief(event)}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 shadow transition-colors cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{isSpeaking ? 'Debriefing...' : 'Voice Debrief'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close inspector modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Protection Verdict Alert Banner */}
        <div className="px-6 pt-4 pb-2">
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            event.reached_backend
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {event.reached_backend ? (
                <Server className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-xs font-bold">
                {event.reached_backend
                  ? 'Monitor Mode Notice: Traffic was allowed to pass to upstream backend for audit collection.'
                  : 'Perimeter Defense Verdict: ZERO malicious bytes reached upstream services. Intercepted in < 3ms.'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              <span className="text-slate-400">Gateway Latency:</span>
              <span className="text-emerald-400 font-bold">{event.latency_ms}ms</span>
            </div>
          </div>
        </div>

        {/* Internal Navigation Sub-Tabs */}
        <div className="px-6 pt-2 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('forensics')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'forensics'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Network Forensics & Packet Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            OWASP CRS Violations ({event.findings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'payload'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Query & Body Payload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remediation')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'remediation'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Remediation & Code Fix
          </button>
        </div>

        {/* Body Content by Sub-Tab */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {/* TAB 1: Network Forensics */}
          {activeTab === 'forensics' && (
            <div className="space-y-4 text-xs">
              {/* Geolocation & Origin IP Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5">
                  <span className="text-[11px] text-slate-400 block mb-1">Origin IP Address</span>
                  <div className="font-mono text-sm font-bold text-white">{event.client_ip}</div>
                  <span className="text-[10px] text-slate-400">Forwarded via X-Forwarded-For</span>
                </div>

                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5">
                  <span className="text-[11px] text-slate-400 block mb-1">Transport & Protocol</span>
                  <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                    <span>HTTP/1.1 · TLS 1.3</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Port 443 · Reverse-Proxy Ingress</span>
                </div>

                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5">
                  <span className="text-[11px] text-slate-400 block mb-1">OWASP CRS Anomaly Score</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-mono text-base font-bold ${event.score >= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {event.score} pts
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {event.score >= 5 ? '(Threshold: 5 · BLOCKED)' : '(Threshold: 5 · PASS)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${event.score >= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {event.severity} Severity
                  </span>
                </div>
              </div>

              {/* User Agent & Client Details */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5">
                <span className="text-[11px] text-slate-400 block mb-1">HTTP Client User-Agent</span>
                <div className="font-mono text-xs text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                  {event.user_agent}
                </div>
              </div>

              {/* Multi-Decode Normalizer Chain */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>Multi-Decode Normalization Pipeline</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  Before applying signature evaluation, API Gatekeeper strips obfuscation layers (double URL encoding, SQL inline comments, null bytes, unicode) so attackers cannot evade pattern matching.
                </p>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {(event.decode_chain || ['raw_input']).map((stage, idx) => (
                    <React.Fragment key={idx}>
                      <span className="rounded-lg bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 text-indigo-200 font-semibold">
                        {stage}
                      </span>
                      {idx < (event.decode_chain?.length || 1) - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Reproducible cURL Command */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-amber-400" />
                    <span>Reproduce via Terminal cURL</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {generateCurl()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: Rule Violations */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>{event.findings.length} rule violation(s) triggered anomaly scoring</span>
                <span className="font-mono font-bold text-red-400">Total Score: +{event.score}</span>
              </div>

              {event.findings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-950 rounded-xl border border-slate-800">
                  No rule violations. Request passed all positive OpenAPI schema contract checks.
                </div>
              ) : (
                event.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{f.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 border border-red-800 text-red-300 font-bold">
                          {f.rule_id}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-red-400">+{f.score} pts</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                      <span>Layer: <strong className="capitalize text-slate-300">{f.layer}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>OWASP: <strong className="text-slate-300">{f.owasp}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>CWE: <strong className="text-slate-300">{f.cwe}</strong></span>
                      {f.attack && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>ATT&CK: <strong className="text-slate-300">{f.attack}</strong></span>
                        </>
                      )}
                    </div>

                    {f.matched && (
                      <div className="rounded bg-slate-900 border border-red-900/40 p-2.5 font-mono text-[11px] text-red-300 break-all">
                        <span className="text-slate-400 font-sans block text-[10px] mb-0.5">Matched Substring / Capture Pattern:</span>
                        {f.matched}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Raw Query & Body Payload */}
          {activeTab === 'payload' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                <span className="text-slate-400 block font-bold uppercase tracking-wider mb-2">
                  Query String Parameters
                </span>
                {event.query ? (
                  <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs break-all whitespace-pre-wrap">
                    {event.query}
                  </pre>
                ) : (
                  <span className="text-slate-500 italic">No query string parameters present.</span>
                )}
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                <span className="text-slate-400 block font-bold uppercase tracking-wider mb-2">
                  Request URI & Target Path
                </span>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs">
                  {event.method} {event.path}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Remediation & Fix */}
          {activeTab === 'remediation' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Developer Remediation Guideline</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Even though API Gatekeeper intercepts and shields your servers from this vector, defense-in-depth requires remediation at the application layer:
                </p>

                {event.primary_category === 'sqli' && (
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 mt-2">
                    <strong className="text-white block mb-1">SQL Injection Fix:</strong>
                    <p className="text-slate-400 mb-2">Always use parameterized queries or an ORM with prepared statements. Never concatenate user input directly into SQL strings.</p>
                    <code className="text-[11px] font-mono text-emerald-300 block bg-slate-950 p-2 rounded">
                      db.query('SELECT * FROM products WHERE name = $1', [userInput])
                    </code>
                  </div>
                )}

                {event.primary_category === 'prompt_injection' && (
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 mt-2">
                    <strong className="text-white block mb-1">LLM Prompt Injection Fix:</strong>
                    <p className="text-slate-400 mb-2">Separate developer system instructions from untrusted user content using structural XML/JSON delimiters, and enforce secondary guardrail validation.</p>
                    <code className="text-[11px] font-mono text-emerald-300 block bg-slate-950 p-2 rounded">
                      {"<user_query>{sanitize(userInput)}</user_query>"}
                    </code>
                  </div>
                )}

                {event.primary_category === 'nosql' && (
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 mt-2">
                    <strong className="text-white block mb-1">NoSQL Operator Injection Fix:</strong>
                    <p className="text-slate-400 mb-2">Enforce schema casting so input is strictly treated as string literals, rejecting object operators like $ne or $gt.</p>
                    <code className="text-[11px] font-mono text-emerald-300 block bg-slate-950 p-2 rounded">
                      {"const username = String(req.body.username);"}
                    </code>
                  </div>
                )}

                {event.primary_category !== 'sqli' && event.primary_category !== 'prompt_injection' && event.primary_category !== 'nosql' && (
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 mt-2">
                    <strong className="text-white block mb-1">Input Validation & Schema Guard:</strong>
                    <p className="text-slate-400 mb-2">Enforce strict OpenAPI contract specifications and reject undeclared properties using JSON schema validation.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
