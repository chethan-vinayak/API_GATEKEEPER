import React from 'react';
import {
  ShieldAlert,
  Volume2,
  Play,
  RotateCcw,
  Sliders,
  User,
  LogOut,
  Sparkles,
  Cpu,
  Layers
} from 'lucide-react';
import type { GatewayMode } from '../gateway/types.ts';
import type { UserSession } from './LoginPage.tsx';
import { ApiGatekeeperLogo } from './ApiGatekeeperLogo.tsx';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode: GatewayMode;
  onToggleMode: () => void;
  isSpeaking: boolean;
  onRunSim: () => void;
  isSimulating: boolean;
  onResetData: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  mode,
  onToggleMode,
  isSpeaking,
  onRunSim,
  isSimulating,
  onResetData,
  userSession,
  onLogout,
  onOpenProfile
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Logo & Uppercase Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('dashboard');
            }}
            className="flex items-center gap-3 text-left group"
          >
            {/* Custom Cyber Shield / Gatekeeper Logo */}
            <ApiGatekeeperLogo size={36} className="h-9 w-9" glow={true} />

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase font-mono">
                API GATEKEEPER
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                Autonomous WAF Perimeter
              </span>
            </div>
          </a>

          {userSession && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-950/60 border border-red-500/40 text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              {userSession.clearance}
            </span>
          )}
        </div>

        {/* Zone 2: Primary Clean Navigation Tabs (Geo Heatmap removed) */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Live Dashboard
          </button>

          <button
            type="button"
            onClick={() => onTabChange('tester')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tester'
                ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
            title="User Input Area: Test custom HTTP payloads & preloaded scenarios"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Request Lab</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Attack Simulator
          </button>

          <button
            type="button"
            onClick={() => onTabChange('rules')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            WAF Rules
          </button>

          <button
            type="button"
            onClick={() => onTabChange('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Voice Sentinel</span>
            {isSpeaking && (
              <span className="text-amber-300 animate-pulse">
                <Volume2 className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Control Actions & Operator Session */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Reset Telemetry Button */}
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reset all attack events & bans to clean baseline (zero)"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Run 12-Probe Suite Button */}
          <button
            type="button"
            onClick={onRunSim}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
            title="Dispatches 12 HTTP requests: 10 attack vectors (blocked) + 2 benign controls (allowed)"
          >
            <Play className="h-3 w-3 fill-white" />
            <span>{isSimulating ? 'Testing...' : 'Run 12-Probe Suite'}</span>
          </button>

          {/* Operator Profile & Logout Controls */}
          {userSession && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-red-500/50 text-slate-200 text-xs font-mono transition-all cursor-pointer shadow-sm group"
                title="View Operator Profile & Clearance Details"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-red-950 border border-red-500/40 text-red-300 font-bold text-[10px]">
                  {userSession.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold group-hover:text-red-300 transition-colors">
                  Profile
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer"
                title={`Logged in as ${userSession.roleName}. Click to logout.`}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-950/95 text-xs scrollbar-none">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => onTabChange('tester')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'tester' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Request Lab
        </button>
        <button
          type="button"
          onClick={() => onTabChange('simulator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'simulator' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Simulator
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rules')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
        >
          WAF Rules
        </button>
        <button
          type="button"
          onClick={() => onTabChange('voice')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'voice' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Voice Sentinel
        </button>
      </div>
    </header>
  );
};
