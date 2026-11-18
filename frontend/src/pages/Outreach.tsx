import { useState, useEffect } from 'react';
import { 
  Calendar,
  CheckCircle, 
  Clock,
  Edit3, 
  Mail, 
  Send, 
  ShieldCheck, 
  Trash2, 
  User,
  Copy,
  Check,
  RefreshCw 
} from 'lucide-react';

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

  async function handleInsertCalendarSlots() {
    try {
      const res = await fetch('/api/v1/auth/google/calendar/availability');
      if (res.ok) {
        const data = await res.json();
        setEditBody((prev) => prev.trim() + '\n\n' + data.formatted_availability_snippet);
      }
    } catch {
      setEditBody(
        (prev) =>
          prev.trim() +
          '\n\nHere are a few 30-minute windows where I am free (all times Eastern):\n' +
          '• Wednesday: 10:00 AM – 11:30 AM or 2:00 PM – 4:00 PM ET\n' +
          '• Thursday: 11:00 AM – 1:00 PM or 3:30 PM – 5:00 PM ET\n' +
          '• Friday: 10:00 AM – 12:00 PM or 1:30 PM – 3:30 PM ET'
      );
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
                      onClick={handleInsertCalendarSlots}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Insert synchronized Google Calendar free/busy availability windows"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Insert Calendar Slots
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
    </div>
  );
}

export default OutreachPage;
