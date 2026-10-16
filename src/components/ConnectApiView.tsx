import React, { useState, useEffect } from 'react';
import {
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  FileCode,
  ArrowRight,
  Layers,
  Info,
  Key,
  Lock,
  ExternalLink,
  BookOpen,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { db, doc, onSnapshot, setDoc } from '../firebase.ts';
import { UserSession } from './LoginPage.tsx';

interface ConnectionStatus {
  activeUpstreamUrl: string;
  activeOpenApiPath: string;
  reachability: 'reachable' | 'unreachable' | 'untested';
  contractValid: boolean;
  apiTitle?: string;
  apiVersion?: string;
  operationsCount?: number;
  discoveredRoutes?: string[];
  lastCheckedAt?: string;
  validationErrors?: string[];
  warnings?: string[];
  activeFromFirestore?: boolean;
}

interface ConnectApiViewProps {
  userSession?: UserSession | null;
  onVoiceDebrief?: (text: string) => void;
  onRefreshData?: () => void;
}

export const ConnectApiView: React.FC<ConnectApiViewProps> = ({
  userSession,
  onVoiceDebrief,
  onRefreshData
}) => {
  // Form Inputs
  const [upstreamUrl, setUpstreamUrl] = useState<string>('http://127.0.0.1:9000');
  const [openApiPath, setOpenApiPath] = useState<string>('/openapi.json');
  const [authToken, setAuthToken] = useState<string>('');

  // Status & State
  const [status, setStatus] = useState<ConnectionStatus>({
    activeUpstreamUrl: 'http://127.0.0.1:9000',
    activeOpenApiPath: '/openapi.json',
    reachability: 'untested',
    contractValid: false
  });

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'config' | 'guide'>('config');

  // Sync Active Configuration from Server & Firestore
  useEffect(() => {
    const fetchCurrentConfig = async () => {
      try {
        const res = await fetch('/_gk/api/connection');
        if (res.ok) {
          const data = await res.json();
          if (data.activeUpstreamUrl) {
            setStatus(data);
            if (!hasUnsavedChanges) {
              setUpstreamUrl(data.activeUpstreamUrl);
              setOpenApiPath(data.activeOpenApiPath || '/openapi.json');
            }
          }
        }
      } catch (err) {
        console.warn('Gateway connection config sync notice:', err);
      }
    };

    fetchCurrentConfig();

    // Firestore Real-Time Session Listener
    const unsubscribe = onSnapshot(doc(db, 'gateway_config', 'active'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ConnectionStatus;
        if (data) {
          setStatus((prev) => ({ ...prev, ...data, activeFromFirestore: true }));
          // Preserve unsaved form edits when background updates arrive
          if (!hasUnsavedChanges && data.activeUpstreamUrl) {
            setUpstreamUrl(data.activeUpstreamUrl);
            setOpenApiPath(data.activeOpenApiPath || '/openapi.json');
          }
        }
      }
    }, (err) => {
      console.warn('Firestore gateway_config notice:', err);
    });

    return () => unsubscribe();
  }, [hasUnsavedChanges]);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast(prev => ({ message: msg, type }));
    setTimeout(() => setToast(null), 4500);
  };

  // Track Form Changes
  const handleUrlChange = (val: string) => {
    setUpstreamUrl(val);
    setHasUnsavedChanges(true);
  };

  const handlePathChange = (val: string) => {
    setOpenApiPath(val);
    setHasUnsavedChanges(true);
  };

  // 1. REAL SERVER-SIDE CONNECTION TESTING
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/_gk/api/connection/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.token}`
        },
        body: JSON.stringify({
          upstream_url: upstreamUrl.trim(),
          openapi_path: openApiPath.trim(),
          auth_token: authToken.trim() || undefined
        })
      });

      if (res.status === 401) {
        showToast('Your session expired. Sign in again.', 'error');
        return;
      }

      const data = await res.json();
      setTestResult(data);

      if (data.success && data.reachability === 'reachable') {
        showToast(`Backend reachable! Discovered ${data.operationsCount || 0} OpenAPI operations.`, 'success');
      } else {
        showToast(`Connection Check Failed: ${data.error || 'Backend unreachable'}`, 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        reachability: 'unreachable',
        error: err.message || 'Network failure dispatching connection test'
      });
      showToast('Network error testing backend connection');
    } finally {
      setIsTesting(false);
    }
  };

  // 2. PERSIST & ACTIVATE CONFIGURATION
  const handleSaveAndActivate = async () => {
    setIsSaving(true);

    try {
      const res = await fetch('/_gk/api/connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession?.token}`
        },
        body: JSON.stringify({
          upstream_url: upstreamUrl.trim(),
          openapi_path: openApiPath.trim(),
          auth_token: authToken.trim() || undefined
        })
      });

      if (res.status === 401) {
        showToast('Administrator authorization required.', 'error');
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus(data.status);
        setHasUnsavedChanges(false);
        setTestResult(null);

        // Sync to Firestore for all open sessions in background
        setDoc(doc(db, 'gateway_config', 'active'), {
          ...data.status,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        showToast(`Backend "${data.status.activeUpstreamUrl}" is now ACTIVE & protected!`, 'success');
        onRefreshData?.();
      } else {
        showToast(`Failed to activate: ${data.error || 'Invalid configuration'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error saving configuration: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border shadow-2xl animate-bounce ${
          toast.type === 'success' ? 'border-emerald-500/80 text-emerald-300' : 
          toast.type === 'error' ? 'border-red-500/80 text-red-300' : 'border-amber-500/80 text-amber-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : 
           toast.type === 'error' ? <XCircle className="h-4 w-4 text-red-400 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
          <span className="text-xs font-mono font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Server className="h-5 w-5 text-red-400 shrink-0" />
            <h1 className="text-xl font-black tracking-tight text-white uppercase font-sans">
              Connect the API you want to protect
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-sans">
            Choose where accepted requests go and load your backend's API specification. Gatekeeper validates endpoints, required parameters, and JSON request bodies before forwarding requests.
          </p>
        </div>

        {/* Section Switcher & Voice Debrief */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTabSection('config')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTabSection === 'config'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Configuration & Status
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('guide')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'guide'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Beginner Guide</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onVoiceDebrief?.(
                `Gateway Configuration Status: Active target backend is ${status.activeUpstreamUrl}. Reachability status: ${status.reachability}. Contract guard status: ${
                  status.contractValid ? 'Valid OpenAPI Contract Loaded' : 'Operating with Fallback Schema'
                }. ${status.operationsCount || 0} operations documented.`
              )
            }
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-red-400 hover:text-white transition-all cursor-pointer"
            title="Spoken Architecture Brief"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTabSection === 'config' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Configuration Form & Validation Inspector */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-red-400 shrink-0" />
                  <span>Upstream Target & OpenAPI Contract Settings</span>
                </h2>
                {hasUnsavedChanges && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 border border-amber-800 text-amber-300">
                    Unsaved Changes
                  </span>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 font-mono text-xs">
                {/* Field 1: Backend Base URL */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Backend Base URL (HTTP / HTTPS)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUpstreamUrl('http://127.0.0.1:9000');
                          setOpenApiPath('/openapi.json');
                          showToast("Loaded Local Lab Settings", "success");
                        }}
                        className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 text-white transition-all text-[9px] font-bold uppercase cursor-pointer"
                      >
                        Try Local Lab
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">Required Target Base</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={upstreamUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="http://127.0.0.1:9000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Example: <code className="text-red-300 font-mono">http://127.0.0.1:9000</code> or <code className="text-red-300 font-mono">https://api.mycompany.com</code>
                  </p>
                </div>

                {/* Field 2: OpenAPI Specification Path */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span>OpenAPI Specification Path</span>
                    <span className="text-[10px] text-slate-500 font-normal">Backend-relative Path</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={openApiPath}
                    onChange={(e) => handlePathChange(e.target.value)}
                    placeholder="/openapi.json"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Relative path on backend where OpenAPI 3.0 or 3.1 JSON/YAML schema is exposed (e.g. <code className="text-amber-300 font-mono">/openapi.json</code> or <code className="text-amber-300 font-mono">/docs/openapi.yaml</code>).
                  </p>
                </div>

                {/* Field 3: Optional Spec Auth Token */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span>Spec Fetch Bearer Token (Optional)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Stored securely on server</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Bearer token if spec endpoint requires authorization"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                    <Key className="absolute right-3 top-3 h-4 w-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !upstreamUrl.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                      <span>Testing Backend Reachability...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndActivate}
                  disabled={isSaving || !upstreamUrl.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/60 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Activating Upstream...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Save & Activate Backend</span>
                    </>
                  )}
                </button>
              </div>

              {/* Important Disclaimers */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs space-y-1.5 font-sans">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono uppercase text-[11px]">Deployment Disclaimer:</strong>
                    <span>Your target backend must already be running and reachable from the gateway. Saving its address configures the proxy pipeline but does not deploy the backend server itself.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-slate-900">
                  <Server className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono uppercase text-[11px]">Localhost Reference:</strong>
                    <span>When entering <code className="text-amber-300 font-mono">http://127.0.0.1:9000</code> or <code className="text-amber-300 font-mono">http://localhost:9000</code>, localhost refers to the host machine running Gatekeeper.</span>
                    <div className="mt-2">
                      <a 
                        href="/_lab" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 transition-all text-[10px] font-bold uppercase"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open VulnShop Lab UI
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results Inspector Card (If connection test was run) */}
            {testResult && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Connection & OpenAPI Specification Validation Results</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    testResult.reachability === 'reachable'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-red-950 border border-red-800 text-red-300'
                  }`}>
                    {testResult.reachability === 'reachable' ? 'Backend Reachable' : 'Connection Failed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">API Title & Version</span>
                    <span className="font-bold text-white block truncate">
                      {testResult.api_title || 'N/A'} ({testResult.api_version || 'v1.0'})
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Discovered Operations</span>
                    <span className="font-bold text-emerald-400 block tabular-nums">
                      {testResult.operations_count || 0} Routes Parsed
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Contract Guard</span>
                    <span className={`font-bold block ${testResult.contract_valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {testResult.contract_valid ? 'OpenAPI 3.x Valid' : 'Schema Warnings'}
                    </span>
                  </div>
                </div>

                {/* Discovered Operations List */}
                {testResult.discovered_routes && testResult.discovered_routes.length > 0 && (
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                      Discovered OpenAPI Operation Routes ({testResult.discovered_routes.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {testResult.discovered_routes.map((route: string) => (
                        <span key={route} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors & Warnings */}
                {testResult.error && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-xs font-mono space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
                      <AlertCircle className="h-4 w-4" />
                      <span>Connection Error Diagnostics</span>
                    </div>
                    <p className="leading-relaxed">
                      {testResult.error}
                    </p>
                    <div className="pt-2 mt-2 border-t border-red-900/40 text-[10px] text-red-300/70">
                      <strong>Troubleshooting:</strong> If your backend is local, ensuring it's reachable from the Gateway's execution environment. Use HTTPS if possible.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Active Status Indicators & Health Panel */}
          <div className="space-y-6">
            {/* Active Upstream Status Panel */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Active Protected Backend Status</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Live Proxy Target</span>
              </div>

              {/* Status Indicators */}
              <div className="space-y-3 font-mono text-xs">
                {/* Indicator 1: Backend Reachability */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">1. Backend Reachability</span>
                    <span className="font-bold text-white text-xs">{status.activeUpstreamUrl}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    status.reachability === 'reachable'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-red-950 border border-red-800 text-red-300'
                  }`}>
                    {status.reachability === 'reachable' ? 'Online' : 'Unreachable'}
                  </span>
                </div>

                {/* Indicator 2: Contract Guard Status */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">2. OpenAPI Contract Guard</span>
                    <span className="font-bold text-slate-300 text-xs">
                      {status.apiTitle ? `${status.apiTitle} (${status.apiVersion || 'v1.0'})` : status.activeOpenApiPath}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    status.contractValid
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-amber-950 border border-amber-800 text-amber-300'
                  }`}>
                    {status.contractValid ? 'Validated' : 'Fallback Schema'}
                  </span>
                </div>

                {/* Indicator 3: Discovered Operations Counter */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">3. Documented Operations</span>
                    <span className="font-bold text-emerald-400 text-xs tabular-nums">
                      {status.operationsCount || 0} Routes Active
                    </span>
                  </div>
                  <Layers className="h-4 w-4 text-emerald-400" />
                </div>
              </div>

              {/* Warning box if Contract Guard fallback */}
              {!status.contractValid && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/60 text-amber-300 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Contract Guard Warning</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 font-sans leading-relaxed">
                    Operating with wildcard contract fallback. Load a valid OpenAPI 3.0/3.1 specification to enforce strict schema parameter type checks.
                  </p>
                </div>
              )}
            </div>

            {/* Security Controls Panel */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3 font-mono text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Lock className="h-4 w-4 text-red-400 shrink-0" />
                <span>Security & Anti-SSRF Controls Enforced</span>
              </h3>
              <div className="space-y-2 text-slate-400 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Destination Scheme:</span>
                  <span className="text-emerald-400 font-bold">HTTP / HTTPS Only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Self-Loop Protection:</span>
                  <span className="text-emerald-400 font-bold">Port 3000 Blocked</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cloud Metadata Protection:</span>
                  <span className="text-emerald-400 font-bold">169.254.169.254 Blocked</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spec Size Limit:</span>
                  <span className="text-emerald-400 font-bold">5 MB Max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fetch Timeout:</span>
                  <span className="text-emerald-400 font-bold">5.0s Timeout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BEGINNER WALKTHROUGH GUIDE */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-lg font-black text-white uppercase font-sans flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-400" />
              <span>Beginner Step-by-Step Walkthrough Guide</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Follow these 7 simple steps to connect your backend API, load its OpenAPI contract, and verify threat protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                STEP 1
              </span>
              <h3 className="font-bold text-white text-sm">Start Your Backend API</h3>
              <p className="text-slate-400 font-sans text-xs">
                Launch your target backend API. 
              </p>
              <p className="text-[10px] text-amber-300 font-sans italic mt-1">
                <strong>LAB TIP:</strong> We have bundled a vulnerable clothing store API for you to test. Use <code className="text-white">http://127.0.0.1:9000</code> to start testing immediately.
              </p>
              <div className="pt-2">
                <a 
                  href="/_lab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-all text-[10px] font-bold"
                >
                  <ExternalLink className="h-3 w-3" />
                  OPEN VULNSHOP LAB UI
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                STEP 2
              </span>
              <h3 className="font-bold text-white text-sm">OpenAPI Specification Path</h3>
              <p className="text-slate-400 font-sans text-xs">
                This is the "Blueprint" file of your API (JSON or YAML). 
                Common paths: <code className="text-amber-300 font-mono">/openapi.json</code>, <code className="text-amber-300 font-mono">/swagger.json</code>, or <code className="text-amber-300 font-mono">/api-docs</code>.
              </p>
              <p className="text-[10px] text-slate-500 font-sans italic">
                Don't have one? That's fine! Leave it as default. The gateway will use <strong>Fallback Mode</strong> to protect you from general attacks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                STEP 3
              </span>
              <h3 className="font-bold text-white text-sm">Enter URL & Spec Path</h3>
              <p className="text-slate-400 font-sans text-xs">
                Enter your backend URL and spec path into the configuration form on the left.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                STEP 4
              </span>
              <h3 className="font-bold text-white text-sm">Click "Test Connection"</h3>
              <p className="text-slate-400 font-sans text-xs">
                Gatekeeper executes a server-side health check, fetches your OpenAPI document, parses routes, and verifies schema structure without changing your current active backend.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                STEP 5
              </span>
              <h3 className="font-bold text-white text-sm">Click "Save & Activate"</h3>
              <p className="text-slate-400 font-sans text-xs">
                Gatekeeper activates the new backend target and compiles its OpenAPI contract into the active proxy engine.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 md:col-span-2">
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-900">
                PITCH DECK: HOW TO DEMO TO JUDGES
              </span>
              <h3 className="font-bold text-white text-sm">Real-Time Perimeter Protection Demo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <p className="text-emerald-400 font-bold text-[11px]">1. The Setup:</p>
                  <p className="text-slate-400 font-sans text-[11px]">Enter your hackathon backend URL here. Click <strong>Save & Activate</strong>. Show the judges how the Gatekeeper "adopts" your API instantly.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-emerald-400 font-bold text-[11px]">2. The Valid Request:</p>
                  <p className="text-slate-400 font-sans text-[11px]">Go to <strong>Request Lab</strong>. Send a normal GET request. Show the real JSON data coming from your backend.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-red-400 font-bold text-[11px]">3. The Injection Attack:</p>
                  <p className="text-slate-400 font-sans text-[11px]">Add <code className="text-red-300">' OR 1=1--</code> to a query. Show the instant 403 Block and the <strong>Voice Sentinel</strong> explaining why.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-red-400 font-bold text-[11px]">4. Real-World Proof:</p>
                  <p className="text-slate-400 font-sans text-[11px]">Run <strong>Attack Simulator</strong>. Point to the <code className="text-amber-300 font-mono italic">Upstream Trace</code> result. This proves the gateway is talking to your real server.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
