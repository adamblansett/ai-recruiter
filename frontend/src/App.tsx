import { useEffect, useState } from 'react';
import { 
  Activity, 
  BarChart3,
  Bell,
  Briefcase, 
  Clock,
  Compass, 
  Database, 
  Keyboard,
  Mail, 
  Radio, 
  Search, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Users,
  X
} from 'lucide-react';
import { fetchHealth, fetchStatus, SystemHealth, SystemStatus } from './api/client';
import { useDemoMode } from './context/DemoContext';
import { requestNotificationPermission, sendDesktopNotification } from './utils/notifications';
import { ProfilePage } from './pages/Profile';
import { JobsPage } from './pages/Jobs';
import { RecruitersPage } from './pages/Recruiters';
import { OutreachPage } from './pages/Outreach';
import { AnalyticsPage } from './pages/Analytics';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'recruiters' | 'outreach' | 'profile' | 'analytics'>('overview');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });

  async function handleEnableNotifications() {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      sendDesktopNotification('AI Recruiter: Desktop Alerts Enabled', {
        body: 'You will receive immediate alerts when recruiter responses, interview requests, or follow-ups occur.',
      });
    }
  }

  // Global Keyboard Shortcuts Hook
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('overview');
      } else if (e.key === '2') {
        setActiveTab('jobs');
      } else if (e.key === '3') {
        setActiveTab('recruiters');
      } else if (e.key === '4') {
        setActiveTab('outreach');
      } else if (e.key === '5') {
        setActiveTab('profile');
      } else if (e.key === '6') {
        setActiveTab('analytics');
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        toggleDemoMode();
      } else if (e.key === 'Escape') {
        setShortcutsModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDemoMode]);

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
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  AI Recruiter
                </span>
                <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v0.6.0 • M6
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 border-l border-slate-800 pl-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Activity className="w-4 h-4" /> System Overview
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">1</kbd>
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'jobs'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Compass className="w-4 h-4" /> Jobs & Pipeline
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">2</kbd>
              </button>
              <button
                onClick={() => setActiveTab('recruiters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'recruiters'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" /> Recruiters & Contacts
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">3</kbd>
              </button>
              <button
                onClick={() => setActiveTab('outreach')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'outreach'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Mail className="w-4 h-4" /> Outreach & Approvals
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">4</kbd>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4" /> Candidate Profile
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">5</kbd>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Funnel Analytics
                <kbd className="ml-1 text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-700/80 text-slate-400">6</kbd>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Demo Mode Toggle */}
            <button
              onClick={toggleDemoMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
              }`}
              title="Toggle Interactive Offline Demo / Mock Mode (D)"
            >
              <span>🎮 Demo: {isDemoMode ? 'ON' : 'OFF'}</span>
              <kbd className="text-[10px] font-mono px-1 rounded bg-black/40 border border-current">D</kbd>
            </button>

            {/* Shortcuts Cheatsheet Trigger */}
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1 text-xs"
              title="View Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <kbd className="text-[10px] font-mono px-1 rounded bg-black/40 border border-slate-700">?</kbd>
            </button>

            {/* Desktop Notifications Toggle */}
            <button
              onClick={handleEnableNotifications}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition border ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={notificationStatus === 'granted' ? 'Native Desktop Notifications Active' : 'Enable Native Desktop Notifications'}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notificationStatus === 'granted' ? 'Alerts On' : 'Alerts'}</span>
            </button>

            <div className="flex items-center space-x-2 text-xs border-l border-slate-800 pl-3">
              <span className={`flex h-2 w-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-slate-400 font-medium">{isDemoMode ? 'Demo Mode:' : 'FastAPI:'}</span>
              <span className={`font-semibold ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isDemoMode ? 'Simulated' : (health ? health.status : 'Connecting...')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'profile' ? (
          <ProfilePage />
        ) : activeTab === 'jobs' ? (
          <JobsPage />
        ) : activeTab === 'recruiters' ? (
          <RecruitersPage />
        ) : activeTab === 'outreach' ? (
          <OutreachPage />
        ) : activeTab === 'analytics' ? (
          <AnalyticsPage />
        ) : (
          <>
            {/* Banner Section */}
            <div className="relative rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 p-8 overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl space-y-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Autonomous Career Discovery & Recruiter Outreach Platform
                </h1>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                  Personal recruiting assistant orchestrating job opportunity ingestion, built-in open-weight LLM evaluation, contact verification, and human-gated email communications.
                </p>
              </div>
            </div>

            {/* Morning Executive Pipeline Digest */}
            <section className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">☀️</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Morning Executive Pipeline Digest</h2>
                    <p className="text-xs text-slate-400">
                      Priority action items, inbound threads, and cadence alerts for Adam Blansett (Staff/Senior+ Target)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sendDesktopNotification('AI Recruiter: Recruiter Marcus Vance from Stripe requested an interview', {
                      body: "Let's schedule a 30-minute architecture discussion. Google Calendar availability linked.",
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Bell className="w-3.5 h-3.5" /> Test Desktop Notification
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Action 1: Pending Approvals */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Action Required
                      </span>
                    </div>
                    <p className="text-base font-bold text-white pt-1">4 Drafts Awaiting Sign-Off</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Custom cold intros tailored with verified STAR bullet points awaiting your human approval before dispatch.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('outreach')}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Review Queue (4 Drafts) →
                  </button>
                </div>

                {/* Action 2: Cadence Follow-ups Due */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Clock className="w-4 h-4 text-violet-400" />
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Cadence Alert
                      </span>
                    </div>
                    <p className="text-base font-bold text-white pt-1">2 Follow-ups Ready</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Touch 2 (Day 4 Gentle Nudge for Datadog) and Touch 3 (Day 9 Architecture Note for Stripe) ready to review.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('outreach')}
                    className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
                  >
                    Inspect Follow-up Cadence →
                  </button>
                </div>

                {/* Action 3: Target Roles Pipeline */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active Pipeline
                      </span>
                    </div>
                    <p className="text-base font-bold text-white pt-1">6 High-Match Roles</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      100% remote Staff/Lead roles ($195k–$260k) across Stripe, Datadog, Anthropic, Scale AI, and Vercel.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    View Discovered Jobs →
                  </button>
                </div>
              </div>
            </section>

            {/* System Core Architecture Monitor */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Core Infrastructure & AI Engine Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* API Service */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Server className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Backend Service</span>
                    <p className="text-lg font-bold text-white">FastAPI + Pydantic</p>
                    <p className="text-xs text-slate-400 font-mono">Uptime: {status ? `${status.uptime_seconds}s` : 'Active'}</p>
                  </div>
                </div>

                {/* Built-in AI Engine */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Built-in AI Engine</span>
                    <p className="text-lg font-bold text-white">Llama 3.2 (Local)</p>
                    <p className="text-xs text-emerald-400 font-mono">0 Keys Required</p>
                  </div>
                </div>

                {/* PostgreSQL */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Persistence</span>
                    <p className="text-lg font-bold text-white">PostgreSQL 16</p>
                    <p className="text-xs text-slate-400 font-mono">Status: {health?.database || 'Connected'}</p>
                  </div>
                </div>

                {/* Redis & Celery */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Task Broker</span>
                    <p className="text-lg font-bold text-white">Celery + Redis</p>
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
                  Recruitment Pipeline Capabilities
                </h2>
                <span className="text-xs text-slate-500 font-mono">Target: Milestones 1–8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveTab('profile')} 
                  className="p-5 rounded-xl bg-slate-900/50 border border-indigo-500/40 hover:border-indigo-500 cursor-pointer transition shadow-lg shadow-indigo-500/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Milestone 2 • Ready</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Candidate Profile & Resumes</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Configurable skills, work history, seniority targets, and PDF resume artifact management.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('jobs')} 
                  className="p-5 rounded-xl bg-slate-900/50 border border-indigo-500/40 hover:border-indigo-500 cursor-pointer transition shadow-lg shadow-indigo-500/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Search className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Milestone 3 • Ready</span>
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
                  <h3 className="font-semibold text-white mb-1">Built-in AI Fit Evaluation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Multi-factor structured evaluations (skills, seniority, compensation) powered by the built-in local engine.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('recruiters')} 
                  className="p-5 rounded-xl bg-slate-900/50 border border-indigo-500/40 hover:border-indigo-500 cursor-pointer transition shadow-lg shadow-indigo-500/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Milestone 5 • Ready</span>
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
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        AI Recruiter Platform • Candidate: Adam Blansett • Built-in Local AI & Python FastAPI Architecture
      </footer>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      {shortcutsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Keyboard Shortcuts & Power Workflow</h3>
                  <p className="text-xs text-slate-400">Navigate and execute actions instantly with hotkeys</p>
                </div>
              </div>
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tab Navigation */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Tab Navigation</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">System Overview</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">1</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Jobs & Pipeline</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">2</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Recruiters & Contacts</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">3</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Outreach & Approvals</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">4</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Candidate Profile</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">5</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Funnel Analytics</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">6</kbd>
                  </div>
                </div>
              </div>

              {/* System & Power Controls */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">System & Actions</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Toggle Offline Interactive Demo Mode</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">D</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Open / Close Shortcuts Cheatsheet</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">?</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Close Any Open Modal Dialog</span>
                    <kbd className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">Shortcuts are disabled when typing inside input or textarea elements.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
