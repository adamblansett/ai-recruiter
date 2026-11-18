import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Check, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  UserCheck, 
  AlertCircle,
  Mail,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Download,
  Bookmark,
  Copy
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  years_experience: number;
  proficiency_level: string;
  is_primary: boolean;
}

interface Resume {
  id: string;
  label: string;
  file_hash: string;
  file_size_bytes: number;
  is_primary: boolean;
  created_at: string;
}

interface ProfileDetail {
  id: string;
  headline: string;
  summary: string;
  target_seniority: string;
  location_base: string;
  remote_preference: string;
  target_min_salary: number | null;
  preferred_currency: string;
  skills: Skill[];
  resumes: Resume[];
}

interface GmailStatus {
  is_connected: boolean;
  configured_in_env: boolean;
  client_id_present: boolean;
  connected_email?: string;
  last_authenticated_at?: string;
  scopes: string[];
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Gmail status state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [connectingGmail, setConnectingGmail] = useState(false);

  // New Skill state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');
  const [newSkillYears, setNewSkillYears] = useState(5.0);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState('');
  const [resumeIsPrimary, setResumeIsPrimary] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Preferences state
  const [minSalary, setMinSalary] = useState<number>(185000);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  useEffect(() => {
    loadProfile();
    loadGmailStatus();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/candidate/profile');
      if (!res.ok) throw new Error('Failed to load candidate profile');
      const data = await res.json();
      setProfile(data);
      if (data.target_min_salary) {
        setMinSalary(data.target_min_salary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function loadGmailStatus() {
    try {
      const res = await fetch('/api/v1/auth/google/status');
      if (res.ok) {
        const data = await res.json();
        setGmailStatus(data);
      }
    } catch {
      // Ignored during initial offline mount
    }
  }

  async function handleConnectGmail() {
    try {
      setConnectingGmail(true);
      const res = await fetch('/api/v1/auth/google/url');
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        alert(data.message || 'Google OAuth is not configured with client ID.');
      }
    } catch (err) {
      alert('Error initiating Google OAuth');
    } finally {
      setConnectingGmail(false);
    }
  }

  async function handleDisconnectGmail() {
    if (!confirm('Are you sure you want to disconnect Gmail?')) return;
    try {
      const res = await fetch('/api/v1/auth/google/disconnect', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Gmail disconnected');
        loadGmailStatus();
      }
    } catch {
      alert('Failed to disconnect Gmail');
    }
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    try {
      setSavingPrefs(true);
      const res = await fetch(`/api/v1/candidate/profile/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_min_salary: Number(minSalary),
        }),
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      setSuccessMsg('Target preferences updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadProfile();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleExportData() {
    try {
      const res = await fetch('/api/v1/candidate/export/all');
      if (!res.ok) throw new Error('Failed to export data');
      const exportJson = await res.json();
      const blob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adam_blansett_career_data_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setSuccessMsg('Candidate data archive downloaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      alert('Failed to export candidate records');
    }
  }

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newSkillName.trim()) return;

    try {
      const res = await fetch(`/api/v1/candidate/profile/${profile.id}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName.trim(),
          category: newSkillCategory,
          years_experience: Number(newSkillYears),
          proficiency_level: 'EXPERT',
          is_primary: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to add skill');
      setNewSkillName('');
      setSuccessMsg('Skill added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDeleteSkill(skillId: string) {
    if (!profile) return;
    try {
      const res = await fetch(`/api/v1/candidate/profile/${profile.id}/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete skill');
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleResumeUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !resumeFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('label', resumeLabel || resumeFile.name);
      formData.append('is_primary', String(resumeIsPrimary));

      const res = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to upload resume');
      }

      setResumeFile(null);
      setResumeLabel('');
      setSuccessMsg('Resume uploaded and verified successfully (SHA-256 registered).');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown upload error');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Adam Blansett</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="w-3.5 h-3.5" /> Verified Profile
              </span>
            </div>
            <p className="text-base font-medium text-indigo-400">{profile?.headline}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {profile?.target_seniority}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {profile?.remote_preference.replace('_', ' ')}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {profile?.location_base}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
          {profile?.summary}
        </p>
      </section>

      {/* Integrations & Target Criteria Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gmail & Outreach Integration */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              Gmail API Integration (OAuth 2.0)
            </h3>
            {gmailStatus?.is_connected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Not Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Enables creating drafts in your Gmail mailbox and dispatching approved outreach messages. All outbound emails require explicit human approval.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-white">
                {gmailStatus?.is_connected ? `Authorized (${gmailStatus.connected_email || 'adam.blansett@gmail.com'})` : 'Ready for OAuth'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Client ID Configured:</span>
              <span className="font-semibold text-slate-300">
                {gmailStatus?.client_id_present ? 'Yes (via .env)' : 'Default Sandbox / Ready'}
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              {gmailStatus?.is_connected ? (
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="px-4 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                >
                  Disconnect Gmail
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGmail}
                  disabled={connectingGmail}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow disabled:opacity-50"
                >
                  {connectingGmail ? 'Redirecting...' : 'Authorize Gmail OAuth'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Target Search & Criteria */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Target Opportunity Criteria
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Define baseline compensation, role seniority, and preferences used by the AI Evaluation Engine.
          </p>

          <form onSubmit={handleSavePreferences} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Minimum Target Base Salary (USD)
              </label>
              <input
                type="number"
                step="5000"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Target Seniority: <strong>Staff / Senior Engineer</strong></span>
              <span>Work Auth: <strong>US Citizen</strong></span>
            </div>
            <button
              type="submit"
              disabled={savingPrefs}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              {savingPrefs ? 'Saving...' : 'Update Opportunity Criteria'}
            </button>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Data Portability (GDPR/CCPA):</span>
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Data (JSON)
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Browser Clipper & Tools */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            One-Click Browser Clipper (Bookmarklet & Extension)
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            Chrome • Brave • Edge • Safari
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Clip job opportunities directly from LinkedIn, Indeed, Greenhouse, or Lever into your local AI Recruiter pipeline with a single click.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Instant JavaScript Bookmarklet</span>
            <button
              type="button"
              onClick={() => {
                const code = `javascript:(function(){const title=document.querySelector("h1")?.innerText.trim()||document.title.split("-")[0].trim();const url=window.location.href;const company=url.includes("greenhouse.io/")?url.split("greenhouse.io/")[1].split("/")[0]:(url.includes("lever.co/")?url.split("lever.co/")[1].split("/")[0]:prompt("Company Name:","Target Company"));if(!company)return;const desc=(document.querySelector(".job-description")||document.querySelector("main")||document.body).innerText.slice(0,3000);fetch("http://localhost:8000/api/v1/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,company_name:company,source_url:url,raw_description:desc,location:"United States (Remote)",remote_type:"REMOTE",min_salary:185000})}).then(r=>r.ok?alert("✓ Opportunity clipped to AI Recruiter!"):alert("Failed to clip. Is backend running?")).catch(e=>alert("Error connecting to http://localhost:8000"));})();`;
                navigator.clipboard.writeText(code);
                setCopiedBookmarklet(true);
                setTimeout(() => setCopiedBookmarklet(false), 2500);
              }}
              className="px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedBookmarklet ? 'Copied Bookmarklet Code' : 'Copy Bookmarklet Code'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Create a browser bookmark named <code className="text-indigo-300">⚡ Clip to AI Recruiter</code>, paste this code into the URL field, and click it on any job posting to ingest immediately. Extension files are also located in <code className="text-slate-400 font-mono">extensions/chrome/</code>.
          </p>
        </div>
      </section>

      {/* Two Column Layout: Skills & Resume Artifacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verified Skills Section */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Verified Technical Skills ({profile?.skills.length || 0})
            </h3>
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Add Verified Skill</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Skill (e.g. Python, Vault)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="AI_ML">AI & ML</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="Cloud">Cloud & DevOps</option>
              </select>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(Number(e.target.value))}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </form>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
            {profile?.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{skill.name}</span>
                    {skill.is_primary && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                        Core
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {skill.years_experience} yrs • {skill.category}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remove Skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Resumes & Document Storage */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Resume Documents ({profile?.resumes.length || 0})
            </h3>
          </div>

          {/* Resume Upload Form */}
          <form onSubmit={handleResumeUpload} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Upload PDF Resume</span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Resume Label (e.g. Senior Backend / AI Specialist)"
                value={resumeLabel}
                onChange={(e) => setResumeLabel(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                required
              />
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resumeIsPrimary}
                  onChange={(e) => setResumeIsPrimary(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                Mark as primary resume for default outreach
              </label>
            </div>
            <button
              type="submit"
              disabled={uploading || !resumeFile}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow disabled:opacity-50 transition"
            >
              <Upload className="w-4 h-4" /> {uploading ? 'Processing PDF...' : 'Upload & Parse Resume'}
            </button>
          </form>

          {/* Resumes List */}
          <div className="space-y-2">
            {profile?.resumes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No resumes uploaded yet.</p>
            ) : (
              profile?.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{resume.label}</span>
                      {resume.is_primary && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      SHA256: {resume.file_hash.slice(0, 16)}... • {(resume.file_size_bytes / 1024).toFixed(1)} KB
                    </p>
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

export default ProfilePage;
