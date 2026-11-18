import { useState, useEffect, type FormEvent } from 'react';
import { 
  Award, 
  Briefcase, 
  Building2,
  CheckCircle2, 
  Compass, 
  ExternalLink, 
  Globe, 
  Layers,
  MessageSquare,
  Mic,
  MicOff,
  Plus, 
  Search, 
  Send,
  Sparkles, 
  Volume2,
  VolumeX,
  X, 
  AlertTriangle, 
  Cpu,
  BookOpen,
  Download,
  BarChart2,
  DollarSign,
  Copy,
  Check 
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

interface InterviewPrepQuestion {
  category: string;
  question: string;
  difficulty: string;
  talking_points: string[];
  relevant_experience_tie_in: string;
}

interface StarTalkingPoint {
  theme: string;
  situation_task: string;
  action: string;
  result: string;
  skills_demonstrated: string[];
}

interface ReverseInterviewQuestion {
  category: string;
  question: string;
  intended_insight: string;
}

interface InterviewPrepPlan {
  job_id: string;
  job_title: string;
  company_name: string;
  company_tech_focus: string;
  recommended_focus_areas: string[];
  technical_questions: InterviewPrepQuestion[];
  star_talking_points: StarTalkingPoint[];
  reverse_interview_questions: ReverseInterviewQuestion[];
}

interface ModelBenchmarkEntry {
  provider: string;
  model_name: string;
  overall_score: number;
  technical_score: number;
  recommendation: string;
  latency_ms: number;
  tokens_used: number;
  estimated_cost_usd: number;
  verdict_highlight: string;
}

interface ModelBenchmarkComparisonResponse {
  job_id: string;
  job_title: string;
  company_name: string;
  benchmarks: ModelBenchmarkEntry[];
  consensus_recommendation: string;
}

interface CounterTargets {
  target_base_salary: number;
  target_equity_annual: number;
  target_sign_on_bonus: number;
  target_first_year_tc: number;
}

interface OfferEvaluationResult {
  company_name: string;
  role_title: string;
  first_year_tc: number;
  recurring_annual_tc: number;
  baseline_diff_base: number;
  market_percentile: string;
  recommendation: string;
  verdict_summary: string;
  leverage_points: string[];
  counter_targets: CounterTargets;
  counter_offer_email_script: string;
  talking_points_phone: string[];
}

interface CompanyLeadership {
  name: string;
  role: string;
  background: string;
}

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
  leadership: CompanyLeadership[];
  strategic_candidate_positioning: string;
}

interface CompOfferPackage {
  id: string;
  company_name: string;
  role_title: string;
  stage: string;
  base_salary: number;
  equity_annual: number;
  equity_4yr_total: number;
  bonus_annual: number;
  sign_on: number;
  vesting_schedule: string;
  remote_stipend: number;
  learning_budget: number;
  match_401k: number;
}

const DEFAULT_OFFERS: CompOfferPackage[] = [
  {
    id: 'offer-1',
    company_name: 'Datadog',
    role_title: 'Staff Backend Engineer',
    stage: 'Public Enterprise',
    base_salary: 220000,
    equity_annual: 110000,
    equity_4yr_total: 440000,
    bonus_annual: 22000,
    sign_on: 35000,
    vesting_schedule: '25% 1-yr cliff, monthly thereafter',
    remote_stipend: 2400,
    learning_budget: 3000,
    match_401k: 10000,
  },
  {
    id: 'offer-2',
    company_name: 'Anthropic',
    role_title: 'Staff Systems & Infra',
    stage: 'Scaleup (Pre-IPO)',
    base_salary: 240000,
    equity_annual: 140000,
    equity_4yr_total: 560000,
    bonus_annual: 25000,
    sign_on: 45000,
    vesting_schedule: '25% 1-yr cliff, quarterly thereafter',
    remote_stipend: 3000,
    learning_budget: 5000,
    match_401k: 11000,
  },
  {
    id: 'offer-3',
    company_name: 'Stripe',
    role_title: 'Senior Staff Engineer',
    stage: 'High-Growth Enterprise',
    base_salary: 230000,
    equity_annual: 125000,
    equity_4yr_total: 500000,
    bonus_annual: 23000,
    sign_on: 40000,
    vesting_schedule: '1-yr cliff, 1/48 monthly',
    remote_stipend: 2500,
    learning_budget: 3500,
    match_401k: 10000,
  },
];

interface MockInterviewQuestion {
  session_id: string;
  job_id: string;
  company_name: string;
  job_title: string;
  interviewer_persona: string;
  track: string;
  round_number: number;
  question: string;
  scenario_context: string;
  recommended_focus_areas: string[];
}

interface MockAnswerEvaluation {
  session_id: string;
  round_number: number;
  overall_score: number;
  technical_rigor_score: number;
  tradeoff_depth_score: number;
  star_structure_score: number;
  verdict: string;
  strengths: string[];
  areas_for_improvement: string[];
  ideal_answer_outline: string;
  follow_up_question: string | null;
}

interface NegotiationOffer {
  base_salary: number;
  equity_annual: number;
  sign_on_bonus: number;
  first_year_tc: number;
}

interface NegotiationScenario {
  session_id: string;
  job_id: string;
  company_name: string;
  role_title: string;
  recruiter_persona: string;
  round_number: number;
  current_offer: NegotiationOffer;
  target_compensation: NegotiationOffer;
  recruiter_objection: string;
  tactical_hints: string[];
}

interface NegotiationEvaluation {
  session_id: string;
  round_number: number;
  leverage_score: number;
  firmness_score: number;
  value_optimization_score: number;
  overall_tactical_score: number;
  verdict: string;
  strengths: string[];
  tactical_critique: string[];
  model_counter_script: string;
  recruiter_counter_response: string;
  revised_offer: NegotiationOffer;
}

export function JobsPage() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [discovering, setDiscovering] = useState<boolean>(false);
  const [discoveryMsg, setDiscoveryMsg] = useState<string | null>(null);

  // Salary Negotiation Simulator State
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
  const [loadingNegotiation, setLoadingNegotiation] = useState(false);
  const [evaluatingNegotiation, setEvaluatingNegotiation] = useState(false);
  const [negotiationScenario, setNegotiationScenario] = useState<NegotiationScenario | null>(null);
  const [candidateCounterText, setCandidateCounterText] = useState('');
  const [negotiationEvaluation, setNegotiationEvaluation] = useState<NegotiationEvaluation | null>(null);

  // Mock Interview Roleplay State
  const [roleplayModalOpen, setRoleplayModalOpen] = useState(false);
  const [roleplayTrack, setRoleplayTrack] = useState('distributed_systems');
  const [activeRoleplayJob, setActiveRoleplayJob] = useState<JobOpportunity | null>(null);
  const [loadingRoleplay, setLoadingRoleplay] = useState(false);
  const [evaluatingRoleplay, setEvaluatingRoleplay] = useState(false);
  const [roleplayQuestion, setRoleplayQuestion] = useState<MockInterviewQuestion | null>(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [roleplayEvaluation, setRoleplayEvaluation] = useState<MockAnswerEvaluation | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Company Dossier Modal
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [activeDossier, setActiveDossier] = useState<CompanyDossier | null>(null);

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

  // Interview Prep Modal
  const [prepModalOpen, setPrepModalOpen] = useState(false);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [activePrep, setActivePrep] = useState<InterviewPrepPlan | null>(null);
  const [prepTab, setPrepTab] = useState<'questions' | 'star' | 'reverse'>('questions');

  // Tailored Resume state
  const [tailoringJobId, setTailoringJobId] = useState<string | null>(null);
  const [downloadingDossierId, setDownloadingDossierId] = useState<string | null>(null);

  // Benchmarks Modal
  const [benchmarkModalOpen, setBenchmarkModalOpen] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<ModelBenchmarkComparisonResponse | null>(null);
  const [loadingBenchmark, setLoadingBenchmark] = useState(false);

  // Offer Evaluation Modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerJob, setOfferJob] = useState<JobOpportunity | null>(null);
  const [offerBaseSalary, setOfferBaseSalary] = useState(195000);
  const [offerEquity, setOfferEquity] = useState(45000);
  const [offerBonus, setOfferBonus] = useState(25000);
  const [offerSignOn, setOfferSignOn] = useState(20000);
  const [evaluatingOffer, setEvaluatingOffer] = useState(false);
  const [offerResult, setOfferResult] = useState<OfferEvaluationResult | null>(null);
  const [copiedCounterScript, setCopiedCounterScript] = useState(false);

  // Multi-Offer Comparison Matrix State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compOffers] = useState<CompOfferPackage[]>(DEFAULT_OFFERS);
  const [activeCompYear, setActiveCompYear] = useState<1 | 4>(1);

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

  async function handleOpenInterviewPrep(job: JobOpportunity) {
    try {
      setLoadingPrep(true);
      setPrepModalOpen(true);
      const res = await fetch(`/api/v1/jobs/${job.id}/interview-prep`);
      if (!res.ok) throw new Error('Failed to load interview prep plan');
      const data: InterviewPrepPlan = await res.json();
      setActivePrep(data);
    } catch {
      alert('Failed to generate interview prep for this role.');
      setPrepModalOpen(false);
    } finally {
      setLoadingPrep(false);
    }
  }

  async function handleOpenCompanyDossier(job: JobOpportunity) {
    try {
      setLoadingDossier(true);
      setDossierModalOpen(true);
      const res = await fetch(`/api/v1/jobs/${job.id}/company-dossier`);
      if (!res.ok) throw new Error('Failed to load company dossier');
      const data: CompanyDossier = await res.json();
      setActiveDossier(data);
    } catch {
      alert('Failed to synthesize company dossier.');
      setDossierModalOpen(false);
    } finally {
      setLoadingDossier(false);
    }
  }

  async function handleStartRoleplay(job: JobOpportunity, track = roleplayTrack) {
    try {
      setActiveRoleplayJob(job);
      setRoleplayModalOpen(true);
      setLoadingRoleplay(true);
      setRoleplayEvaluation(null);
      setCandidateAnswer('');
      const res = await fetch(`/api/v1/jobs/${job.id}/mock-interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      });
      if (!res.ok) throw new Error('Failed to start interview roleplay session');
      const data: MockInterviewQuestion = await res.json();
      setRoleplayQuestion(data);
    } catch {
      alert('Error initializing interview simulation.');
    } finally {
      setLoadingRoleplay(false);
    }
  }

  async function handleSubmitRoleplayAnswer() {
    if (!roleplayQuestion || !activeRoleplayJob || !candidateAnswer.trim()) return;
    try {
      setEvaluatingRoleplay(true);
      const res = await fetch(`/api/v1/jobs/${activeRoleplayJob.id}/mock-interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: roleplayQuestion.session_id,
          round_number: roleplayQuestion.round_number,
          question: roleplayQuestion.question,
          answer_text: candidateAnswer.trim(),
        }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data: MockAnswerEvaluation = await res.json();
      setRoleplayEvaluation(data);
    } catch {
      alert('Error evaluating interview answer.');
    } finally {
      setEvaluatingRoleplay(false);
    }
  }

  function handleSpeakQuestion(text: string) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  }

  function handleToggleMic() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListeningMic(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCandidateAnswer((prev) => (prev ? prev.trim() + ' ' + transcript : transcript));
      };
      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  }

  async function handleStartNegotiation(job: JobOpportunity) {
    try {
      setNegotiationModalOpen(true);
      setLoadingNegotiation(true);
      setNegotiationEvaluation(null);
      setCandidateCounterText('');
      const res = await fetch(`/api/v1/jobs/${job.id}/negotiation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          company_name: job.company_name || 'Target Enterprise',
          role_title: job.title,
          initial_base: offerBaseSalary,
          initial_equity: offerEquity,
          initial_sign_on: offerSignOn,
        }),
      });
      if (!res.ok) throw new Error('Failed to start negotiation simulation');
      const data: NegotiationScenario = await res.json();
      setNegotiationScenario(data);
    } catch {
      alert('Error initializing negotiation simulation.');
    } finally {
      setLoadingNegotiation(false);
    }
  }

  async function handleSubmitNegotiationCounter() {
    if (!negotiationScenario || !candidateCounterText.trim()) return;
    try {
      setEvaluatingNegotiation(true);
      const res = await fetch(`/api/v1/jobs/${negotiationScenario.job_id}/negotiation/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: negotiationScenario.session_id,
          round_number: negotiationScenario.round_number,
          counter_text: candidateCounterText.trim(),
        }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data: NegotiationEvaluation = await res.json();
      setNegotiationEvaluation(data);
    } catch {
      alert('Error evaluating counter-proposal.');
    } finally {
      setEvaluatingNegotiation(false);
    }
  }

  async function handleDownloadTailoredResume(jobId: string) {
    try {
      setTailoringJobId(jobId);
      const res = await fetch(`/api/v1/jobs/${jobId}/tailored-resume/download`);
      if (!res.ok) throw new Error('Failed to generate tailored resume');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Adam_Blansett_Tailored_Resume.pdf`;
      a.click();
      setDiscoveryMsg('Tailored single-page PDF resume generated and downloaded successfully!');
      setTimeout(() => setDiscoveryMsg(null), 4000);
    } catch {
      alert('Error generating tailored PDF resume.');
    } finally {
      setTailoringJobId(null);
    }
  }

  async function handleDownloadExecutiveDossier(jobId: string, companyName?: string | null) {
    try {
      setDownloadingDossierId(jobId);
      const res = await fetch(`/api/v1/jobs/${jobId}/executive-dossier/download`);
      if (!res.ok) throw new Error('Failed to generate executive dossier');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Adam_Blansett_${(companyName || 'Target_Company').replace(/\s+/g, '_')}_Executive_Dossier.pdf`;
      a.click();
      setDiscoveryMsg('Executive Architectural Dossier PDF generated and downloaded successfully!');
      setTimeout(() => setDiscoveryMsg(null), 4000);
    } catch {
      alert('Error generating executive dossier PDF.');
    } finally {
      setDownloadingDossierId(null);
    }
  }

  async function handleRunBenchmark(jobId: string) {
    try {
      setLoadingBenchmark(true);
      setBenchmarkModalOpen(true);
      const res = await fetch(`/api/v1/evaluations/benchmark/${jobId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Benchmark failed');
      const data: ModelBenchmarkComparisonResponse = await res.json();
      setBenchmarkData(data);
    } catch {
      alert('Error running model benchmark comparison.');
      setBenchmarkModalOpen(false);
    } finally {
      setLoadingBenchmark(false);
    }
  }

  async function handleOpenOfferModal(job: JobOpportunity) {
    setOfferJob(job);
    setOfferBaseSalary(job.min_salary || 195000);
    setOfferResult(null);
    setOfferModalOpen(true);
  }

  async function handleSubmitOfferEvaluation(e: FormEvent) {
    e.preventDefault();
    if (!offerJob) return;
    try {
      setEvaluatingOffer(true);
      const res = await fetch('/api/v1/offers/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: offerJob.id,
          company_name: offerJob.company_name || 'Hiring Company',
          role_title: offerJob.title,
          base_salary: Number(offerBaseSalary),
          equity_value_annual: Number(offerEquity),
          bonus_target_annual: Number(offerBonus),
          sign_on_bonus: Number(offerSignOn),
        }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data: OfferEvaluationResult = await res.json();
      setOfferResult(data);
    } catch {
      alert('Error evaluating offer package.');
    } finally {
      setEvaluatingOffer(false);
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
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition"
            title="Side-by-side multi-offer compensation and vesting matrix"
          >
            <BarChart2 className="w-4 h-4 text-violet-400" /> Compare Offers
          </button>
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

      {/* Target Company Boards Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-400">Target Boards:</span>
          {['Anthropic', 'OpenAI', 'Stripe', 'GitLab', 'Automattic', 'Datadog', 'Figma', 'Retool'].map((c) => (
            <span key={c} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              {c}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Multi-adapter: Greenhouse API + Lever API + Remote Tech Feed</span>
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleStartRoleplay(job)}
                      className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="Interactive AI Mock Interview Roleplay Studio"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Practice
                    </button>
                    <button
                      onClick={() => handleOpenCompanyDossier(job)}
                      className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="Company Technical Intelligence, Architecture & Leadership Dossier"
                    >
                      <Building2 className="w-3.5 h-3.5" /> Dossier
                    </button>
                    <button
                      onClick={() => handleOpenInterviewPrep(job)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="AI Technical & Architectural Interview Prep"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Prep
                    </button>
                    <button
                      onClick={() => handleOpenOfferModal(job)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="Evaluate Total Comp & Draft Counter-Offer Script"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Offer
                    </button>
                    <button
                      onClick={() => handleDownloadTailoredResume(job.id)}
                      disabled={tailoringJobId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition disabled:opacity-50"
                      title="Generate Single-Page PDF Tailored for this Role"
                    >
                      <Download className="w-3.5 h-3.5" /> {tailoringJobId === job.id ? 'Tailoring...' : 'Resume PDF'}
                    </button>
                    <button
                      onClick={() => handleDownloadExecutiveDossier(job.id, job.company_name)}
                      disabled={downloadingDossierId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      title="Download Tailored Executive Interview Dossier PDF for CTO & VP panel rounds"
                    >
                      <Download className="w-3.5 h-3.5" /> {downloadingDossierId === job.id ? 'Dossier...' : 'Dossier PDF'}
                    </button>
                    <button
                      onClick={() => handleEvaluateJob(job)}
                      disabled={evaluatingId === job.id}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {evaluatingId === job.id ? '...' : 'Evaluate'}
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
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                Built-in AI • {activeEvaluation.ai_model} (0 keys required)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunBenchmark(activeEvaluation.id ? evaluatingId! : evaluatingId!)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold flex items-center gap-1.5 transition"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> Benchmark Models
                </button>
                <button
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Close
                </button>
              </div>
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

      {/* AI Interview Preparation Modal */}
      {prepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Role-Specific Interview Prep & Strategy
                </h3>
                <p className="text-xs text-indigo-300 font-medium">
                  {activePrep?.job_title} • {activePrep?.company_name}
                </p>
              </div>
              <button onClick={() => setPrepModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPrep ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="text-xs">Synthesizing role requirements, architecture challenges, and STAR talking points...</p>
              </div>
            ) : activePrep ? (
              <div className="space-y-6">
                {/* Focus Areas Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Identified Technical Focus Areas:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activePrep.recommended_focus_areas.map((fa, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                        {fa}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setPrepTab('questions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      prepTab === 'questions'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Anticipated Technical Questions ({activePrep.technical_questions.length})
                  </button>
                  <button
                    onClick={() => setPrepTab('star')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      prepTab === 'star'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    STAR Talking Points ({activePrep.star_talking_points.length})
                  </button>
                  <button
                    onClick={() => setPrepTab('reverse')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      prepTab === 'reverse'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Questions for Interviewer ({activePrep.reverse_interview_questions.length})
                  </button>
                </div>

                {/* Tab 1: Questions */}
                {prepTab === 'questions' && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {activePrep.technical_questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-indigo-400">{q.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-bold">
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                        <div className="space-y-1 text-xs text-slate-300 pt-1">
                          <span className="text-slate-400 font-semibold text-[11px]">Recommended Talking Points:</span>
                          <ul className="list-disc list-inside space-y-1 pl-1">
                            {q.talking_points.map((tp, i) => (
                              <li key={i}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-[11px] text-emerald-400/90 font-mono pt-1">
                          Tie-in: {q.relevant_experience_tie_in}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: STAR */}
                {prepTab === 'star' && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {activePrep.star_talking_points.map((star, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                        <h4 className="text-sm font-bold text-white">{star.theme}</h4>
                        <div className="space-y-1.5 text-slate-300">
                          <p><strong className="text-indigo-400">Situation / Challenge:</strong> {star.situation_task}</p>
                          <p><strong className="text-indigo-400">Action:</strong> {star.action}</p>
                          <p><strong className="text-emerald-400">Result & Impact:</strong> {star.result}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {star.skills_demonstrated.map((sk, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Reverse Questions */}
                {prepTab === 'reverse' && (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {activePrep.reverse_interview_questions.map((rq, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-indigo-400">{rq.category}</span>
                        <p className="text-sm font-bold text-white">{rq.question}</p>
                        <p className="text-xs text-slate-400">Strategic Value: {rq.intended_insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
      {/* Multi-Model Benchmark Modal */}
      {benchmarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-violet-400" />
                  Multi-Model Evaluation Benchmark
                </h3>
                <p className="text-xs text-slate-400">
                  {benchmarkData?.job_title} • {benchmarkData?.company_name}
                </p>
              </div>
              <button onClick={() => setBenchmarkModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingBenchmark ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                <p className="text-xs">Benchmarking local built-in vs rule-based vs cloud models...</p>
              </div>
            ) : benchmarkData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400">Consensus Recommendation:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {benchmarkData.consensus_recommendation}
                  </span>
                </div>

                <div className="space-y-3">
                  {benchmarkData.benchmarks.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{b.model_name}</span>
                        <span className="font-mono text-indigo-400 font-bold text-sm">{b.overall_score}% Match</span>
                      </div>
                      <p className="text-slate-400 text-xs">{b.verdict_highlight}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                        <span>Latency: <strong className="text-slate-300">{b.latency_ms}ms</strong></span>
                        <span>Cost: <strong className="text-emerald-400">{b.estimated_cost_usd === 0 ? '$0.00 (Local)' : `$${b.estimated_cost_usd}`}</strong></span>
                        <span>Tokens: <strong className="text-slate-300">{b.tokens_used}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Offer Evaluation & Negotiation Modal */}
      {offerModalOpen && offerJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Salary Negotiation & Offer Strategist
                </h3>
                <p className="text-xs text-indigo-300 font-medium">
                  {offerJob.title} • {offerJob.company_name}
                </p>
              </div>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOfferEvaluation} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Offer Package Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Base Salary ($)</label>
                  <input
                    type="number"
                    value={offerBaseSalary}
                    onChange={(e) => setOfferBaseSalary(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Equity / Yr ($)</label>
                  <input
                    type="number"
                    value={offerEquity}
                    onChange={(e) => setOfferEquity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Bonus Target ($)</label>
                  <input
                    type="number"
                    value={offerBonus}
                    onChange={(e) => setOfferBonus(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Sign-on Bonus ($)</label>
                  <input
                    type="number"
                    value={offerSignOn}
                    onChange={(e) => setOfferSignOn(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={evaluatingOffer}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {evaluatingOffer ? 'Analyzing Market Percentiles...' : 'Evaluate Offer & Generate Counter Script'}
              </button>
            </form>

            {/* Offer Result Card */}
            {offerResult && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">First-Year TC</span>
                    <p className="text-lg font-bold text-emerald-400 font-mono">${offerResult.first_year_tc.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Recurring TC</span>
                    <p className="text-lg font-bold text-white font-mono">${offerResult.recurring_annual_tc.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Market Tier</span>
                    <p className="text-xs font-bold text-indigo-400 mt-1">{offerResult.market_percentile}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Recommendation:</span>
                    <span className="font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {offerResult.recommendation}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{offerResult.verdict_summary}</p>
                </div>

                {/* Counter Script */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Recommended Counter-Offer Email</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offerResult.counter_offer_email_script);
                        setCopiedCounterScript(true);
                        setTimeout(() => setCopiedCounterScript(false), 2500);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedCounterScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCounterScript ? 'Copied' : 'Copy Script'}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    readOnly
                    value={offerResult.counter_offer_email_script}
                    className="w-full p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-sans focus:outline-none"
                  />
                </div>

                {/* Launch Live Negotiation Simulation */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (offerJob) handleStartNegotiation(offerJob);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 transition"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Launch Live Salary Counter-Negotiation Simulator
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Technical Intelligence & Dossier Modal */}
      {dossierModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeDossier?.company_name || 'Target Company'} Technical Dossier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Architectural profile, engineering scale, tech stack & leadership intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDossierModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDossier ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Cpu className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-sm text-slate-400">Synthesizing deep technical intelligence & leadership dossier...</p>
              </div>
            ) : activeDossier ? (
              <div className="space-y-5">
                {/* Meta Badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {activeDossier.industry}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {activeDossier.funding_stage}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                    {activeDossier.engineering_scale}
                  </span>
                  {activeDossier.domain && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 font-mono">
                      {activeDossier.domain}
                    </span>
                  )}
                </div>

                {/* Primary Tech Stack */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" /> Primary Tech Stack & Systems Architecture
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeDossier.primary_tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-mono font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Engineering Blog Highlights */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Engineering Publications & Architecture Focus
                  </h4>
                  <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                    {activeDossier.engineering_blog_highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Leadership Dossier */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-violet-400" /> Engineering Leadership Dossier
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeDossier.leadership.map((leader, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <p className="text-xs font-bold text-white">{leader.name}</p>
                        <p className="text-[11px] font-semibold text-sky-400">{leader.role}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{leader.background}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Process Notes */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Interview Process & Engineering Culture
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {activeDossier.interview_process_notes}
                  </p>
                </div>

                {/* Strategic Candidate Positioning */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-violet-950/40 border border-indigo-500/40 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Candidate Strategic Leverage (Adam Blansett)
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeDossier.strategic_candidate_positioning}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Interactive AI Mock Interview Roleplay Studio Modal */}
      {roleplayModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-pink-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Mock Interview Studio: {activeRoleplayJob?.company_name || 'Target Company'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Staff-level architectural roleplay with instant rubric scoring & feedback
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleplayModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Track Selector */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 mr-2">Track:</span>
              <button
                onClick={() => {
                  setRoleplayTrack('distributed_systems');
                  if (activeRoleplayJob) handleStartRoleplay(activeRoleplayJob, 'distributed_systems');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  roleplayTrack === 'distributed_systems'
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Distributed Systems
              </button>
              <button
                onClick={() => {
                  setRoleplayTrack('ai_systems');
                  if (activeRoleplayJob) handleStartRoleplay(activeRoleplayJob, 'ai_systems');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  roleplayTrack === 'ai_systems'
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                AI Systems & Platform
              </button>
              <button
                onClick={() => {
                  setRoleplayTrack('leadership_behavioral');
                  if (activeRoleplayJob) handleStartRoleplay(activeRoleplayJob, 'leadership_behavioral');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  roleplayTrack === 'leadership_behavioral'
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Leadership & Influence
              </button>
            </div>

            {loadingRoleplay ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Cpu className="w-8 h-8 text-pink-400 animate-spin" />
                <p className="text-sm text-slate-400">Initializing interviewer persona and scenario...</p>
              </div>
            ) : roleplayQuestion ? (
              <div className="space-y-5">
                {/* Interviewer Persona Card */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-bold text-pink-400 font-mono">
                      Interviewer: {roleplayQuestion.interviewer_persona}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeakQuestion(roleplayQuestion.question)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          isPlayingAudio
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                        title="Text-to-Speech: Listen to the interviewer speak this question aloud"
                      >
                        {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
                        {isPlayingAudio ? 'Stop Audio' : 'Listen Aloud'}
                      </button>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                        Round {roleplayQuestion.round_number}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    "{roleplayQuestion.question}"
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Scenario: {roleplayQuestion.scenario_context}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {roleplayQuestion.recommended_focus_areas.map((area, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Answer Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">Your Response (Candidate Answer)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMic}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          isListeningMic
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Dictate your answer verbally via Speech Recognition"
                      >
                        {isListeningMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-pink-400" />}
                        {isListeningMic ? 'Listening... (Speak Now)' : 'Voice Dictate'}
                      </button>
                      <span className="text-slate-500 font-mono">
                        {candidateAnswer.trim() ? `${candidateAnswer.trim().split(/\s+/).length} words` : '0 words'}
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Outline your architectural solution: immediate mitigations, system scale tradeoffs, technology choices (Postgres/Kafka/Celery), and metric validation..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitRoleplayAnswer}
                      disabled={evaluatingRoleplay || candidateAnswer.trim().length < 20}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-pink-500/20 disabled:opacity-50"
                    >
                      {evaluatingRoleplay ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {evaluatingRoleplay ? 'Evaluating Response...' : 'Submit Response for AI Scoring'}
                    </button>
                  </div>
                </div>

                {/* Evaluation Feedback */}
                {roleplayEvaluation && (
                  <div className="p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-white font-mono">
                          {roleplayEvaluation.overall_score}/100
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono border ${
                          roleplayEvaluation.verdict === 'STRONG_PASS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {roleplayEvaluation.verdict.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Rigor: <strong className="text-emerald-400">{roleplayEvaluation.technical_rigor_score}%</strong></span>
                        <span>Tradeoffs: <strong className="text-emerald-400">{roleplayEvaluation.tradeoff_depth_score}%</strong></span>
                        <span>Structure: <strong className="text-emerald-400">{roleplayEvaluation.star_structure_score}%</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-emerald-400">Strengths Highlighted</span>
                        <ul className="space-y-1 text-slate-300">
                          {roleplayEvaluation.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-400">Areas for Improvement</span>
                        <ul className="space-y-1 text-slate-300">
                          {roleplayEvaluation.areas_for_improvement.map((area, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <span className="font-bold text-slate-300">Model Answer Architecture</span>
                      <p className="text-slate-300 whitespace-pre-line leading-relaxed font-mono text-[11px] pt-1">
                        {roleplayEvaluation.ideal_answer_outline}
                      </p>
                    </div>

                    {roleplayEvaluation.follow_up_question && (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-1 text-xs">
                        <span className="font-bold text-indigo-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Follow-Up Drill:
                        </span>
                        <p className="text-slate-200 leading-relaxed italic">
                          "{roleplayEvaluation.follow_up_question}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Interactive Salary & Compensation Negotiation Studio Modal */}
      {negotiationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Salary & Offer Negotiation Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Roleplay counter-offer discussions against realistic recruiter pushback with real-time scoring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNegotiationModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingNegotiation ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Cpu className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm text-slate-400">Initializing compensation committee scenario...</p>
              </div>
            ) : negotiationScenario ? (
              <div className="space-y-5">
                {/* Offer Comparison Strip */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Initial Offer (Base / Equity / Sign-On)</span>
                    <p className="text-base font-bold text-white font-mono">
                      ${negotiationScenario.current_offer.first_year_tc.toLocaleString()} <span className="text-xs text-slate-400 font-normal">First-Year TC</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Base: ${negotiationScenario.current_offer.base_salary.toLocaleString()} • Equity: ${negotiationScenario.current_offer.equity_annual.toLocaleString()} • Sign-on: ${negotiationScenario.current_offer.sign_on_bonus.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Target Benchmark Objective</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">
                      ${negotiationScenario.target_compensation.first_year_tc.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Target TC</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Target Base: ${negotiationScenario.target_compensation.base_salary.toLocaleString()} • Target Equity: ${negotiationScenario.target_compensation.equity_annual.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Recruiter Pushback Box */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-bold text-emerald-400 font-mono">
                      Recruiter: {negotiationScenario.recruiter_persona} ({negotiationScenario.company_name})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeakQuestion(negotiationScenario.recruiter_objection)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isPlayingAudio
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      title="Listen to the recruiter's counter-proposal verbally"
                    >
                      {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isPlayingAudio ? 'Stop Audio' : 'Listen Aloud'}
                    </button>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    "{negotiationScenario.recruiter_objection}"
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {negotiationScenario.tactical_hints.map((hint, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Counter Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">Your Counter-Proposal Pitch</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMic}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          isListeningMic
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Dictate counter-offer proposal out loud"
                      >
                        {isListeningMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                        {isListeningMic ? 'Listening...' : 'Voice Dictate'}
                      </button>
                      <span className="text-slate-500 font-mono">
                        {candidateCounterText.trim() ? `${candidateCounterText.trim().split(/\s+/).length} words` : '0 words'}
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={candidateCounterText}
                    onChange={(e) => setCandidateCounterText(e.target.value)}
                    placeholder="Express genuine enthusiasm, frame your 10+ years backend expertise as risk reduction, anchor on first-year total comp, and offer flexible levers (equity/sign-on) to bypass base ceilings..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitNegotiationCounter}
                      disabled={evaluatingNegotiation || candidateCounterText.trim().length < 20}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {evaluatingNegotiation ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {evaluatingNegotiation ? 'Evaluating Counter Strategy...' : 'Submit Counter-Proposal to Recruiter'}
                    </button>
                  </div>
                </div>

                {/* Negotiation Evaluation & Revised Offer Result */}
                {negotiationEvaluation && (
                  <div className="p-5 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-white font-mono">
                          {negotiationEvaluation.overall_tactical_score}/100
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {negotiationEvaluation.verdict.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Leverage: <strong className="text-emerald-400">{negotiationEvaluation.leverage_score}%</strong></span>
                        <span>Firmness: <strong className="text-emerald-400">{negotiationEvaluation.firmness_score}%</strong></span>
                        <span>Value Optimization: <strong className="text-emerald-400">{negotiationEvaluation.value_optimization_score}%</strong></span>
                      </div>
                    </div>

                    {/* Recruiter Revised Counter-Response */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Response & Concession
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{negotiationEvaluation.recruiter_counter_response}"
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Revised Total Comp:</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          ${negotiationEvaluation.revised_offer.first_year_tc.toLocaleString()} (+$35,000 gain)
                        </span>
                      </div>
                    </div>

                    {/* Tactical Critiques & Strengths */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-emerald-400">Strengths in Your Counter</span>
                        <ul className="space-y-1 text-slate-300">
                          {negotiationEvaluation.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-400">Tactical Improvement Points</span>
                        <ul className="space-y-1 text-slate-300">
                          {negotiationEvaluation.tactical_critique.map((crit, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{crit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Polished Model Script */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">Polished Benchmark Script</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(negotiationEvaluation.model_counter_script);
                            alert('Copied model counter script to clipboard!');
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy Script
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs pt-1">
                        {negotiationEvaluation.model_counter_script}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Multi-Offer Side-by-Side Comparison Matrix Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-violet-500/30 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Multi-Offer Side-by-Side Comparison Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Model 4-year cumulative compensation trajectories, equity vesting mechanics, and benefit parity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Year Scope Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveCompYear(1)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      activeCompYear === 1
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Year 1 (Cash & Bridge)
                  </button>
                  <button
                    onClick={() => setActiveCompYear(4)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      activeCompYear === 4
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4-Year Cumulative
                  </button>
                </div>

                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="text-slate-500 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Offer Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compOffers.map((offer, idx) => {
                const year1TC = offer.base_salary + offer.equity_annual + offer.bonus_annual + offer.sign_on;
                const fourYearTC = (offer.base_salary * 4) + offer.equity_4yr_total + (offer.bonus_annual * 4) + offer.sign_on;
                const displayTC = activeCompYear === 1 ? year1TC : fourYearTC;

                return (
                  <div
                    key={offer.id}
                    className={`p-5 rounded-2xl bg-slate-950/80 border space-y-4 flex flex-col justify-between shadow-xl ${
                      idx === 1
                        ? 'border-violet-500/40 ring-1 ring-violet-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Company Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white">{offer.company_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {offer.stage}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium">{offer.role_title}</p>

                      {/* Highlight Metric */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                          {activeCompYear === 1 ? 'Year 1 Total Compensation' : '4-Year Total Compensation'}
                        </span>
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          ${(displayTC / 1000).toFixed(0)}k
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {activeCompYear === 1
                            ? `Includes $${offer.sign_on / 1000}k sign-on bonus bridge`
                            : `Assumes standard 4-yr equity grant realization`}
                        </span>
                      </div>

                      {/* Granular Breakdown Table */}
                      <div className="space-y-2 text-xs divide-y divide-slate-800/60 pt-1">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-400">Base Salary (Cash):</span>
                          <span className="font-mono font-semibold text-white">
                            ${(offer.base_salary / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-slate-400">Annualized Equity:</span>
                          <span className="font-mono font-semibold text-violet-300">
                            ${(offer.equity_annual / 1000).toFixed(0)}k/yr
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-slate-400">4-Yr Total Equity Grant:</span>
                          <span className="font-mono font-semibold text-violet-400">
                            ${(offer.equity_4yr_total / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-slate-400">Annual Target Bonus:</span>
                          <span className="font-mono font-semibold text-white">
                            ${(offer.bonus_annual / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="text-slate-400">Sign-on Cash Bridge:</span>
                          <span className="font-mono font-semibold text-amber-300">
                            ${(offer.sign_on / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>

                      {/* Vesting & Perks */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Vesting Schedule:</span>
                          <span className="font-medium text-slate-300">{offer.vesting_schedule}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800/40 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                          <div>401k Match: <strong className="text-white">${offer.match_401k.toLocaleString()}</strong></div>
                          <div>Remote Fund: <strong className="text-white">${offer.remote_stipend.toLocaleString()}/yr</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Cumulative Horizontal Comparison */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Relative Earning Velocity (First-Year vs 4-Year Trajectory)
              </span>
              <div className="space-y-3">
                {compOffers.map((o) => {
                  const y1 = o.base_salary + o.equity_annual + o.bonus_annual + o.sign_on;
                  const fourYr = (o.base_salary * 4) + o.equity_4yr_total + (o.bonus_annual * 4) + o.sign_on;
                  const pct = Math.round((fourYr / 1600000) * 100);

                  return (
                    <div key={o.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{o.company_name}</span>
                        <span className="font-mono text-slate-400">
                          Y1: ${(y1 / 1000).toFixed(0)}k • 4-Yr Total: <strong className="text-emerald-400">${(fourYr / 1000).toFixed(0)}k</strong>
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(20, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tactical Leverage Notes */}
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold">Cross-Offer Negotiation Dynamic:</strong> Anthropic provides the highest nominal equity upside ($140k/yr), while Datadog offers the highest liquidity and predictable public equity. Use Anthropic's $240k base to negotiate Stripe and Datadog up from their initial $220k-$230k offers.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;
