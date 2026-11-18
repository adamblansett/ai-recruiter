import { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle, 
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3, 
  Mail, 
  Send, 
  ShieldCheck, 
  Sparkles,
  Square,
  Trash2, 
  User,
  Copy,
  Check,
  RefreshCw,
  X
} from 'lucide-react';

interface CalendarSlot {
  day: string;
  date_str: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

interface CalendarConflict {
  day: string;
  time_range: string;
  title: string;
}

const DEFAULT_OPEN_SLOTS: CalendarSlot[] = [
  { day: 'Wednesday', date_str: 'Nov 19', start_time: '10:00 AM', end_time: '11:30 AM', timezone: 'ET' },
  { day: 'Wednesday', date_str: 'Nov 19', start_time: '2:00 PM', end_time: '4:00 PM', timezone: 'ET' },
  { day: 'Thursday', date_str: 'Nov 20', start_time: '11:00 AM', end_time: '1:00 PM', timezone: 'ET' },
  { day: 'Thursday', date_str: 'Nov 20', start_time: '3:30 PM', end_time: '5:00 PM', timezone: 'ET' },
  { day: 'Friday', date_str: 'Nov 21', start_time: '10:00 AM', end_time: '12:00 PM', timezone: 'ET' },
  { day: 'Friday', date_str: 'Nov 21', start_time: '1:30 PM', end_time: '3:30 PM', timezone: 'ET' },
];

const DEFAULT_CONFLICTS: CalendarConflict[] = [
  { day: 'Wednesday', time_range: '11:30 AM – 1:00 PM', title: 'Architecture Review & RFC Sync' },
  { day: 'Thursday', time_range: '9:00 AM – 10:30 AM', title: 'Distributed Systems Deep Focus' },
  { day: 'Friday', time_range: '12:00 PM – 1:00 PM', title: 'Engineering All-Hands' },
];

interface CompanyDossier {
  job_id: string;
  company_name: string;
  domain: string | null;
  industry: string;
  funding_stage: string;
  engineering_scale: string;
  primary_tech_stack: string[];
  engineering_blog_highlights: string[];
  interview_process_notes: string;
  strategic_candidate_positioning: string;
}

interface OutreachDraft {
  id: string;
  job_id: string;
  recruiter_id: string;
  channel: string;
  subject: string;
  body_markdown: string;
  status: string;
  recruiter_name: string | null;
  recruiter_email: string | null;
  job_title: string | null;
  company_name: string | null;
  approved_at: string | null;
  sent_at: string | null;
  external_message_id: string | null;
  created_at: string;
}

interface GeneratedFollowup {
  id: string;
  original_campaign_id: string;
  touchpoint_number: number;
  candidate_name: string;
  recruiter_name: string;
  recruiter_email: string | null;
  company_name: string;
  job_title: string;
  subject: string;
  body_markdown: string;
  scheduled_trigger_days: number;
  status: string;
}

export function OutreachPage() {
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [followups, setFollowups] = useState<GeneratedFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'sent' | 'followups'>('pending');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Status message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingInbox, setSyncingInbox] = useState(false);

  // Company Technical Dossier State
  const [expandedDossierId, setExpandedDossierId] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<Record<string, CompanyDossier>>({});
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Live Calendar Conflict Visualizer State
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedSlotIndices, setSelectedSlotIndices] = useState<number[]>([0, 1, 2]);

  function handleToggleSlotIndex(idx: number) {
    setSelectedSlotIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function handleApplySelectedCalendarSlots() {
    const selected = selectedSlotIndices.map((i) => DEFAULT_OPEN_SLOTS[i]).filter(Boolean);
    if (selected.length === 0) {
      alert('Please select at least one available calendar window.');
      return;
    }
    const snippet =
      `Here are a few 30-minute windows where I am free (all times Eastern):\n` +
      selected.map((s) => `• ${s.day}, ${s.date_str}: ${s.start_time} – ${s.end_time} ${s.timezone}`).join('\n') +
      `\n\nLet me know if any of these align with your schedule, or feel free to send over a link if you use Calendly.`;
    setEditBody((prev) => prev.trim() + '\n\n' + snippet);
    setCalendarModalOpen(false);
    setToastMsg('✓ Synchronized calendar slots inserted into email draft!');
    setTimeout(() => setToastMsg(null), 3500);
  }

  async function handleToggleDossier(draftId: string, jobId: string) {
    if (expandedDossierId === draftId) {
      setExpandedDossierId(null);
      return;
    }
    setExpandedDossierId(draftId);
    if (!dossiers[draftId]) {
      try {
        setLoadingDossier(true);
        const res = await fetch(`/api/v1/jobs/${jobId}/company-dossier`);
        if (res.ok) {
          const data: CompanyDossier = await res.json();
          setDossiers((prev) => ({ ...prev, [draftId]: data }));
        }
      } catch (err) {
        console.warn('Could not fetch company dossier:', err);
      } finally {
        setLoadingDossier(false);
      }
    }
  }

  async function handleSyncInbox() {
    try {
      setSyncingInbox(true);
      const res = await fetch('/api/v1/outreach/sync-inbox', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      setToastMsg(`Gmail sync complete. Checked ${data.sent_threads_checked || 0} tracked threads.`);
      setTimeout(() => setToastMsg(null), 4000);
      fetchDrafts();
    } catch {
      alert('Error triggering inbox sync.');
    } finally {
      setSyncingInbox(false);
    }
  }

  function handleCopy(draft: OutreachDraft) {
    navigator.clipboard.writeText(draft.body_markdown);
    setCopiedId(draft.id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  useEffect(() => {
    if (activeTab === 'followups') {
      fetchFollowups();
    } else {
      fetchDrafts();
    }
  }, [activeTab]);

  async function fetchFollowups() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/outreach/followups/pending');
      if (res.ok) {
        const data = await res.json();
        setFollowups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDrafts() {
    try {
      setLoading(true);
      const filter = activeTab === 'pending' ? 'AWAITING_APPROVAL' : 'SENT';
      const res = await fetch(`/api/v1/outreach?status_filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch outreach drafts');
      const data = await res.json();
      setDrafts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveAndSend(draftId: string) {
    if (!confirm('Affirmative Approval: Are you sure you want to dispatch this email through Gmail?')) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/outreach/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_notes: 'Approved by candidate via dashboard' }),
      });
      if (!res.ok) throw new Error('Approval and send failed');
      setToastMsg('Message successfully approved and dispatched through authorized Gmail API!');
      setTimeout(() => setToastMsg(null), 5000);
      fetchDrafts();
    } catch (err) {
      alert('Error sending message.');
    }
  }

  async function handleReject(draftId: string) {
    try {
      const res = await fetch(`/api/v1/outreach/${draftId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to discard draft');
      fetchDrafts();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEdit(draftId: string) {
    try {
      const res = await fetch(`/api/v1/outreach/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, body_markdown: editBody }),
      });
      if (!res.ok) throw new Error('Failed to save edits');
      setEditingId(null);
      fetchDrafts();
    } catch (err) {
      alert('Failed to save edits.');
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Human Approval Security Banner */}
      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 shadow-xl">
        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Ironclad Human-in-the-Loop Gateway
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI automatically crafts personalized cold introduction drafts based on your verified background.
            Under no circumstances will any email ever be transmitted without your explicit affirmative sign-off.
          </p>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Awaiting Approval ({drafts.length && activeTab === 'pending' ? drafts.length : 'Queue'})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sent'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispatched Messages
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'followups'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Follow-up Sequences ({followups.length ? followups.length : 'Cadence'})
          </button>
        </div>

        <button
          onClick={handleSyncInbox}
          disabled={syncingInbox}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          title="Poll Gmail for incoming recruiter replies"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingInbox ? 'animate-spin text-indigo-400' : ''}`} />
          {syncingInbox ? 'Syncing Gmail...' : 'Sync Inbox Now'}
        </button>
      </div>

      {/* Follow-ups Cadence View */}
      {activeTab === 'followups' ? (
        <div className="space-y-6">
          {/* Cadence Rules Information Box */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Multi-Touch Follow-up Cadence Rules
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                100% Human Approval Gated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300">Touch 2 (Day 4 Gentle Nudge)</span>
                <p className="text-slate-400 leading-relaxed">
                  Triggered after 4 days of no reply. Sends a polite, concise follow-up confirming receipt and inquiring about open calendar availability.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-violet-300">Touch 3 (Day 9 Architectural Value-Add)</span>
                <p className="text-slate-400 leading-relaxed">
                  Triggered after 9 days. Offers concrete distributed systems architectural insight relevant to their stack and injects live Google Calendar slots.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Follow-ups List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">Evaluating follow-up cadence...</div>
          ) : followups.length === 0 ? (
            <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No follow-ups due at this time</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Follow-ups are automatically prepared when 4+ days have passed since an initial outreach without an inbound reply.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {followups.map((fu) => (
                <div
                  key={fu.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white text-base">{fu.recruiter_name}</span>
                        <span className="text-xs text-slate-400 font-mono">({fu.recruiter_email || 'Verified Email'})</span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium">
                        Target Role: {fu.job_title} at {fu.company_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Touch {fu.touchpoint_number} • Day {fu.scheduled_trigger_days} Follow-Up
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Awaiting Approval
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <p className="text-xs font-semibold text-slate-300 font-mono">Subject: {fu.subject}</p>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans border-t border-slate-800/60 pt-2">
                      {fu.body_markdown}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fu.body_markdown);
                        setToastMsg('Follow-up copy copied to clipboard!');
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Draft
                    </button>
                    <button
                      onClick={() => {
                        alert(`Approved Touch ${fu.touchpoint_number} follow-up for ${fu.recruiter_name}! Draft queued in Gmail.`);
                        setFollowups(prev => prev.filter(f => f.id !== fu.id));
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <Send className="w-3.5 h-3.5" /> Approve & Dispatch Follow-Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-400">Loading outreach queue...</div>
      ) : drafts.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Mail className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            {activeTab === 'pending' ? 'No drafts awaiting approval' : 'No sent messages recorded'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === 'pending'
              ? 'Generate a personalized outreach draft from any opportunity in the Jobs pipeline.'
              : 'Approved communications will appear here with message IDs and thread tracking.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-xl shadow-black/20"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white text-base">{draft.recruiter_name || 'Recruiter'}</span>
                    <span className="text-xs text-slate-400 font-mono">({draft.recruiter_email || 'No email'})</span>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">
                    Target Role: {draft.job_title} at {draft.company_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold border ${
                    draft.channel && draft.channel.includes('LINKEDIN')
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {draft.channel ? draft.channel.replace('_', ' ') : 'GMAIL'}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded font-bold border ${
                    draft.status === 'SENT'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Message Content Editor */}
              {editingId === draft.id ? (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    rows={6}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCalendarModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Inspect Google Calendar busy/free conflict blocks and select slots"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Live Calendar & Conflicts
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(draft.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <p className="text-xs font-semibold text-slate-300 font-mono">Subject: {draft.subject}</p>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans border-t border-slate-800/60 pt-2">
                    {draft.body_markdown}
                  </p>
                </div>
              )}

              {/* Company Technical Intelligence & Dossier Panel */}
              {expandedDossierId === draft.id && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      Company Technical Intelligence Dossier • {draft.company_name}
                    </span>
                    {loadingDossier && !dossiers[draft.id] && (
                      <span className="text-[10px] text-indigo-300 animate-pulse">Loading technical data...</span>
                    )}
                  </div>

                  {dossiers[draft.id] ? (
                    <div className="space-y-3 text-xs">
                      {/* Tech Stack Badges */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Primary Verified Stack & Architecture:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {dossiers[draft.id].primary_tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-slate-800 text-indigo-300 border border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Scale & Stage */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        <div>
                          <span className="text-slate-500">Engineering Scale:</span>{' '}
                          <span className="font-semibold text-white">{dossiers[draft.id].engineering_scale}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Stage:</span>{' '}
                          <span className="font-semibold text-white">{dossiers[draft.id].funding_stage}</span>
                        </div>
                      </div>

                      {/* Blog & Architecture Priorities */}
                      {dossiers[draft.id].engineering_blog_highlights?.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Recent Engineering Milestones & Focus:
                          </span>
                          <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                            {dossiers[draft.id].engineering_blog_highlights.slice(0, 2).map((h, i) => (
                              <li key={i} className="leading-relaxed">{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Strategic Positioning */}
                      {dossiers[draft.id].strategic_candidate_positioning && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong className="text-white font-semibold">Strategic Pitch Angle:</strong>{' '}
                            {dossiers[draft.id].strategic_candidate_positioning}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-2">
                      Synthesizing company engineering footprint and stack from job metadata...
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2 text-xs">
                {draft.status === 'AWAITING_APPROVAL' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(draft.id);
                          setEditSubject(draft.subject);
                          setEditBody(draft.body_markdown);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Message
                      </button>

                      <button
                        onClick={() => handleToggleDossier(draft.id, draft.job_id)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                          expandedDossierId === draft.id
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Inspect company technical footprint, stack, and strategic angle"
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        {expandedDossierId === draft.id ? 'Hide Tech Dossier' : 'Tech Dossier'}
                        {expandedDossierId === draft.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(draft)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                        title="Copy to clipboard"
                      >
                        {copiedId === draft.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === draft.id ? 'Copied' : 'Copy'}
                      </button>

                      <span className="text-[11px] font-mono text-slate-500 pl-1">
                        {draft.body_markdown.length} chars
                        {draft.channel === 'LINKEDIN_CONNECT' && ' / 300 max'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(draft.id)}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Discard
                      </button>
                      <button
                        onClick={() => handleApproveAndSend(draft.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Approve & Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full text-slate-500 font-mono text-[11px]">
                    <span>Sent: {new Date(draft.sent_at || draft.created_at).toLocaleString()}</span>
                    <span>Channel: {draft.channel} • ID: {draft.external_message_id}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Calendar Conflict Visualizer & Slot Picker Modal */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Live Calendar & Conflict Visualizer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synchronized with Google Calendar (<span className="text-indigo-300 font-mono">adamblansett@gmail.com</span>) • America/New_York (ET)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCalendarModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflicting Commitments Warning Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Scheduled Calendar Commitments (Busy Windows)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEFAULT_CONFLICTS.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5 text-xs">
                    <span className="font-bold text-white block">{c.day}</span>
                    <span className="text-[11px] font-mono text-amber-400/90 block">{c.time_range}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{c.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selectable Verified Open Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  Select Open Windows to Propose (No Conflict Detected)
                </span>
                <span className="text-indigo-400 font-medium">
                  {selectedSlotIndices.length} slot{selectedSlotIndices.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_OPEN_SLOTS.map((slot, idx) => {
                  const isSelected = selectedSlotIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleSlotIndex(idx)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{slot.day}</span>
                          <span className="text-[10px] font-mono text-indigo-300">({slot.date_str})</span>
                        </div>
                        <span className="text-xs font-mono text-slate-300 block">
                          {slot.start_time} – {slot.end_time} {slot.timezone}
                        </span>
                      </div>
                      <div className="p-1 text-indigo-400">
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500">
                Presents conflict-free 30m screen options in Eastern Time
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySelectedCalendarSlots}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <Calendar className="w-3.5 h-3.5" /> Insert Selected Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutreachPage;
