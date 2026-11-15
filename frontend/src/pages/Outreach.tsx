import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Edit3, 
  Mail, 
  Send, 
  ShieldCheck, 
  Trash2, 
  User 
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

export function OutreachPage() {
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Status message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, [activeTab]);

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
        </div>
      </div>

      {/* Drafts List */}
      {loading ? (
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

                <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded font-bold border ${
                  draft.status === 'SENT'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {draft.status.replace('_', ' ')}
                </span>
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
                  <div className="flex items-center justify-end gap-2">
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
                        <Send className="w-3.5 h-3.5" /> Approve & Send via Gmail
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full text-slate-500 font-mono text-[11px]">
                    <span>Sent: {new Date(draft.sent_at || draft.created_at).toLocaleString()}</span>
                    <span>Gmail ID: {draft.external_message_id}</span>
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
