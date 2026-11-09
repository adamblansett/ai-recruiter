import { useEffect, useState } from 'react';
import { 
  Activity, 
  Briefcase, 
  Clock, 
  Database, 
  Mail, 
  Radio, 
  Search, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  Users 
} from 'lucide-react';
import { fetchHealth, fetchStatus, SystemHealth, SystemStatus } from './api/client';

export function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    async function loadSystemInfo() {
      try {
        const [h, s] = await Promise.all([
          fetchHealth().catch(() => ({
            status: 'degraded',
            app_name: 'AI Recruiter',
            environment: 'development',
            version: '0.1.0',
            database: 'simulated/disconnected',
            redis: 'simulated/disconnected',
          })),
          fetchStatus().catch(() => null),
        ]);
        setHealth(h);
        setStatus(s);
      } catch {
        // Silently handled by fallback defaults
      }
    }

    loadSystemInfo();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AI Recruiter
              </span>
              <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v0.1.0 • M1 Foundation
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-medium">FastAPI Backend:</span>
              <span className="text-emerald-400 font-semibold">{health ? health.status : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Section */}
        <div className="relative rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 p-8 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Autonomous Career Discovery & Recruiter Outreach Platform
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Personal recruiting assistant orchestrating job opportunity ingestion, multi-factor LLM evaluation, contact verification, and human-gated email communications.
            </p>
          </div>
        </div>

        {/* System Core Architecture Monitor */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Core Infrastructure Status (Milestone 1)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Service */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Backend Service</span>
                <p className="text-lg font-bold text-white">FastAPI + Pydantic v2</p>
                <p className="text-xs text-slate-400 font-mono">Uptime: {status ? `${status.uptime_seconds}s` : 'Active'}</p>
              </div>
            </div>

            {/* PostgreSQL */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Primary Persistence</span>
                <p className="text-lg font-bold text-white">PostgreSQL 16 + Alembic</p>
                <p className="text-xs text-slate-400 font-mono">Status: {health?.database || 'Connected'}</p>
              </div>
            </div>

            {/* Redis & Celery */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Broker & Workers</span>
                <p className="text-lg font-bold text-white">Celery 5.4 + Redis 7</p>
                <p className="text-xs text-slate-400 font-mono">Status: {health?.redis || 'Connected'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Modules Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Platform Capabilities & Pipeline Modules
            </h2>
            <span className="text-xs text-slate-500 font-mono">Target: Milestones 2–8</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <Search className="w-5 h-5 text-indigo-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Milestone 3</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Job Discovery Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregates postings via pluggable source adapters, canonical normalizers, and SHA-256 deduplication.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Milestone 4</span>
              </div>
              <h3 className="font-semibold text-white mb-1">AI Fit Evaluation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-factor structured evaluations (skills, seniority, compensation) with token and USD expenditure auditing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Milestone 5</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Recruiter Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pinpoints hiring managers and talent partners with evidence-based MX-record contact verification.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Human-in-Loop</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Outreach Approval Gate</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                DB-enforced human sign-off before any tailored outreach draft can be transmitted through Gmail.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Milestone 6</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Gmail OAuth 2.0 Integration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure draft creation, resume attachments, thread synchronization, and interview request detection.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Milestone 7</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Background Automation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scheduled discovery routines and follow-up alerts powered by Celery Beat while preserving human approval.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        AI Recruiter Platform • Candidate: Adam Blansett • Python FastAPI & React TypeScript Architecture
      </footer>
    </div>
  );
}

export default App;
