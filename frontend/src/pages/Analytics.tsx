import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Send, 
  MessageSquare, 
  Calendar, 
  Trophy, 
  Clock, 
  AlertCircle,
  DollarSign,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface AnalyticsSummary {
  total_jobs: number;
  qualified_jobs: number;
  emails_awaiting_approval: number;
  emails_sent: number;
  responses_received: number;
  response_rate_percent: number;
  interviews_scheduled: number;
  offers_received: number;
  avg_target_salary: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  label: string;
}

interface PendingFollowup {
  outreach_id: string;
  company_name: string;
  job_title: string;
  recruiter_name: string;
  recruiter_email: string | null;
  sent_at: string;
  days_since_sent: number;
}

interface FunnelData {
  summary: AnalyticsSummary;
  funnel_stages: FunnelStage[];
  pending_followups: PendingFollowup[];
}

export function AnalyticsPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/analytics/funnel');
      if (!res.ok) throw new Error('Failed to load funnel analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const s = data?.summary;
  const maxCount = Math.max(...(data?.funnel_stages.map((st) => st.count) || [1]), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Pipeline Funnel & Conversion Analytics
        </h2>
        <p className="text-sm text-slate-400">
          Real-time metrics tracking discovery-to-offer progression, email response velocity, and follow-up alerts.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Discovered
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.total_jobs || 0}</div>
          <p className="text-[11px] text-slate-500">Opportunities</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Qualified
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.qualified_jobs || 0}</div>
          <p className="text-[11px] text-slate-500">High Match</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Send className="w-3.5 h-3.5 text-blue-400" /> Outreach Sent
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.emails_sent || 0}</div>
          <p className="text-[11px] text-slate-500">{s?.emails_awaiting_approval || 0} awaiting approval</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Response Rate
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.response_rate_percent || 0}%</div>
          <p className="text-[11px] text-slate-500">{s?.responses_received || 0} replies</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Interviews
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.interviews_scheduled || 0}</div>
          <p className="text-[11px] text-slate-500">Screens & Rounds</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Offers
          </span>
          <div className="text-2xl font-extrabold text-white">{s?.offers_received || 0}</div>
          <p className="text-[11px] text-slate-500">Career Targets</p>
        </div>
      </div>

      {/* Main Grid: Funnel Visualization + Follow-up Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Funnel */}
        <section className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Stage-by-Stage Progression Funnel
            </h3>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Avg Target: ${(s?.avg_target_salary || 190000).toLocaleString()}/yr
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {data?.funnel_stages
              .filter((st) => st.count > 0 || ['DISCOVERED', 'QUALIFIED', 'SENT', 'SCREENING', 'OFFER'].includes(st.stage))
              .map((st) => {
                const pct = Math.max(Math.round((st.count / maxCount) * 100), 4);
                return (
                  <div key={st.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">{st.label}</span>
                      <span className="text-indigo-400 font-mono font-semibold">{st.count}</span>
                    </div>
                    <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Follow-up Alerts & Pending Inquiries */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Follow-up Alerts (5+ Days)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              {data?.pending_followups.length || 0}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {data?.pending_followups.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p className="text-xs text-slate-400">All outbound communications are up to date. No stale threads.</p>
              </div>
            ) : (
              data?.pending_followups.map((item) => (
                <div
                  key={item.outreach_id}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{item.company_name}</span>
                    <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.days_since_sent}d ago
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{item.job_title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Contact: {item.recruiter_name}</span>
                    <a
                      href="/outreach"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      Draft Follow-up <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnalyticsPage;
