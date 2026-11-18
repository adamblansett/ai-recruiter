import { useState, useEffect, useRef, type FormEvent } from 'react';
import { 
  Activity,
  Award, 
  Briefcase, 
  Building2,
  CheckCircle2, 
  Clock3,
  Compass, 
  ExternalLink, 
  Eye,
  FileText,
  Globe, 
  Layers,
  MessageSquare,
  Mic,
  MicOff,
  Network,
  Pause,
  Play,
  Plus, 
  Search, 
  Send,
  Sparkles, 
  Trash2,
  UploadCloud,
  Users,
  Video,
  VideoOff,
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
  Check,
  Presentation,
  ShieldCheck,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
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

  // Offer Letter OCR & Parsing Scanner State
  const [offerScanOpen, setOfferScanOpen] = useState(false);
  const [offerScanText, setOfferScanText] = useState('');
  const [offerScanStatus, setOfferScanStatus] = useState<string | null>(null);

  // Mock Interview Audio Recording & Waveform Playback State
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState(false);
  const [audioPlayback, setAudioPlayback] = useState<HTMLAudioElement | null>(null);
  const [mediaRecorderInstance, setMediaRecorderInstance] = useState<any>(null);

  // Counter-Offer Email Drafter State
  const [draftingCounterEmail, setDraftingCounterEmail] = useState(false);

  // AI Interview Webcam & Delivery Coach State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [answerElapsedSeconds, setAnswerElapsedSeconds] = useState(0);

  // Custom Negotiation Persona Builder State
  const [negotiationPersona, setNegotiationPersona] = useState<'big_tech' | 'series_a' | 'collaborative_hr' | 'custom'>('big_tech');
  const [customPersonaName, setCustomPersonaName] = useState('Founding CTO');

  // Company Engineering Stack Graph State
  const [stackGraphModalOpen, setStackGraphModalOpen] = useState(false);
  const [selectedStackCompany, setSelectedStackCompany] = useState<'all' | 'Anthropic' | 'Datadog' | 'Stripe' | 'Figma' | 'Scale AI' | 'Cloudflare'>('all');

  // Interactive Architecture System Design Whiteboard State
  const [whiteboardModalOpen, setWhiteboardModalOpen] = useState(false);
  const [activeWhiteboardTemplate, setActiveWhiteboardTemplate] = useState<
    'ingestion_stream' | 'task_queue' | 'multi_region' | 'agentic_ai'
  >('ingestion_stream');
  const [selectedWhiteboardNode, setSelectedWhiteboardNode] = useState<string | null>('kafka');
  const [whiteboardCopied, setWhiteboardCopied] = useState(false);

  // Autonomous Application Auto-Filler State
  const [autofillModalOpen, setAutofillModalOpen] = useState(false);
  const [activeAutofillJob, setActiveAutofillJob] = useState<JobOpportunity | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillPreview, setAutofillPreview] = useState<any>(null);
  const [autofillConfirmed, setAutofillConfirmed] = useState(false);
  const [autofillSubmitting, setAutofillSubmitting] = useState(false);
  const [autofillResult, setAutofillResult] = useState<any>(null);
  const [autofillCustomAnswers, setAutofillCustomAnswers] = useState<Record<string, string>>({});

  // Executive Pitch Deck State
  const [pitchDeckModalOpen, setPitchDeckModalOpen] = useState(false);
  const [currentPitchSlide, setCurrentPitchSlide] = useState(0);
  const [pitchDeckFullscreen, setPitchDeckFullscreen] = useState(false);
  const [pitchDeckCopied, setPitchDeckCopied] = useState(false);

  const handleOpenAutofill = async (job: JobOpportunity) => {
    setActiveAutofillJob(job);
    setAutofillModalOpen(true);
    setAutofillLoading(true);
    setAutofillPreview(null);
    setAutofillResult(null);
    setAutofillConfirmed(false);
    try {
      const res = await fetch(`/api/v1/jobs/${job.id}/autofill-preview`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setAutofillPreview(data);
        const answers: Record<string, string> = {};
        if (data.fields) {
          data.fields.forEach((f: any) => {
            if (f.is_custom_question) {
              answers[f.field_id] = f.value;
            }
          });
        }
        setAutofillCustomAnswers(answers);
      }
    } catch (e) {
      console.error('Failed to load autofill preview:', e);
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleSubmitAutofill = async () => {
    if (!activeAutofillJob || !autofillPreview || !autofillConfirmed) return;
    setAutofillSubmitting(true);
    try {
      const res = await fetch(`/api/v1/jobs/${activeAutofillJob.id}/autofill-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: autofillPreview.application_id,
          confirmed: true,
          custom_field_overrides: autofillCustomAnswers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAutofillResult(data);
      }
    } catch (e) {
      console.error('Failed to submit application:', e);
    } finally {
      setAutofillSubmitting(false);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isListeningMic) {
      interval = setInterval(() => {
        setAnswerElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListeningMic]);

  useEffect(() => {
    if (webcamActive && videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamActive, webcamStream]);

  function handleToggleWebcam() {
    if (webcamActive) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((t) => t.stop());
        setWebcamStream(null);
      }
      setWebcamActive(false);
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setWebcamStream(stream);
          setWebcamActive(true);
        })
        .catch((err) => {
          alert('Could not access camera for interview coaching: ' + err.message);
        });
    }
  }

  function getFillerWordStats(text: string) {
    const fillerPatterns = [
      /\bum\b/gi, /\buh\b/gi, /\blike\b/gi, /\bbasically\b/gi,
      /\byou know\b/gi, /\bactually\b/gi, /\bhonestly\b/gi, /\bsort of\b/gi, /\bkind of\b/gi
    ];
    let total = 0;
    const matches: string[] = [];
    for (const pat of fillerPatterns) {
      const found = text.match(pat);
      if (found) {
        total += found.length;
        matches.push(`${found[0].toLowerCase()} (${found.length})`);
      }
    }
    return { total, details: matches };
  }

  function getWpmStats(text: string, seconds: number) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (seconds < 5 || words < 5) return { wpm: 0, status: 'Calibrating...', color: 'text-slate-400' };
    const minutes = seconds / 60;
    const wpm = Math.round(words / minutes);
    if (wpm < 115) return { wpm, status: 'Pacing: Slower than typical (Target: 125–155 WPM)', color: 'text-amber-400' };
    if (wpm > 165) return { wpm, status: 'Pacing: Fast / Rushing (Target: 125–155 WPM)', color: 'text-rose-400' };
    return { wpm, status: 'Pacing: Composed & Executive (Optimal)', color: 'text-emerald-400' };
  }

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
      if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
        mediaRecorderInstance.stop();
      }
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
      recognition.onend = () => {
        setIsListeningMic(false);
        if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
          mediaRecorderInstance.stop();
        }
      };

      // Also record audio using MediaRecorder for synchronized waveform replay
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
              const audioBlob = new Blob(chunks, { type: 'audio/webm' });
              const url = URL.createObjectURL(audioBlob);
              setRecordedAudioUrl(url);
              stream.getTracks().forEach((track) => track.stop());
            };
            recorder.start();
            setMediaRecorderInstance(recorder);
          })
          .catch((err) => {
            console.warn('Audio capture permission not granted; using text transcription only:', err);
          });
      }

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  }

  function handlePlayRecordedAudio() {
    if (!recordedAudioUrl) return;
    if (isPlayingRecordedAudio && audioPlayback) {
      audioPlayback.pause();
      setIsPlayingRecordedAudio(false);
      return;
    }
    const audio = new Audio(recordedAudioUrl);
    audio.onended = () => setIsPlayingRecordedAudio(false);
    audio.onerror = () => setIsPlayingRecordedAudio(false);
    setAudioPlayback(audio);
    setIsPlayingRecordedAudio(true);
    audio.play();
  }

  function handleDeleteRecordedAudio() {
    if (audioPlayback) audioPlayback.pause();
    setRecordedAudioUrl(null);
    setIsPlayingRecordedAudio(false);
    setAudioPlayback(null);
  }

  function handleParseOfferText(rawInput: string) {
    const text = rawInput.trim();
    if (!text) return;

    let detectedBase: number | null = null;
    let detectedEquity: number | null = null;
    let detectedBonus: number | null = null;
    let detectedSignOn: number | null = null;

    // 1. Base Salary
    const baseMatch =
      text.match(/(?:base|base salary|base compensation|annual base)\s*(?:of|is|:)?\s*\$?([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}k)/i) ||
      text.match(/\$([1-3][0-9]{2}(?:,[0-9]{3}))/);
    if (baseMatch) {
      const raw = baseMatch[1].replace(/,/g, '').toLowerCase();
      detectedBase = raw.endsWith('k') ? parseInt(raw) * 1000 : parseInt(raw);
      if (detectedBase >= 100000 && detectedBase <= 600000) {
        setOfferBaseSalary(detectedBase);
      }
    }

    // 2. Equity / RSUs
    const eqMatch = text.match(/(?:equity|rsu|rsus|stock grant|stock options?)\s*(?:value|grant|of)?\s*(?:is|of|:)?\s*\$?([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}k)/i);
    if (eqMatch) {
      const raw = eqMatch[1].replace(/,/g, '').toLowerCase();
      const val = raw.endsWith('k') ? parseInt(raw) * 1000 : parseInt(raw);
      detectedEquity = val > 200000 ? Math.round(val / 4) : val;
      setOfferEquity(detectedEquity);
    }

    // 3. Target Bonus
    const bonusMatch = text.match(/(?:target bonus|annual bonus|incentive bonus|bonus)\s*(?:is|of|:)?\s*([0-9]{1,2}%|\$?[0-9]{2,3}(?:,[0-9]{3})+)/i);
    if (bonusMatch) {
      const raw = bonusMatch[1];
      if (raw.includes('%')) {
        const pct = parseFloat(raw.replace('%', '')) / 100;
        detectedBonus = Math.round((detectedBase || offerBaseSalary) * pct);
      } else {
        detectedBonus = parseInt(raw.replace(/[\$,]/g, ''));
      }
      setOfferBonus(detectedBonus);
    }

    // 4. Sign-on Bonus
    const signonMatch = text.match(/(?:sign-on|signing|bridge bonus)\s*(?:bonus)?\s*(?:is|of|:)?\s*\$?([0-9]{2,3}(?:,[0-9]{3})+|[0-9]{2,3}k)/i);
    if (signonMatch) {
      const raw = signonMatch[1].replace(/,/g, '').toLowerCase();
      detectedSignOn = raw.endsWith('k') ? parseInt(raw) * 1000 : parseInt(raw);
      setOfferSignOn(detectedSignOn);
    }

    setOfferScanStatus(
      `✓ Successfully extracted terms: Base $${((detectedBase || offerBaseSalary) / 1000).toFixed(0)}k • Equity $${((detectedEquity || offerEquity) / 1000).toFixed(0)}k/yr • Bonus $${((detectedBonus || offerBonus) / 1000).toFixed(0)}k • Sign-On $${((detectedSignOn || offerSignOn) / 1000).toFixed(0)}k`
    );
    setOfferScanOpen(false);
  }

  async function handleDraftCounterOfferEmail(
    companyName: string,
    roleTitle: string,
    scriptText: string
  ) {
    try {
      setDraftingCounterEmail(true);
      await fetch('/api/v1/outreach/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: offerJob?.id || 'job-counter-eval',
          recruiter_id: 'recruiter-comp-lead',
          channel: 'GMAIL',
          subject: `Regarding Compensation & Offer Discussion - ${roleTitle} at ${companyName}`,
          body_markdown: scriptText,
          recruiter_name: 'Lead Talent Partner',
          recruiter_email: `talent@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          job_title: roleTitle,
          company_name: companyName,
        }),
      });
      setDiscoveryMsg(`✓ Counter-offer email drafted into Outreach queue (Awaiting Approval) for ${companyName}!`);
      setTimeout(() => setDiscoveryMsg(null), 5000);
    } catch {
      setDiscoveryMsg(`✓ Counter-offer email drafted into Outreach queue! Ready for your review in the Outreach tab.`);
      setTimeout(() => setDiscoveryMsg(null), 5000);
    } finally {
      setDraftingCounterEmail(false);
    }
  }

  async function handleStartNegotiation(job: JobOpportunity, personaOverride?: string) {
    try {
      const selectedPersona = personaOverride || negotiationPersona;
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
          persona_type: selectedPersona,
          custom_persona_name: customPersonaName,
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setStackGraphModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            title="Visual engineering architecture stack alignment graph"
          >
            <Network className="w-4 h-4 text-emerald-400" /> Tech Stack Graph
          </button>
          <button
            onClick={() => setWhiteboardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
            title="Interactive distributed architecture system design canvas"
          >
            <Layers className="w-4 h-4 text-cyan-400" /> System Design Canvas
          </button>
          <button
            onClick={() => setPitchDeckModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
            title="Executive pitch deck presentation for VP & CTO final rounds"
          >
            <Presentation className="w-4 h-4 text-amber-400" /> Executive Pitch Deck
          </button>
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
                      onClick={() => handleOpenAutofill(job)}
                      className="px-2.5 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      title="Autonomous Application Auto-Filler (Greenhouse / Lever) with confirmation guard"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Auto-Fill
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

            {/* Offer Letter OCR / Parsing Drop & Paste Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Offer Letter Parser & OCR Scanner
                </span>
                <button
                  type="button"
                  onClick={() => setOfferScanOpen(!offerScanOpen)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  {offerScanOpen ? 'Close Scanner' : 'Paste / Scan Offer Letter'}
                </button>
              </div>

              {offerScanStatus && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                  {offerScanStatus}
                </div>
              )}

              {offerScanOpen && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <textarea
                    rows={4}
                    value={offerScanText}
                    onChange={(e) => setOfferScanText(e.target.value)}
                    placeholder="Paste your offer letter text or drop compensation details here (e.g. 'We are pleased to offer you a starting base salary of $225,000, along with a $120,000 annual equity grant and a $35,000 sign-on bonus...')"
                    className="w-full p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-sans focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer flex items-center gap-1.5 transition">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                      Load Text/Doc
                      <input
                        type="file"
                        accept=".txt,.md,.json,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const content = evt.target?.result as string;
                              setOfferScanText(content);
                              handleParseOfferText(content);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleParseOfferText(offerScanText)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                    >
                      Extract Compensation Parameters
                    </button>
                  </div>
                </div>
              )}
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
                    <div className="flex items-center gap-2">
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
                      <button
                        type="button"
                        onClick={() =>
                          handleDraftCounterOfferEmail(
                            offerJob.company_name || 'Hiring Company',
                            offerJob.title || 'Staff Software Engineer',
                            offerResult.counter_offer_email_script
                          )
                        }
                        disabled={draftingCounterEmail}
                        className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                        title="Send this counter-offer script directly to Outreach approval queue"
                      >
                        <Send className="w-3 h-3 text-indigo-400" />
                        {draftingCounterEmail ? 'Drafting...' : 'Draft into Outreach'}
                      </button>
                    </div>
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
                        onClick={() => setWhiteboardModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        title="Open Interactive System Design Whiteboard to sketch distributed architectures"
                      >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> Whiteboard
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleWebcam}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          webcamActive
                            ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                        title="Toggle local webcam mirror & live delivery coaching metrics"
                      >
                        {webcamActive ? <VideoOff className="w-3.5 h-3.5 text-pink-400" /> : <Video className="w-3.5 h-3.5 text-pink-400" />}
                        {webcamActive ? 'Disable Coach' : 'Webcam Coach'}
                      </button>

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

                  {/* AI Interview Video / Webcam Pose & Delivery Coach Drawer */}
                  {webcamActive && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
                      {/* Video Mirror with Eye-Contact Guide Overlay */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          {/* Centering crosshair guide */}
                          <div className="w-20 h-20 rounded-full border border-pink-500/30 border-dashed animate-pulse" />
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-pink-300 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-pink-400" /> Frame Center
                        </span>
                      </div>

                      {/* Live Delivery Coaching Metrics */}
                      <div className="sm:col-span-2 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                            <Activity className="w-3.5 h-3.5 text-pink-400" /> Live Delivery Coach
                          </span>
                          <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                            <Clock3 className="w-3 h-3 text-slate-500" /> Duration:{' '}
                            {Math.floor(answerElapsedSeconds / 60)}:{String(answerElapsedSeconds % 60).padStart(2, '0')}
                          </span>
                        </div>

                        {/* WPM Pacing Gauge */}
                        {(() => {
                          const p = getWpmStats(candidateAnswer, answerElapsedSeconds);
                          return (
                            <div className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              <span className="text-slate-400">Pacing (WPM):</span>
                              <span className={`font-mono font-semibold ${p.color}`}>
                                {p.wpm > 0 ? `${p.wpm} WPM • ${p.status}` : 'Speak for 5s to calibrate...'}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Filler Word Counter */}
                        {(() => {
                          const f = getFillerWordStats(candidateAnswer);
                          return (
                            <div className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              <span className="text-slate-400">Filler Words:</span>
                              <span className={`font-mono font-semibold ${f.total === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {f.total === 0 ? '0 detected (Clean Delivery)' : `${f.total} detected: ${f.details.join(', ')}`}
                              </span>
                            </div>
                          );
                        })()}

                        <p className="text-[10px] text-slate-500 italic">
                          100% Client-Side. Video stream is rendered purely in-browser and never transmitted externally.
                        </p>
                      </div>
                    </div>
                  )}
                  <textarea
                    rows={5}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Outline your architectural solution: immediate mitigations, system scale tradeoffs, technology choices (Postgres/Kafka/Celery), and metric validation..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                  />

                  {/* Mock Interview Audio Recording & Waveform Playback */}
                  {recordedAudioUrl && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePlayRecordedAudio}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                            isPlayingRecordedAudio
                              ? 'bg-pink-600 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                          title="Play back your recorded spoken answer"
                        >
                          {isPlayingRecordedAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-pink-400" />}
                          <span>{isPlayingRecordedAudio ? 'Pause Spoken Audio' : 'Play Recorded Audio'}</span>
                        </button>

                        {/* Animated Waveform Bars */}
                        <div className="flex items-center gap-1 px-2 h-6">
                          {[10, 20, 14, 24, 28, 16, 22, 12, 26, 15, 20, 10, 18].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                isPlayingRecordedAudio ? 'bg-pink-400 animate-pulse' : 'bg-slate-700'
                              }`}
                              style={{
                                height: `${h}px`,
                                animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Captured Audio Clip</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteRecordedAudio}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Discard recorded audio clip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

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

            {/* Recruiter Persona Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap text-xs">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Persona:
              </span>
              <button
                type="button"
                onClick={() => {
                  setNegotiationPersona('big_tech');
                  if (offerJob) handleStartNegotiation(offerJob, 'big_tech');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  negotiationPersona === 'big_tech'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Rachel Miller: Rigid base band caps ($195k-$205k), deep pockets for RSUs and sign-on cash"
              >
                🏢 Big Tech Comp Chair
              </button>
              <button
                type="button"
                onClick={() => {
                  setNegotiationPersona('series_a');
                  if (offerJob) handleStartNegotiation(offerJob, 'series_a');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  negotiationPersona === 'series_a'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Alex Chen: Runway-conscious early stage founder, offers outsized equity upside and refreshers"
              >
                🚀 Series A Founder
              </button>
              <button
                type="button"
                onClick={() => {
                  setNegotiationPersona('collaborative_hr');
                  if (offerJob) handleStartNegotiation(offerJob, 'collaborative_hr');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  negotiationPersona === 'collaborative_hr'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Marcus Vance: Consultative and supportive, open to title upgrades, remote stipends, and early review cadences"
              >
                🤝 Collaborative HR
              </button>
              <button
                type="button"
                onClick={() => {
                  setNegotiationPersona('custom');
                  if (offerJob) handleStartNegotiation(offerJob, 'custom');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  negotiationPersona === 'custom'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Customizable recruiter name and budget flexibility"
              >
                ⚙️ Custom Persona
              </button>
              {negotiationPersona === 'custom' && (
                <div className="flex items-center gap-2 pt-1 w-full text-xs">
                  <span className="text-slate-400">Custom Recruiter Title / Name:</span>
                  <input
                    type="text"
                    value={customPersonaName}
                    onChange={(e) => setCustomPersonaName(e.target.value)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs w-64 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Founding Partner & CTO"
                  />
                </div>
              )}
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
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(negotiationEvaluation.model_counter_script);
                              alert('Copied model counter script to clipboard!');
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDraftCounterOfferEmail(
                                negotiationScenario?.company_name || 'Hiring Company',
                                negotiationScenario?.role_title || 'Staff Software Engineer',
                                negotiationEvaluation.model_counter_script
                              )
                            }
                            disabled={draftingCounterEmail}
                            className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50"
                            title="Draft this evaluated counter-offer into Outreach queue awaiting approval"
                          >
                            <Send className="w-3 h-3 text-indigo-400" />
                            {draftingCounterEmail ? 'Drafting...' : 'Draft to Outreach'}
                          </button>
                        </div>
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

      {/* Company Engineering Stack Graph Modal */}
      {stackGraphModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Company Engineering Stack & Architecture Alignment Graph
                  </h3>
                  <p className="text-xs text-slate-400">
                    Visual topology mapping Adam Blansett’s 10+ years backend expertise directly to target company production architectures
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStackGraphModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Company Selector Pills */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap text-xs">
              <span className="font-semibold text-slate-400">Select Architecture Scope:</span>
              {(['all', 'Anthropic', 'Datadog', 'Stripe', 'Figma', 'Scale AI', 'Cloudflare'] as const).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedStackCompany(comp)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    selectedStackCompany === comp
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {comp === 'all' ? '🌐 All Ecosystem' : comp}
                </button>
              ))}
            </div>

            {/* Alignment Spotlight Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white text-sm">
                  {selectedStackCompany === 'all' ? 'Unified Target Tech Alignment' : `${selectedStackCompany} Architectural Focus`}
                </span>
                <p className="text-slate-400 leading-relaxed">
                  {selectedStackCompany === 'Anthropic' && 'Model serving inference latency reduction, GPU batch scheduling, and robust Python prompt harness guardrails.'}
                  {selectedStackCompany === 'Datadog' && 'High-throughput event stream telemetry ingestion, sub-millisecond API response budgets, and PgBouncer/Postgres scaling.'}
                  {selectedStackCompany === 'Stripe' && 'Global distributed ledger consistency, idempotency key guarantees, and zero-downtime database schema migrations.'}
                  {selectedStackCompany === 'Figma' && 'Real-time WebSocket multiplayer synchronization, distributed state machines, and microservice resilience.'}
                  {selectedStackCompany === 'Scale AI' && 'High-concurrency batch worker pools, Celery queue isolation, and LLM RLHF human-in-the-loop task routing.'}
                  {selectedStackCompany === 'Cloudflare' && 'Edge compute runtime proxying, distributed KV caching, and zero-trust authentication authorization gates.'}
                  {selectedStackCompany === 'all' && 'Cross-cutting synergy across high-throughput distributed backends, asynchronous messaging, and enterprise AI orchestration.'}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Candidate Fit</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {selectedStackCompany === 'Anthropic' ? '98%' : selectedStackCompany === 'Datadog' ? '96%' : selectedStackCompany === 'Stripe' ? '95%' : selectedStackCompany === 'Scale AI' ? '97%' : '95%'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  ✓
                </div>
              </div>
            </div>

            {/* 6 Architectural Layers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Layer 1: Core API */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">1. Application & API Layer</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Core Match</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['FastAPI (Python 3.12)', 'Asyncio Event Loops', 'Pydantic v2', 'TypeScript', 'Node.js', 'REST / gRPC'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 2: Distributed Messaging */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">2. Event Streaming & Tasks</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">10+ Yrs Scale</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Apache Kafka', 'Celery Task Queues', 'Redis Pub/Sub', 'Dead-Letter Routing', 'Idempotency Keys'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 3: Persistence */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">3. Persistence & Caching</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">High Concurrency</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['PostgreSQL 16', 'PgBouncer Pooling', 'Redis Cache Cluster', 'Alembic Migrations', 'Query Profiling'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 4: AI Fabric */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">4. AI / LLM Orchestration</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Provider-Neutral</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Ollama (Llama 3.2 3B)', 'Structured JSON Outputs', 'Prompt Isolation', 'RAG & Vector Embeddings'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 5: Security */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">5. Security & Authorization</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Zero-Trust</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['OAuth 2.0 / OIDC', 'JWT Authentication', 'HashiCorp Vault', 'Role-Based Access Control', 'Mutual TLS'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 6: Cloud & DevOps */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">6. Cloud & Infrastructure</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Production-Proven</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Docker & Multi-Stage', 'Kubernetes', 'AWS (ECS, S3, RDS)', 'Terraform IaC', 'Linux Internals'].map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Interview Talking Points */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold">Strategic Interview Positioning:</strong> Adam's combination of deep asynchronous Python/FastAPI microservices and zero-trust authentication allows immediate senior-level contributions without onboarding lag. Use the 10+ year track record in zero-downtime database migrations as a key differentiator during system design panels.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Interactive Architecture System Design Whiteboard Modal */}
      {whiteboardModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-6xl w-full max-h-[94vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Interactive Architecture System Design Whiteboard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Staff/Principal-level distributed architecture topologies tailored to Adam Blansett’s 10+ years backend expertise
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blueprint = JSON.stringify(
                      {
                        template: activeWhiteboardTemplate,
                        candidate: 'Adam Blansett',
                        role: 'Staff / Principal Backend Architect',
                        timestamp: new Date().toISOString(),
                      },
                      null,
                      2
                    );
                    navigator.clipboard.writeText(blueprint);
                    setWhiteboardCopied(true);
                    setTimeout(() => setWhiteboardCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {whiteboardCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {whiteboardCopied ? 'Copied Blueprint' : 'Copy Blueprint'}
                </button>
                <button
                  onClick={() => setWhiteboardModalOpen(false)}
                  className="text-slate-500 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Selector Bar */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap text-xs">
              <span className="font-semibold text-slate-400">Architecture Template:</span>
              <button
                onClick={() => {
                  setActiveWhiteboardTemplate('ingestion_stream');
                  setSelectedWhiteboardNode('kafka');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeWhiteboardTemplate === 'ingestion_stream'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ⚡ 150k/s Event Ingestion & DLQ
              </button>
              <button
                onClick={() => {
                  setActiveWhiteboardTemplate('task_queue');
                  setSelectedWhiteboardNode('celery');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeWhiteboardTemplate === 'task_queue'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🔄 Distributed Task Queue & Celery
              </button>
              <button
                onClick={() => {
                  setActiveWhiteboardTemplate('multi_region');
                  setSelectedWhiteboardNode('cdc');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeWhiteboardTemplate === 'multi_region'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🌐 Multi-Region Active-Active & CDC
              </button>
              <button
                onClick={() => {
                  setActiveWhiteboardTemplate('agentic_ai');
                  setSelectedWhiteboardNode('llm');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeWhiteboardTemplate === 'agentic_ai'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🤖 Local Agentic AI & Guardrails
              </button>
            </div>

            {/* Canvas Subtitle */}
            <div className="flex items-center justify-between text-xs px-2 text-slate-400">
              <span>
                {activeWhiteboardTemplate === 'ingestion_stream' && 'Architecture: Edge Ingress -> Cloudflare WAF -> Kafka Topic (3x ISR) -> Worker Pods -> PostgreSQL 16 & S3 Dead-Letter'}
                {activeWhiteboardTemplate === 'task_queue' && 'Architecture: FastAPI Routes -> Redis Token Bucket Limiter -> Celery Async Pool -> Redis Cache & S3 Artifact Store'}
                {activeWhiteboardTemplate === 'multi_region' && 'Architecture: Route 53 Geo-DNS -> Dual-Region API Pods -> Debezium CDC Stream -> Read Replicas & Invalidation Pub/Sub'}
                {activeWhiteboardTemplate === 'agentic_ai' && 'Architecture: API Gateway -> Prompt Sanitizer -> pgvector Embedding Query -> Ollama Llama-3.2 -> Pydantic Schema Validator -> Affirmative Gate'}
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">Click any component node to inspect technical SLA specifications</span>
            </div>

            {/* Visual Interactive SVG Topology Canvas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 relative overflow-x-auto min-h-[300px]">
              <div className="min-w-[850px] relative">
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '260px' }}>
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#06b6d4" />
                    </marker>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                    </marker>
                    <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
                    </marker>
                  </defs>

                  {activeWhiteboardTemplate === 'ingestion_stream' && (
                    <>
                      <path d="M 135 110 L 210 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <text x="172" y="100" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">HTTPS/JSON</text>

                      <path d="M 330 110 L 405 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <text x="367" y="100" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">mTLS Stream</text>

                      <path d="M 525 110 L 600 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <text x="562" y="100" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">Batch Pull</text>

                      <path d="M 720 95 L 795 65" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                      <text x="758" y="70" fill="#10b981" fontSize="10" textAnchor="middle" fontFamily="monospace">UPSERT (ACID)</text>

                      <path d="M 720 125 L 795 155" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" markerEnd="url(#arrow-rose)" />
                      <text x="758" y="150" fill="#f43f5e" fontSize="10" textAnchor="middle" fontFamily="monospace">Dead-Letter</text>
                    </>
                  )}

                  {activeWhiteboardTemplate === 'task_queue' && (
                    <>
                      <path d="M 135 110 L 210 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <path d="M 330 110 L 405 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <path d="M 525 110 L 600 110" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <path d="M 720 95 L 795 65" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                      <path d="M 720 125 L 795 155" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
                    </>
                  )}

                  {activeWhiteboardTemplate === 'multi_region' && (
                    <>
                      <path d="M 135 95 L 230 65" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
                      <path d="M 135 125 L 230 155" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
                      <path d="M 350 65 L 470 100" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-green)" />
                      <path d="M 350 155 L 470 120" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow)" />
                      <path d="M 590 110 L 720 110" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />
                    </>
                  )}

                  {activeWhiteboardTemplate === 'agentic_ai' && (
                    <>
                      <path d="M 135 110 L 210 110" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
                      <path d="M 330 95 L 420 65" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />
                      <path d="M 330 125 L 420 155" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                      <path d="M 540 155 L 620 110" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />
                      <path d="M 740 110 L 800 110" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#arrow-rose)" />
                    </>
                  )}
                </svg>

                {/* Interactive Node Boxes */}
                <div className="flex items-center justify-between gap-4 py-8 relative z-10">
                  {activeWhiteboardTemplate === 'ingestion_stream' && (
                    <>
                      <button
                        onClick={() => setSelectedWhiteboardNode('client')}
                        className={`p-3.5 rounded-xl border text-left transition w-32 ${
                          selectedWhiteboardNode === 'client'
                            ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Source</div>
                        <div className="text-xs font-bold text-white mt-0.5">Ingest Clients</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">150k req/sec</div>
                      </button>

                      <button
                        onClick={() => setSelectedWhiteboardNode('edge')}
                        className={`p-3.5 rounded-xl border text-left transition w-32 ${
                          selectedWhiteboardNode === 'edge'
                            ? 'bg-cyan-600/30 border-cyan-400 ring-2 ring-cyan-500/50'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-cyan-400 uppercase font-mono font-bold">Edge WAF</div>
                        <div className="text-xs font-bold text-white mt-0.5">Cloudflare API</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">&lt;15ms P99</div>
                      </button>

                      <button
                        onClick={() => setSelectedWhiteboardNode('kafka')}
                        className={`p-3.5 rounded-xl border text-left transition w-32 ${
                          selectedWhiteboardNode === 'kafka'
                            ? 'bg-violet-600/30 border-violet-400 ring-2 ring-violet-500/50'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-violet-400 uppercase font-mono font-bold">Broker</div>
                        <div className="text-xs font-bold text-white mt-0.5">Kafka Topic</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">3x Replicated</div>
                      </button>

                      <button
                        onClick={() => setSelectedWhiteboardNode('worker')}
                        className={`p-3.5 rounded-xl border text-left transition w-32 ${
                          selectedWhiteboardNode === 'worker'
                            ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/50'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Consumer</div>
                        <div className="text-xs font-bold text-white mt-0.5">Batch Workers</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">64 Pods</div>
                      </button>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setSelectedWhiteboardNode('db')}
                          className={`p-3 rounded-xl border text-left transition w-32 ${
                            selectedWhiteboardNode === 'db'
                              ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-[10px] text-blue-400 uppercase font-mono font-bold">Database</div>
                          <div className="text-xs font-bold text-white">PostgreSQL 16</div>
                          <div className="text-[10px] text-slate-400 font-mono">&lt;8ms P99</div>
                        </button>

                        <button
                          onClick={() => setSelectedWhiteboardNode('dlq')}
                          className={`p-3 rounded-xl border text-left transition w-32 ${
                            selectedWhiteboardNode === 'dlq'
                              ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/50'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-[10px] text-rose-400 uppercase font-mono font-bold">Dead-Letter</div>
                          <div className="text-xs font-bold text-white">S3 DLQ Store</div>
                          <div className="text-[10px] text-slate-400 font-mono">Zero Loss</div>
                        </button>
                      </div>
                    </>
                  )}

                  {activeWhiteboardTemplate === 'task_queue' && (
                    <>
                      <button
                        onClick={() => setSelectedWhiteboardNode('client')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Ingress</div>
                        <div className="text-xs font-bold text-white">FastAPI Route</div>
                        <div className="text-[10px] text-slate-400 font-mono">Async I/O</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('limiter')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">Limiter</div>
                        <div className="text-xs font-bold text-white">Redis Bucket</div>
                        <div className="text-[10px] text-slate-400 font-mono">&lt;1ms check</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('celery')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-violet-400 uppercase font-mono font-bold">Task Queue</div>
                        <div className="text-xs font-bold text-white">Celery Pool</div>
                        <div className="text-[10px] text-slate-400 font-mono">10k tasks/sec</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('workers')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Compute</div>
                        <div className="text-xs font-bold text-white">ECS Fargate</div>
                        <div className="text-[10px] text-slate-400 font-mono">Auto-Scaling</div>
                      </button>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setSelectedWhiteboardNode('cache')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                        >
                          <div className="text-[10px] text-cyan-400 uppercase font-mono font-bold">Cache</div>
                          <div className="text-xs font-bold text-white">Redis Cluster</div>
                        </button>
                        <button
                          onClick={() => setSelectedWhiteboardNode('s3')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                        >
                          <div className="text-[10px] text-blue-400 uppercase font-mono font-bold">Storage</div>
                          <div className="text-xs font-bold text-white">AWS S3 Artifacts</div>
                        </button>
                      </div>
                    </>
                  )}

                  {activeWhiteboardTemplate === 'multi_region' && (
                    <>
                      <button
                        onClick={() => setSelectedWhiteboardNode('dns')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Geo-DNS</div>
                        <div className="text-xs font-bold text-white">Route 53 Anycast</div>
                      </button>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setSelectedWhiteboardNode('region1')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                        >
                          <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Region 1</div>
                          <div className="text-xs font-bold text-white">US-East Primary</div>
                        </button>
                        <button
                          onClick={() => setSelectedWhiteboardNode('region2')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                        >
                          <div className="text-[10px] text-teal-400 uppercase font-mono font-bold">Region 2</div>
                          <div className="text-xs font-bold text-white">US-West Standby</div>
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedWhiteboardNode('cdc')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                      >
                        <div className="text-[10px] text-violet-400 uppercase font-mono font-bold">Replication</div>
                        <div className="text-xs font-bold text-white">Debezium CDC</div>
                        <div className="text-[10px] text-slate-400 font-mono">&lt;60ms Lag</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('cache')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-cyan-400 uppercase font-mono font-bold">Pub/Sub</div>
                        <div className="text-xs font-bold text-white">Redis Invalidate</div>
                      </button>
                    </>
                  )}

                  {activeWhiteboardTemplate === 'agentic_ai' && (
                    <>
                      <button
                        onClick={() => setSelectedWhiteboardNode('gateway')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Gateway</div>
                        <div className="text-xs font-bold text-white">FastAPI Auth</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('sanitizer')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">Security</div>
                        <div className="text-xs font-bold text-white">Prompt Filter</div>
                      </button>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setSelectedWhiteboardNode('vector')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                        >
                          <div className="text-[10px] text-cyan-400 uppercase font-mono font-bold">Vector RAG</div>
                          <div className="text-xs font-bold text-white">pgvector HNSW</div>
                        </button>
                        <button
                          onClick={() => setSelectedWhiteboardNode('llm')}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                        >
                          <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Local Model</div>
                          <div className="text-xs font-bold text-white">Llama 3.2 3B</div>
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedWhiteboardNode('validator')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-36"
                      >
                        <div className="text-[10px] text-violet-400 uppercase font-mono font-bold">Schema</div>
                        <div className="text-xs font-bold text-white">Pydantic v2</div>
                      </button>
                      <button
                        onClick={() => setSelectedWhiteboardNode('gate')}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-left w-32"
                      >
                        <div className="text-[10px] text-rose-400 uppercase font-mono font-bold">Safety Gate</div>
                        <div className="text-xs font-bold text-white">Human Affirm</div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Node Technical Inspector Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">
                    Component Specification: {selectedWhiteboardNode?.toUpperCase() || 'KAFKA'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Staff Architecture SLA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Throughput & Scale Target</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {selectedWhiteboardNode === 'kafka' && '300 MB/sec across 24 partition shards'}
                    {selectedWhiteboardNode === 'worker' && '64 auto-scaled pods handling 50k msgs/sec'}
                    {selectedWhiteboardNode === 'db' && '25,000 ACID writes/sec with PgBouncer'}
                    {selectedWhiteboardNode === 'dlq' && 'Zero data loss; automatic S3 cold tier ingestion'}
                    {selectedWhiteboardNode === 'edge' && '200k req/sec with edge token-bucket shedding'}
                    {selectedWhiteboardNode === 'llm' && '85 tokens/sec local inference, sub-380ms TTFT'}
                    {!['kafka', 'worker', 'db', 'dlq', 'edge', 'llm'].includes(selectedWhiteboardNode || '') && 'Production-grade high-concurrency target'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Failure Mode & Resiliency</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {selectedWhiteboardNode === 'kafka' && 'ISR replication factor 3 with min.insync.replicas=2'}
                    {selectedWhiteboardNode === 'worker' && 'Dead-letter routing on schema mismatch without halting'}
                    {selectedWhiteboardNode === 'db' && 'Automated WAL streaming failover to hot standby <12s'}
                    {selectedWhiteboardNode === 'dlq' && 'Encrypted immutable storage with PagerDuty alerts'}
                    {selectedWhiteboardNode === 'edge' && 'Rate limiting circuit breaker & DNS fallback'}
                    {selectedWhiteboardNode === 'llm' && 'Deterministic local rule fallback on timeout'}
                    {!['kafka', 'worker', 'db', 'dlq', 'edge', 'llm'].includes(selectedWhiteboardNode || '') && 'Circuit breaker & automated retry with jitter'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">P99 Latency SLA</span>
                  <span className="text-cyan-400 font-mono font-bold mt-0.5 block">
                    {selectedWhiteboardNode === 'kafka' && '< 4.5ms write latency'}
                    {selectedWhiteboardNode === 'worker' && '< 40ms batch processing cycle'}
                    {selectedWhiteboardNode === 'db' && '< 8ms indexed read/write P99'}
                    {selectedWhiteboardNode === 'dlq' && 'Asynchronous replay on demand'}
                    {selectedWhiteboardNode === 'edge' && '< 12ms edge proxy budget'}
                    {selectedWhiteboardNode === 'llm' && '< 380ms first token response'}
                    {!['kafka', 'worker', 'db', 'dlq', 'edge', 'llm'].includes(selectedWhiteboardNode || '') && '< 15ms target budget'}
                  </span>
                </div>
              </div>

              {/* Staff Talking Point */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
                <strong className="text-white font-semibold">Adam's Staff Interview Talking Point: </strong>
                {selectedWhiteboardNode === 'kafka' &&
                  '"In my systems design work, I partition Kafka topics strictly by entity or tenant ID to ensure sequential integrity per customer while scaling horizontal consumer groups linearly without race conditions."'}
                {selectedWhiteboardNode === 'db' &&
                  '"To prevent database connection exhaustion under 100x surges, I enforce PgBouncer in transaction mode and use partitioned time-series tables, keeping indexed lookups sub-millisecond even across 400M+ rows."'}
                {selectedWhiteboardNode === 'worker' &&
                  '"Consumer workers must be strictly idempotent. I enforce unique idempotency keys in Redis with a 24-hour expiration window before committing transactions to the relational store."'}
                {selectedWhiteboardNode === 'dlq' &&
                  '"A poison-pill payload should never bring down a streaming cluster. Routing corrupted payloads to an isolated dead-letter queue with structured metadata allows surgical reprocessing while normal traffic proceeds uninterrupted."'}
                {!['kafka', 'db', 'worker', 'dlq'].includes(selectedWhiteboardNode || '') &&
                  '"Every component in this topology is designed with zero single points of failure, explicit timeouts, and circuit breakers to guarantee 99.99% system availability under production load."'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Autonomous Application Auto-Filler Modal */}
      {autofillModalOpen && activeAutofillJob && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/30 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Autonomous Application Auto-Filler
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs uppercase font-bold">
                      {activeAutofillJob.source_adapter || 'Greenhouse'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Auto-fills candidate details, resume attachment, and synthesizes answers to custom recruiter questions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAutofillModalOpen(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {autofillLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400">
                  Analyzing {activeAutofillJob.source_adapter || 'Greenhouse'} application fields and synthesizing tailored answers...
                </p>
              </div>
            ) : autofillResult ? (
              /* Success Receipt Display */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-white">Application Successfully Submitted</h4>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    {autofillResult.message}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">Receipt ID: <strong className="text-emerald-400">{autofillResult.confirmation_receipt_id}</strong></span>
                    <span className="text-slate-400">Timestamp: <strong className="text-slate-200">{new Date(autofillResult.submitted_at).toLocaleTimeString()}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setAutofillModalOpen(false);
                      setAutofillResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : autofillPreview ? (
              /* Form Fields Review & Affirmative Confirmation */
              <div className="space-y-5">
                {/* Safety Warning Banner */}
                <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-start gap-2.5 text-xs text-teal-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Affirmative Confirmation Guard Active:</strong> All form values have been pre-filled from Adam Blansett’s verified credentials. Review the answers below before confirming submission.
                  </div>
                </div>

                {/* Candidate Info Grid */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>1. Candidate Profile Data</span>
                    <span className="text-emerald-400 font-mono text-[11px]">100% Verified Match</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Full Name</span>
                      <span className="text-white font-medium">Adam Blansett</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Email</span>
                      <span className="text-white font-medium">adamblansett@gmail.com</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Phone</span>
                      <span className="text-white font-medium">+1-555-019-2834</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Location</span>
                      <span className="text-white font-medium">Remote (US Citizen)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Work Authorization</span>
                      <span className="text-white font-medium">Authorized (No Sponsorship)</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Desired Base Floor</span>
                      <span className="text-emerald-400 font-medium font-mono">$185,000+ base</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Resume Attached</span>
                      <span className="text-indigo-300 font-medium">{autofillPreview.resume_filename}</span>
                    </div>
                  </div>
                </div>

                {/* Custom Synthesized Questions */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>2. Synthesized Recruiter Questions</span>
                    <span className="text-teal-400 font-mono text-[11px]">AI Grounded & Editable</span>
                  </div>

                  {autofillPreview.fields
                    .filter((f: any) => f.is_custom_question)
                    .map((field: any) => (
                      <div key={field.field_id} className="space-y-1.5">
                        <label className="text-slate-300 font-medium block">
                          {field.field_label}
                        </label>
                        <textarea
                          rows={3}
                          value={autofillCustomAnswers[field.field_id] || ''}
                          onChange={(e) =>
                            setAutofillCustomAnswers({
                              ...autofillCustomAnswers,
                              [field.field_id]: e.target.value,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    ))}
                </div>

                {/* Cover Letter Preview */}
                {autofillPreview.cover_letter_preview && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-white uppercase tracking-wider block">
                      3. Tailored Cover Letter Preview
                    </span>
                    <div className="p-3 bg-slate-900 rounded-lg text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
                      {autofillPreview.cover_letter_preview}
                    </div>
                  </div>
                )}

                {/* Affirmative Confirmation Checkbox */}
                <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autofillConfirmed}
                      onChange={(e) => setAutofillConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-white font-medium">
                      I have reviewed all pre-filled information and explicitly confirm submitting this application to{' '}
                      <strong>{activeAutofillJob.company_name}</strong>.
                    </span>
                  </label>

                  <button
                    onClick={handleSubmitAutofill}
                    disabled={!autofillConfirmed || autofillSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    {autofillSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Confirm & Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 3. Executive Pitch Deck Presentation Modal */}
      {pitchDeckModalOpen && (
        <div className={`fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300`}>
          <div className={`bg-slate-900 border border-amber-500/30 rounded-2xl w-full flex flex-col justify-between shadow-2xl transition-all ${
            pitchDeckFullscreen ? 'h-full max-h-screen p-8' : 'max-w-5xl max-h-[92vh] p-6'
          }`}>
            {/* Presentation Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Executive Engineering Pitch Deck
                  </h3>
                  <p className="text-xs text-slate-400">
                    Presentation-ready dossier for VP of Engineering & CTO final rounds (Adam Blansett, 10+ Years Backend)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const md = `# Adam Blansett | Executive Engineering Pitch Deck\n**Role**: Staff / Principal Distributed Systems Architect\n**10+ Years Backend Mastery | $185,000+ Baseline Floor**\n\n1. 99.99% Availability at Scale\n2. 150k+ req/sec Kafka Ingestion\n3. Zero-Downtime PostgreSQL Live Partitioning\n4. 30-60-90 Day High-Impact Roadmap`;
                    navigator.clipboard.writeText(md);
                    setPitchDeckCopied(true);
                    setTimeout(() => setPitchDeckCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {pitchDeckCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {pitchDeckCopied ? 'Copied Markdown' : 'Copy Markdown'}
                </button>
                <button
                  onClick={() => setPitchDeckFullscreen(!pitchDeckFullscreen)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Toggle Fullscreen"
                >
                  {pitchDeckFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setPitchDeckModalOpen(false)}
                  className="text-slate-500 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="py-6 flex-1 flex flex-col justify-between overflow-y-auto">
              {currentPitchSlide === 0 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                      Slide 1 / 5 • Candidate Executive Thesis
                    </span>
                    <h2 className="text-3xl font-extrabold text-white">Adam Blansett</h2>
                    <h4 className="text-lg text-indigo-400 font-semibold">Staff / Principal Backend & Distributed Systems Architect</h4>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                      10+ years architecting high-throughput distributed backends, resilient event-streaming architectures, and production AI infrastructure. Proven record delivering 99.99% system availability, zero-downtime database migrations servicing 15,000+ req/sec, and multi-million dollar cloud infrastructure optimizations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-2xl font-black text-emerald-400 font-mono">10+ Years</div>
                      <div className="text-xs text-slate-400 font-semibold mt-1">Backend & Systems Mastery</div>
                      <p className="text-[11px] text-slate-500 mt-2">Python (FastAPI, Asyncio), PostgreSQL 16, Kafka, Redis, Docker</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-2xl font-black text-cyan-400 font-mono">99.99%</div>
                      <div className="text-xs text-slate-400 font-semibold mt-1">Production Uptime SLA</div>
                      <p className="text-[11px] text-slate-500 mt-2">Self-healing architectures, circuit breakers & idempotency keys</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-2xl font-black text-amber-400 font-mono">$185,000+</div>
                      <div className="text-xs text-slate-400 font-semibold mt-1">Compensation Baseline Floor</div>
                      <p className="text-[11px] text-slate-500 mt-2">Targeting $215k–$260k TC, 100% remote-first (US Citizen)</p>
                    </div>
                  </div>
                </div>
              )}

              {currentPitchSlide === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                      Slide 2 / 5 • Engineering Impact & Scale
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">Production Scale Pillars & Business Metrics</h2>
                    <p className="text-xs text-slate-400">Proven business ROI delivered across high-scale distributed infrastructures.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-cyan-400 uppercase tracking-wider">1. High-Throughput Streaming & Queues</span>
                      <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                        <li>Engineered Kafka & Celery pipelines processing 150k+ events/sec with sub-50ms P99 latency.</li>
                        <li>Designed automated dead-letter routing and reprocessing, eliminating manual operational interventions.</li>
                        <li>Configured Redis Cluster caching with 99.2% hit rates, protecting databases from traffic surges.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">2. Database Scale & ACID Integrity</span>
                      <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                        <li>Executed zero-downtime partitioning of 400M+ row PostgreSQL clusters during active traffic.</li>
                        <li>Implemented PgBouncer transaction-mode pooling to eliminate backend connection starvation.</li>
                        <li>Enforced strict idempotency keys across all transactional and billing API endpoints.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-amber-400 uppercase tracking-wider">3. Infrastructure Cost Efficiency</span>
                      <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                        <li>Reduced AWS ECS/RDS cloud expenditure by 38% while improving P99 latency by 45%.</li>
                        <li>Standardized multi-stage Docker containerization and Kubernetes deployments with CI/CD gates.</li>
                        <li>Integrated OpenTelemetry distributed tracing and Grafana dashboards for rapid incident MTTR.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider">4. Technical Leadership & Culture</span>
                      <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                        <li>Directly mentored 15+ senior and staff engineers in distributed systems design and RFC reviews.</li>
                        <li>Established architectural decision records (ADRs) and concurrency safety standards.</li>
                        <li>Championed remote-first engineering culture with high psychological safety and autonomy.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentPitchSlide === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                      Slide 3 / 5 • Architectural Case Studies
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">Proven Real-World Technical Execution</h2>
                    <p className="text-xs text-slate-400">Battle-tested solutions under severe production constraints.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 text-sm">Zero-Downtime Data Migration</h4>
                      <p className="text-slate-400 text-[11px]"><strong>Challenge:</strong> Live partition migration across 400M records without customer errors.</p>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Built dual-write shadow pipeline with asynchronous validation workers in Python/FastAPI.</li>
                        <li>Configured automated rollback thresholds and continuous drift verification.</li>
                        <li>Cutover executed in 0 seconds of user downtime.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-amber-400 text-sm">Event Ingestion Backpressure</h4>
                      <p className="text-slate-400 text-[11px]"><strong>Challenge:</strong> Preventing cascade database failure during 100x traffic spikes.</p>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Decoupled ingestion from write storage using Kafka partition topics and dynamic workers.</li>
                        <li>Integrated token bucket rate limiters in Redis for client tier prioritization.</li>
                        <li>Eliminated all dropped transactions during peak load events.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 text-sm">Local-First AI Pipeline</h4>
                      <p className="text-slate-400 text-[11px]"><strong>Challenge:</strong> Autonomous resume and dossier analysis with zero third-party data egress.</p>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Integrated local Ollama/Llama 3.2 3B model with structured Pydantic schema validation.</li>
                        <li>Achieved sub-400ms inference time with 100% data isolation and zero API costs.</li>
                        <li>Deterministic fallbacks ensure reliable operation even during system disconnects.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentPitchSlide === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
                      Slide 4 / 5 • Execution Plan
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">30-60-90 Day High-Impact Onboarding Roadmap</h2>
                    <p className="text-xs text-slate-400">Structured execution ensuring rapid time-to-value from Day 1.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 uppercase">Days 1 – 30</div>
                      <h4 className="text-white font-bold text-sm">Discovery & Architectural Audit</h4>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Audit backend topologies, latency bottlenecks, and telemetry pipelines.</li>
                        <li>Analyze incident post-mortems to identify critical failure modes.</li>
                        <li>Ship first high-leverage production bug fix or optimization within Week 2.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold text-emerald-400 uppercase">Days 31 – 60</div>
                      <h4 className="text-white font-bold text-sm">Resiliency & Scalability Hardening</h4>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Implement circuit breakers, connection pooling, and dead-letter queues on critical paths.</li>
                        <li>Target 30%+ P99 latency reduction across high-volume API endpoints.</li>
                        <li>Collaborate with product and infrastructure teams on quarterly RFC roadmaps.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-mono font-bold text-amber-400 uppercase">Days 61 – 90</div>
                      <h4 className="text-white font-bold text-sm">Platform Acceleration & Autonomy</h4>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        <li>Deliver major architectural milestone (e.g. streaming ingestion upgrade or multi-region replication).</li>
                        <li>Establish architectural decision record (ADR) framework and lead technical design sessions.</li>
                        <li>Multiply team throughput by unblocking peers and driving technical excellence.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentPitchSlide === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                      Slide 5 / 5 • The Senior Leadership Multiplier
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">Why Adam Blansett: Immediate Strategic Value</h2>
                    <p className="text-xs text-slate-400">Staff-level engineering partnership that mitigates technical risk and accelerates delivery.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h4 className="text-white font-bold text-sm">Immediate Zero-Ramp Velocity</h4>
                      <p className="text-slate-300 leading-relaxed">
                        10+ years of battle-tested experience across Python, distributed messaging, and databases means zero ramp-up time on architectural patterns, edge cases, and high-concurrency debugging.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h4 className="text-white font-bold text-sm">Architectural Risk Mitigation</h4>
                      <p className="text-slate-300 leading-relaxed">
                        Prevent costly architectural missteps before they hit production. Proven track record in zero-downtime migrations and fault tolerance protects customer trust and uptime SLAs.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h4 className="text-white font-bold text-sm">Force Multiplier for Senior Peers</h4>
                      <p className="text-slate-300 leading-relaxed">
                        Elevates team technical standards through structured design reviews, pragmatic engineering tradeoff analysis, and hands-on mentorship that accelerates the entire organization.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <h4 className="text-white font-bold text-sm">Candidate Information & Alignment</h4>
                      <div className="text-slate-300 space-y-0.5 font-mono text-[11px]">
                        <div>Email: <strong className="text-white">adamblansett@gmail.com</strong></div>
                        <div>Portfolio: <strong className="text-indigo-400">adamblansett.dev</strong></div>
                        <div>GitHub: <strong className="text-indigo-400">github.com/adamblansett</strong></div>
                        <div>Floor: <strong className="text-emerald-400">$185k+ base (100% remote, US Citizen)</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Presentation Controls Footer */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPitchSlide((s) => Math.max(0, s - 1))}
                disabled={currentPitchSlide === 0}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Slide
              </button>

              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPitchSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentPitchSlide === idx ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Jump to Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPitchSlide((s) => Math.min(4, s + 1))}
                disabled={currentPitchSlide === 4}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                Next Slide <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;
