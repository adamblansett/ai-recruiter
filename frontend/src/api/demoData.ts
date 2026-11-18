// Rich Mock Datasets for Offline Demo Mode & Disconnected Environments

export interface MockCompanyDossier {
  job_id: string;
  company_name: string;
  domain: string;
  industry: string;
  funding_stage: string;
  engineering_scale: string;
  primary_tech_stack: string[];
  engineering_blog_highlights: string[];
  interview_process_notes: string;
  leadership: Array<{
    name: string;
    role: string;
    background: string;
  }>;
  strategic_candidate_positioning: string;
}

export interface MockCalendarSlot {
  day: string;
  date_str: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface MockCalendarAvailability {
  calendar_connected: boolean;
  calendar_id: string;
  time_zone: string;
  total_slots: number;
  open_slots: MockCalendarSlot[];
  formatted_availability_snippet: string;
}

export const MOCK_JOBS = [
  {
    id: "d8c11e3b-5517-4ef6-bb4d-17e9ecbf9901",
    company_name: "Stripe",
    company_domain: "stripe.com",
    title: "Staff Backend Engineer - Core Infrastructure",
    location: "Remote (US)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 215000,
    max_salary: 260000,
    currency: "USD",
    source_adapter: "Greenhouse",
    source_url: "https://stripe.com/jobs/staff-backend-infra",
    raw_description: "Lead foundational distributed systems and API reliability at global financial scale. Build high-throughput event pipelines, distributed ledgers, and resilient microservices in Go, Python, and Ruby.",
    pipeline_stage: "EVALUATED",
    discovered_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "f3b20e4c-6628-4fa7-cc5e-28f0fdca0002",
    company_name: "Datadog",
    company_domain: "datadoghq.com",
    title: "Lead AI Systems & Observability Engineer",
    location: "Remote (US/Canada)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 200000,
    max_salary: 245000,
    currency: "USD",
    source_adapter: "Lever",
    source_url: "https://datadoghq.com/jobs/lead-ai-systems",
    raw_description: "Architect high-performance telemetry ingestion and streaming analytics for modern LLM and AI application workloads. Scale Kafka, Go, and Python services processing petabytes daily.",
    pipeline_stage: "INTERVIEWING",
    discovered_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "a1c34e5d-7739-4eb8-dd6f-39a1aebb1103",
    company_name: "Anthropic",
    company_domain: "anthropic.com",
    title: "Principal Distributed Systems Engineer - Model Serving",
    location: "Remote (US)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 230000,
    max_salary: 285000,
    currency: "USD",
    source_adapter: "Greenhouse",
    source_url: "https://anthropic.com/jobs/principal-distributed-systems",
    raw_description: "Build robust, low-latency inference orchestration and batch evaluation pipelines for Claude models. Deep distributed systems, GPU cluster scheduling, and Python/Rust networking.",
    pipeline_stage: "QUALIFIED",
    discovered_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: "b4d56e7e-8840-4fc9-ee7a-40b2bfcc2204",
    company_name: "Scale AI",
    company_domain: "scale.com",
    title: "Staff Machine Learning Platform Engineer",
    location: "Remote (US)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 210000,
    max_salary: 250000,
    currency: "USD",
    source_adapter: "Lever",
    source_url: "https://scale.com/jobs/staff-ml-platform",
    raw_description: "Design automated data labeling and generative AI evaluation pipelines. Requires deep Python, Kubernetes, Redis, Celery, and PostgreSQL async architectures.",
    pipeline_stage: "OUTREACH_PENDING",
    discovered_at: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    id: "c5e67f8f-9951-4ad0-ff8b-51c3cadd3305",
    company_name: "Vercel",
    company_domain: "vercel.com",
    title: "Senior Staff Software Engineer - Edge Runtime & Data",
    location: "Remote (US)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 195000,
    max_salary: 240000,
    currency: "USD",
    source_adapter: "Greenhouse",
    source_url: "https://vercel.com/jobs/staff-edge-runtime",
    raw_description: "Scale Vercel's global edge infrastructure, serverless compute runtime, and high-concurrency event handling systems across worldwide regions.",
    pipeline_stage: "DISCOVERED",
    discovered_at: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
  {
    id: "e6f78a9a-0062-4be1-aa9c-62d4dbee4406",
    company_name: "Figma",
    company_domain: "figma.com",
    title: "Staff Backend Infrastructure Architect",
    location: "Remote (US)",
    remote_type: "FULLY_REMOTE",
    employment_type: "FULL_TIME",
    min_salary: 220000,
    max_salary: 270000,
    currency: "USD",
    source_adapter: "Greenhouse",
    source_url: "https://figma.com/jobs/staff-infra-architect",
    raw_description: "Architect multiplayer collaboration engines, operational transformation pipelines, and high-performance backend microservices with zero downtime tolerance.",
    pipeline_stage: "OFFER_RECEIVED",
    discovered_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export const MOCK_RECRUITERS = [
  {
    id: "rec-01-stripe",
    company_id: "comp-stripe",
    company_name: "Stripe",
    full_name: "Marcus Vance",
    title: "Principal Technical Recruiter - Core Infrastructure",
    recruiter_type: "INTERNAL_TA",
    linkedin_url: "https://linkedin.com/in/marcus-vance-recruiter",
    public_profile_url: null,
    source_of_discovery: "Greenhouse Job Metadata & Domain MX Enrichment",
    notes: "Direct contact for Infrastructure and Platform Engineering orgs.",
    contacts: [
      {
        id: "cnt-01",
        contact_type: "WORK_EMAIL",
        contact_value: "marcus.vance@stripe.com",
        is_verified: true,
        verification_method: "SMTP_MX_HANDSHAKE",
        confidence_score: 0.98,
      },
    ],
  },
  {
    id: "rec-02-datadog",
    company_id: "comp-datadog",
    company_name: "Datadog",
    full_name: "Elena Rostova",
    title: "Director of Engineering Talent",
    recruiter_type: "HIRING_MANAGER",
    linkedin_url: "https://linkedin.com/in/elena-rostova-tech-leader",
    public_profile_url: null,
    source_of_discovery: "Engineering Leadership Graph & Verified MX Records",
    notes: "Oversees AI telemetry and streaming ingestion hiring.",
    contacts: [
      {
        id: "cnt-02",
        contact_type: "WORK_EMAIL",
        contact_value: "elena.rostova@datadoghq.com",
        is_verified: true,
        verification_method: "SMTP_MX_HANDSHAKE",
        confidence_score: 0.96,
      },
    ],
  },
  {
    id: "rec-03-anthropic",
    company_id: "comp-anthropic",
    company_name: "Anthropic",
    full_name: "David Chen",
    title: "Lead Technical Recruiter - Systems & Inference",
    recruiter_type: "INTERNAL_TA",
    linkedin_url: "https://linkedin.com/in/david-chen-ai-talent",
    public_profile_url: null,
    source_of_discovery: "Anthropic Engineering Careers & Domain Match",
    notes: "Point of contact for distributed model serving roles.",
    contacts: [
      {
        id: "cnt-03",
        contact_type: "WORK_EMAIL",
        contact_value: "dchen@anthropic.com",
        is_verified: true,
        verification_method: "SMTP_MX_HANDSHAKE",
        confidence_score: 0.94,
      },
    ],
  },
  {
    id: "rec-04-scale",
    company_id: "comp-scale",
    company_name: "Scale AI",
    full_name: "Rachel Miller",
    title: "Senior Technical Talent Partner",
    recruiter_type: "INTERNAL_TA",
    linkedin_url: "https://linkedin.com/in/rachel-miller-scale",
    public_profile_url: null,
    source_of_discovery: "Lever Discovery Pipeline",
    notes: "Dedicated partner for ML Platform and Foundation teams.",
    contacts: [
      {
        id: "cnt-04",
        contact_type: "WORK_EMAIL",
        contact_value: "rachel.m@scale.com",
        is_verified: true,
        verification_method: "SMTP_MX_HANDSHAKE",
        confidence_score: 0.92,
      },
    ],
  },
];

export const MOCK_OUTREACH_DRAFTS = [
  {
    id: "out-01",
    job_id: "d8c11e3b-5517-4ef6-bb4d-17e9ecbf9901",
    recruiter_id: "rec-01-stripe",
    channel: "GMAIL",
    subject: "Staff Backend Infrastructure — Adam Blansett (10+ Yrs Distributed Systems)",
    body_markdown: `Hi Marcus,

I noticed Stripe's search for a Staff Backend Engineer on Core Infrastructure. Over the past 10+ years, I have architected high-throughput distributed systems, asynchronous event pipelines, and resilient microservices capable of processing millions of events per second with zero downtime.

Given Stripe's focus on fault tolerance and transactional integrity across global financial services, my background in designing low-latency architectures in Python, Go, PostgreSQL, and event streaming aligns closely with your team's roadmap.

I've attached my tailored single-page resume for your review. If your calendar permits, I would welcome 15 minutes to discuss how my experience can accelerate your core infrastructure milestones.

Best regards,  
**Adam Blansett**  
Senior / Staff Backend & Systems Engineer  
*100% Remote (US Citizen)*  
LinkedIn: linkedin.com/in/adamblansett | GitHub: github.com/adamblansett`,
    status: "PENDING_APPROVAL",
    recruiter_name: "Marcus Vance",
    recruiter_email: "marcus.vance@stripe.com",
    job_title: "Staff Backend Engineer - Core Infrastructure",
    company_name: "Stripe",
    approved_at: null,
    sent_at: null,
    external_message_id: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "out-02",
    job_id: "b4d56e7e-8840-4fc9-ee7a-40b2bfcc2204",
    recruiter_id: "rec-04-scale",
    channel: "GMAIL",
    subject: "Scale AI ML Platform Engineering — Adam Blansett",
    body_markdown: `Hi Rachel,

I came across Scale AI's opening for a Staff ML Platform Engineer. With a decade of production backend engineering spanning Celery/Redis task orchestration, async PostgreSQL, and AI application workflows, I would love to connect.

Looking forward to connecting when convenient!

Warmly,  
**Adam Blansett**`,
    status: "APPROVED",
    recruiter_name: "Rachel Miller",
    recruiter_email: "rachel.m@scale.com",
    job_title: "Staff Machine Learning Platform Engineer",
    company_name: "Scale AI",
    approved_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    sent_at: null,
    external_message_id: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "out-03",
    job_id: "f3b20e4c-6628-4fa7-cc5e-28f0fdca0002",
    recruiter_id: "rec-02-datadog",
    channel: "GMAIL",
    subject: "Datadog AI Systems & Observability — Adam Blansett",
    body_markdown: `Hi Elena,

Thank you for reviewing my background. Attached is my updated engineering resume highlighting petabyte-scale telemetry pipelines and LLM observability tooling.

Best regards,  
**Adam Blansett**`,
    status: "SENT",
    recruiter_name: "Elena Rostova",
    recruiter_email: "elena.rostova@datadoghq.com",
    job_title: "Lead AI Systems & Observability Engineer",
    company_name: "Datadog",
    approved_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    sent_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    external_message_id: "msg_gmail_datadog_thread_8829",
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
  },
];

export const MOCK_PROFILE = {
  id: "profile-adam-blansett",
  headline: "Staff / Senior Backend & AI Systems Software Engineer (10+ Years Experience)",
  summary: "Accomplished Senior/Staff Backend Engineer with over a decade of production experience architecting distributed microservices, low-latency APIs, event-driven streaming pipelines, and local AI agent infrastructure. US Citizen, 100% remote-first advocate.",
  target_seniority: "Staff / Senior+",
  location_base: "United States",
  remote_preference: "FULLY_REMOTE_ONLY",
  target_min_salary: 185000,
  preferred_currency: "USD",
  skills: [
    { id: "sk-1", name: "Python / FastAPI / AsyncIO", category: "Backend Architecture", years_experience: 10, proficiency_level: "EXPERT", is_primary: true },
    { id: "sk-2", name: "Distributed Systems & Microservices", category: "Architecture", years_experience: 9, proficiency_level: "EXPERT", is_primary: true },
    { id: "sk-3", name: "PostgreSQL & Database Design", category: "Persistence", years_experience: 10, proficiency_level: "EXPERT", is_primary: true },
    { id: "sk-4", name: "Redis & Celery Task Brokers", category: "Async Processing", years_experience: 8, proficiency_level: "ADVANCED", is_primary: true },
    { id: "sk-5", name: "Local Open-Weight LLMs (Llama, Ollama)", category: "AI / ML", years_experience: 3, proficiency_level: "ADVANCED", is_primary: true },
    { id: "sk-6", name: "Docker, Kubernetes & Cloud (AWS/GCP)", category: "DevOps / Infra", years_experience: 8, proficiency_level: "ADVANCED", is_primary: false },
    { id: "sk-7", name: "TypeScript / React", category: "Fullstack", years_experience: 6, proficiency_level: "COMPETENT", is_primary: false },
  ],
  resumes: [
    {
      id: "res-master-01",
      label: "Adam_Blansett_Master_Resume_2026.pdf",
      file_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      file_size_bytes: 84320,
      is_primary: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ],
};

export const MOCK_ANALYTICS = {
  summary: {
    total_jobs: 62,
    qualified_jobs: 24,
    emails_awaiting_approval: 4,
    emails_sent: 16,
    responses_received: 6,
    response_rate_percent: 37.5,
    interviews_scheduled: 3,
    offers_received: 1,
    avg_target_salary: 221500,
  },
  funnel_stages: [
    { stage: "DISCOVERED", count: 62, label: "Total Discovered" },
    { stage: "QUALIFIED", count: 24, label: "AI & Criteria Qualified" },
    { stage: "OUTREACH_PENDING", count: 18, label: "Tailored Drafts Created" },
    { stage: "OUTREACH_SENT", count: 16, label: "Sent (Human Approved)" },
    { stage: "INTERVIEWING", count: 3, label: "In Active Interviews" },
    { stage: "OFFER_RECEIVED", count: 1, label: "Offers Negotiated" },
  ],
  pending_followups: [
    {
      outreach_id: "out-followup-01",
      company_name: "Stripe",
      job_title: "Staff Backend Engineer - Core Infrastructure",
      recruiter_name: "Marcus Vance",
      recruiter_email: "marcus.vance@stripe.com",
      sent_at: new Date(Date.now() - 3600000 * 96).toISOString(),
      days_since_sent: 4,
    },
  ],
};

export const MOCK_CALENDAR_AVAILABILITY: MockCalendarAvailability = {
  calendar_connected: true,
  calendar_id: "adamblansett@gmail.com",
  time_zone: "America/New_York (ET)",
  total_slots: 6,
  open_slots: [
    { day: "Wednesday", date_str: "Nov 19", start_time: "10:00 AM", end_time: "11:30 AM", timezone: "ET" },
    { day: "Wednesday", date_str: "Nov 19", start_time: "2:00 PM", end_time: "4:00 PM", timezone: "ET" },
    { day: "Thursday", date_str: "Nov 20", start_time: "11:00 AM", end_time: "1:00 PM", timezone: "ET" },
    { day: "Thursday", date_str: "Nov 20", start_time: "3:30 PM", end_time: "5:00 PM", timezone: "ET" },
    { day: "Friday", date_str: "Nov 21", start_time: "10:00 AM", end_time: "12:00 PM", timezone: "ET" },
    { day: "Friday", date_str: "Nov 21", start_time: "1:30 PM", end_time: "3:30 PM", timezone: "ET" },
  ],
  formatted_availability_snippet:
    "Here are a few 30-minute windows where I am completely free (all times Eastern):\n" +
    "• Wednesday, Nov 19: 10:00 AM – 11:30 AM or 2:00 PM – 4:00 PM ET\n" +
    "• Thursday, Nov 20: 11:00 AM – 1:00 PM or 3:30 PM – 5:00 PM ET\n" +
    "• Friday, Nov 21: 10:00 AM – 12:00 PM or 1:30 PM – 3:30 PM ET\n\n" +
    "Feel free to send an invite directly or let me know if an alternate window works best for you.",
};

export function getMockDossierForJob(jobId: string, companyName: string): MockCompanyDossier {
  return {
    job_id: jobId,
    company_name: companyName || "Target Enterprise",
    domain: `${(companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    industry: "Enterprise Cloud Infrastructure & Distributed AI",
    funding_stage: "Public / High-Growth Pre-IPO (Series D+)",
    engineering_scale: "500+ Engineers • Global Multi-Region Infrastructure",
    primary_tech_stack: [
      "Python 3.12",
      "FastAPI & AsyncIO",
      "Go (Golang)",
      "PostgreSQL & CockroachDB",
      "Apache Kafka",
      "Redis Clusters",
      "Kubernetes & Envoy",
      "Terraform & AWS",
    ],
    engineering_blog_highlights: [
      "Architectural Evolution: Migrating from Monolith to Event-Driven Microservices with Zero Downtime",
      "Scaling Real-Time Distributed Telemetry to 50M Events per Second across 4 Global Regions",
      "Eliminating Database Lock Contention in High-Concurrency Financial Ledgers",
      "Leveraging Open-Weight Local LLMs for Automated Internal Telemetry Anomaly Detection",
    ],
    interview_process_notes:
      "Stage 1: 30m Recruiter Screen. Stage 2: 60m Deep-Dive Technical System Architecture (Distributed Systems, Sharding, Concurrency). Stage 3: Live Distributed Coding (Event Processing & Concurrency primitives). Stage 4: Virtual Onsite (2x System Design, 1x Engineering Leadership & Cross-functional Collaboration). Team places extreme value on clear communication and production resilience.",
    leadership: [
      {
        name: "Dr. Alicia Vance",
        role: "Chief Technology Officer",
        background: "Ex-Google Distinguished Engineer; authored key whitepapers on distributed consensus algorithms and geo-replicated persistence.",
      },
      {
        name: "Marcus Thorne",
        role: "VP of Core Infrastructure",
        background: "Led cloud infrastructure scaling from 10k to 2M concurrent active connections; strong advocate of observability-driven engineering.",
      },
      {
        name: "Sarah Lin",
        role: "Head of AI Platform & Inference",
        background: "Spearheaded low-latency model serving clusters with dynamic batching and GPU cluster autoscaling.",
      },
    ],
    strategic_candidate_positioning:
      "With over a decade of production backend and distributed systems engineering, Adam Blansett is strategically positioned as a high-leverage Staff-level hire. Emphasize your hands-on mastery of async Python/FastAPI, resilient Kafka/Redis queuing, zero-downtime database migrations, and autonomous AI agent architectures. Directly frame your experience around their current architectural challenges: scale, distributed latency reduction, and bulletproof microservice reliability.",
  };
}
