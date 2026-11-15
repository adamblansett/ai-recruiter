import { useState, useEffect, type FormEvent } from 'react';
import { 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Compass, 
  ExternalLink, 
  Globe, 
  Plus, 
  Search, 
  Sparkles, 
  X, 
  AlertTriangle, 
  Cpu 
} from 'lucide-react';

interface JobOpportunity {
  id: string;
  company_name: string | null;
  company_domain: string | null;
  title: string;
  location: string;
  remote_type: string;
  employment_type: string;
  min_salary: number | null;
  max_salary: number | null;
  currency: string;
  source_adapter: string;
  source_url: string;
  raw_description: string;
  pipeline_stage: string;
  discovered_at: string;
}

interface DiscoveryResult {
  discovered_count: number;
  new_ingested_count: number;
  duplicate_count: number;
  sources_polled: string[];
}

interface EvaluationResult {
  id: string;
  overall_score: number;
  technical_match_score: number;
  seniority_fit_score: number;
  compensation_fit_score: number | null;
  recommendation: string;
  mandatory_skills_met: string[];
  preferred_skills_met: string[];
  missing_qualifications: string[];
  strengths: string[];
  potential_concerns: string[];
  rationale_markdown: string;
  ai_provider: string;
  ai_model: string;
}

export function JobsPage() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [discovering, setDiscovering] = useState<boolean>(false);
  const [discoveryMsg, setDiscoveryMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [stageFilter, setStageFilter] = useState('');

  // Manual Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualSalary, setManualSalary] = useState(180000);

  // Evaluation Modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluatingJobTitle, setEvaluatingJobTitle] = useState<string>('');

  useEffect(() => {
    fetchJobs();
  }, [remoteOnly, stageFilter]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('query', searchTerm.trim());
      if (remoteOnly) params.append('remote_only', 'true');
      if (stageFilter) params.append('pipeline_stage', stageFilter);

      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerDiscovery() {
    try {
      setDiscovering(true);
      const res = await fetch('/api/v1/jobs/discover', { method: 'POST' });
      if (!res.ok) throw new Error('Discovery run failed');
      const result: DiscoveryResult = await res.json();
      setDiscoveryMsg(
        `Discovery complete! ${result.new_ingested_count} new opportunities ingested (${result.duplicate_count} duplicates deduplicated).`
      );
      setTimeout(() => setDiscoveryMsg(null), 5000);
      fetchJobs();
    } catch (err) {
      setDiscoveryMsg('Discovery failed. Check backend logs.');
    } finally {
      setDiscovering(false);
    }
  }

  async function handleEvaluateJob(job: JobOpportunity) {
    try {
      setEvaluatingId(job.id);
      setEvaluatingJobTitle(job.title);
      const res = await fetch('/api/v1/evaluations/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const evalData: EvaluationResult = await res.json();
      setActiveEvaluation(evalData);
      setEvalModalOpen(true);
      fetchJobs();
    } catch (err) {
      alert('Error running AI evaluation.');
    } finally {
      setEvaluatingId(null);
    }
  }

  async function handleStageChange(jobId: string, newStage: string) {
    try {
      const res = await fetch(`/api/v1/jobs/${jobId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: newStage }),
      });
      if (!res.ok) throw new Error('Failed to update stage');
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (!manualTitle || !manualCompany || !manualUrl || !manualDesc) return;

    try {
      const res = await fetch('/api/v1/jobs/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          company_name: manualCompany.trim(),
          source_url: manualUrl.trim(),
          raw_description: manualDesc.trim(),
          min_salary: Number(manualSalary),
          remote_type: 'REMOTE',
          employment_type: 'FULL_TIME',
          location: 'United States (Remote)',
        }),
      });
      if (!res.ok) throw new Error('Failed to add job');
      setModalOpen(false);
      setManualTitle('');
      setManualCompany('');
      setManualUrl('');
      setManualDesc('');
      fetchJobs();
    } catch (err) {
      alert('Error adding opportunity.');
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Discovery Alert */}
      {discoveryMsg && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>{discoveryMsg}</span>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Job Discovery & Opportunities Pipeline
          </h2>
          <p className="text-sm text-slate-400">
            Automated aggregation across Greenhouse, Lever, and remote feeds with built-in AI evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Manually
          </button>
          <button
            onClick={handleTriggerDiscovery}
            disabled={discovering}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-4 h-4" /> {discovering ? 'Discovering...' : 'Discover Jobs Now'}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search role title, technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
            />
            Remote Only
          </label>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Pipeline Stages</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="EVALUATED">Evaluated</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="OUTREACH_DRAFTED">Outreach Drafted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading opportunities...</div>
      ) : jobs.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No opportunities found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Discover Jobs Now" to automatically scrape configured Greenhouse, Lever, and remote feeds, or add one manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg shadow-black/20"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{job.title}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{job.company_name || 'Confidential'}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-bold whitespace-nowrap ${
                    job.pipeline_stage === 'EVALUATED'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : job.pipeline_stage === 'QUALIFIED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {job.pipeline_stage}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {job.raw_description}
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-500" /> {job.location}
                  </span>
                  {job.min_salary && (
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${job.min_salary.toLocaleString()}
                      {job.max_salary ? ` - $${job.max_salary.toLocaleString()}` : '+'}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                    {job.source_adapter}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                  >
                    View Original <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEvaluateJob(job)}
                      disabled={evaluatingId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {evaluatingId === job.id ? 'Evaluating...' : 'Evaluate with AI'}
                    </button>
                    {job.pipeline_stage !== 'QUALIFIED' && (
                      <button
                        onClick={() => handleStageChange(job.id, 'QUALIFIED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
                      >
                        Qualify
                      </button>
                    )}
                    {job.pipeline_stage !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleStageChange(job.id, 'ARCHIVED')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Evaluation Review Modal */}
      {evalModalOpen && activeEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">AI Evaluation Breakdown</span>
                <h3 className="text-xl font-bold text-white">{evaluatingJobTitle}</h3>
              </div>
              <button onClick={() => setEvalModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Recommendation Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Match Suitability</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-extrabold ${
                    activeEvaluation.overall_score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activeEvaluation.overall_score}%
                  </span>
                  <span className="text-xs text-slate-500">overall match</span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-xs text-slate-400">AI Recommendation</span>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    activeEvaluation.recommendation === 'STRONG_APPLY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : activeEvaluation.recommendation === 'APPLY'
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {activeEvaluation.recommendation.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase">Technical Fit</span>
                <p className="text-base font-bold text-white">{activeEvaluation.technical_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase">Seniority Fit</span>
                <p className="text-base font-bold text-white">{activeEvaluation.seniority_fit_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase">Compensation</span>
                <p className="text-base font-bold text-white">
                  {activeEvaluation.compensation_fit_score ? `${activeEvaluation.compensation_fit_score}%` : 'Aligned'}
                </p>
              </div>
            </div>

            {/* Skills Matched */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Matched Core Qualifications
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeEvaluation.mandatory_skills_met.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Potential Concerns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {activeEvaluation.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Considerations
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {activeEvaluation.potential_concerns.map((con, idx) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer with Engine Info */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                Built-in AI • {activeEvaluation.ai_model} (0 keys required)
              </span>
              <button
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Ingestion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add Opportunity Manually
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Job Title (e.g. Staff Backend Engineer)"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Company Name (e.g. Stripe, Anthropic)"
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="url"
                placeholder="Job Posting URL"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Target / Listed Minimum Compensation ($)"
                value={manualSalary}
                onChange={(e) => setManualSalary(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Paste Job Description / Requirements..."
                rows={5}
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
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
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;
