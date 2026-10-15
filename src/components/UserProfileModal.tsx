import React from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Mail,
  ShieldAlert
} from 'lucide-react';
import type { UserSession } from './LoginPage.tsx';
import { auth, signOut } from '../firebase.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onLogout: () => void;
  onRoleChange?: (newRole: 'commander' | 'auditor' | 'redteam') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onLogout,
  onRoleChange
}) => {
  if (!isOpen) return null;

  const currentUser = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient glowing background */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-red-950/60 via-slate-900 to-red-950/40 pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-red-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Operator Identity & Clearance Profile</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card Main Info */}
        <div className="relative flex items-start gap-4 mb-6">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/30 via-slate-900 to-black border border-red-500/50 shadow-md text-red-300 font-mono text-xl font-bold">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              userSession.email.substring(0, 2).toUpperCase()
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate font-mono">
                {currentUser?.displayName || userSession.email.split('@')[0]}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono truncate">
              <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{userSession.email}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Firebase OAuth Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Session & Security Details Grid */}
        <div className="space-y-4 mb-6">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                Auth Verification
              </span>
              <span className="text-emerald-400 font-bold">
                Google OAuth 2.0 / Firebase
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Session Established
              </span>
              <span className="text-slate-300">
                {new Date().toLocaleTimeString()} (Active)
              </span>
            </div>
          </div>



          {/* Permissions Matrix */}
          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-1.5 text-xs">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
              Active WAF Clearance Privileges
            </span>
            <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
              <span>Reverse Proxy Enforcement</span>
              <span className="text-emerald-400 font-bold">FULL ACCESS</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
              <span>Ban IP Release & Override</span>
              <span className="text-emerald-400 font-bold">AUTHORIZED</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
              <span>Real-Time Voice Telemetry</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md shadow-red-950/50 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Operator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
