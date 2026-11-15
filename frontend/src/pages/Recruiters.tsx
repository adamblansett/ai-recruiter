import { useState, useEffect, type FormEvent } from 'react';
import { 
  Building, 
  ExternalLink, 
  Mail, 
  Plus, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  X 
} from 'lucide-react';

interface RecruiterContact {
  id: string;
  contact_type: string;
  contact_value: string;
  is_verified: boolean;
  verification_method: string | null;
  confidence_score: number;
}

interface Recruiter {
  id: string;
  company_id: string | null;
  company_name: string | null;
  full_name: string;
  title: string;
  recruiter_type: string;
  linkedin_url: string | null;
  public_profile_url: string | null;
  source_of_discovery: string;
  notes: string | null;
  contacts: RecruiterContact[];
}

export function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recruiterType, setRecruiterType] = useState('INTERNAL_TA');
  const [initialEmail, setInitialEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Add Contact Modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [targetRecruiterId, setTargetRecruiterId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  async function fetchRecruiters() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      const res = await fetch(`/api/v1/recruiters?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch recruiters');
      const data = await res.json();
      setRecruiters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRecruiter(e: FormEvent) {
    e.preventDefault();
    if (!fullName || !title || !companyName) return;

    try {
      const res = await fetch('/api/v1/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          title: title.trim(),
          company_name: companyName.trim(),
          recruiter_type: recruiterType,
          initial_email: initialEmail.trim() || undefined,
          linkedin_url: linkedinUrl.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create recruiter');
      setModalOpen(false);
      setFullName('');
      setTitle('');
      setCompanyName('');
      setInitialEmail('');
      setLinkedinUrl('');
      fetchRecruiters();
    } catch (err) {
      alert('Error creating recruiter record.');
    }
  }

  async function handleAddContact(e: FormEvent) {
    e.preventDefault();
    if (!targetRecruiterId || !newEmail.trim()) return;

    try {
      setVerifying(true);
      const res = await fetch(`/api/v1/recruiters/${targetRecruiterId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_type: 'EMAIL',
          contact_value: newEmail.trim(),
        }),
      });
      if (!res.ok) throw new Error('Verification failed');
      setContactModalOpen(false);
      setNewEmail('');
      setTargetRecruiterId(null);
      fetchRecruiters();
    } catch (err) {
      alert('Error verifying contact.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Recruiter Discovery & Contact Verification
          </h2>
          <p className="text-sm text-slate-400">
            Identify hiring managers and talent partners with evidence-based DNS MX-record verification.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition"
        >
          <UserPlus className="w-4 h-4" /> Add Recruiter
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by recruiter name, title, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRecruiters()}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Recruiter Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading recruiters...</div>
      ) : recruiters.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No recruiters identified yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add contacts manually or run automated company discovery to locate talent specialists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg shadow-black/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{r.full_name}</h3>
                    <p className="text-xs text-slate-300 font-medium">{r.title}</p>
                    <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" /> {r.company_name || 'Independent Agency'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {r.recruiter_type.replace('_', ' ')}
                  </span>
                </div>

                {/* Contact List */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Verified Contacts
                  </span>
                  {r.contacts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No contact details yet.</p>
                  ) : (
                    r.contacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-mono text-slate-200 truncate">{c.contact_value}</span>
                        </div>
                        {c.is_verified ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" /> {(c.confidence_score * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium whitespace-nowrap bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                {r.linkedin_url ? (
                  <a
                    href={r.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-600 text-[11px]">No public link</span>
                )}

                <button
                  onClick={() => {
                    setTargetRecruiterId(r.id);
                    setContactModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Recruiter Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Add Professional Recruiter
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecruiter} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name (e.g. Elena Rostova)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Title (e.g. Lead Technical Recruiter)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Company Name (e.g. OpenAI, Stripe)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <select
                value={recruiterType}
                onChange={(e) => setRecruiterType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="INTERNAL_TA">Internal Talent Acquisition</option>
                <option value="HIRING_MANAGER">Engineering Hiring Manager</option>
                <option value="AGENCY_RECRUITER">External Agency Recruiter</option>
              </select>
              <input
                type="email"
                placeholder="Work Email (Triggers DNS MX verification)"
                value={initialEmail}
                onChange={(e) => setInitialEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                placeholder="LinkedIn Profile URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
                >
                  Save Recruiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Add & Verify Email Contact
              </h3>
              <button onClick={() => setContactModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <input
                type="email"
                placeholder="Recruiter Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Contact will be validated against RFC 5322 syntax and authoritative DNS MX records before being verified.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify & Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruitersPage;
