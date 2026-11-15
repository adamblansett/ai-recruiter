import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Check, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  UserCheck, 
  AlertCircle 
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

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Skill state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');
  const [newSkillYears, setNewSkillYears] = useState(5.0);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLabel, setResumeLabel] = useState('');
  const [resumeIsPrimary, setResumeIsPrimary] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/candidate/profile');
      if (!res.ok) throw new Error('Failed to load candidate profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  }

  async function handleDeleteSkill(skillId: string) {
    try {
      const res = await fetch(`/api/v1/candidate/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete skill');
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  }

  async function handleResumeUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeFile || !resumeLabel.trim()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('label', resumeLabel.trim());
      formData.append('is_primary', String(resumeIsPrimary));

      const res = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to upload resume');
      }

      setResumeFile(null);
      setResumeLabel('');
      setSuccessMsg('Resume PDF uploaded and parsed successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading Candidate Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Adam Blansett</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Active Profile
              </span>
            </div>
            <p className="text-base text-indigo-300 font-medium">{profile?.headline}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              📍 {profile?.location_base}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              🌐 {profile?.remote_preference}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              💼 {profile?.target_seniority}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
          {profile?.summary}
        </p>
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
                <option value="Cloud">Cloud / DevOps</option>
                <option value="Database">Database</option>
              </select>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                placeholder="Years"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(parseFloat(e.target.value) || 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </form>

          {/* Skill List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {profile?.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{skill.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {skill.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {skill.years_experience} yrs experience • {skill.proficiency_level}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Resumes Section */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Resume Artifacts & Tailored Versions
          </h3>

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
