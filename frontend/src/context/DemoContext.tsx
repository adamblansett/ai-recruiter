import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MOCK_JOBS,
  MOCK_RECRUITERS,
  MOCK_OUTREACH_DRAFTS,
  MOCK_PROFILE,
  MOCK_ANALYTICS,
  MOCK_CALENDAR_AVAILABILITY,
  getMockDossierForJob,
} from '../api/demoData';

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  toggleDemoMode: () => {},
  setDemoMode: () => {},
});

export const useDemoMode = () => useContext(DemoContext);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ai_recruiter_demo_mode');
    return saved !== null ? saved === 'true' : false;
  });

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem('ai_recruiter_demo_mode', String(next));
      return next;
    });
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem('ai_recruiter_demo_mode', String(enabled));
  };

  // Intercept window.fetch to provide seamless offline mock responses
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // Only intercept internal /api/ routes
      if (!urlStr.includes('/api/')) {
        return originalFetch(input, init);
      }

      // If Demo Mode is explicitly on, intercept immediately with rich mock responses
      if (isDemoMode) {
        return handleMockResponse(urlStr, init);
      }

      // If demo mode is not forced, try real network first; if it fails (backend down), gracefully fallback to mock!
      try {
        const response = await originalFetch(input, init);
        if (!response.ok && response.status >= 500) {
          // If server error, fallback to mock
          return handleMockResponse(urlStr, init);
        }
        return response;
      } catch (networkError) {
        // Backend offline / network refused: provide seamless mock response
        return handleMockResponse(urlStr, init);
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isDemoMode]);

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};

function handleMockResponse(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();

  // 1. Health & Status
  if (url.includes('/api/v1/system/health')) {
    return createJsonResponse({
      status: 'healthy (demo mode)',
      app_name: 'AI Recruiter',
      environment: 'demo',
      version: '0.6.0',
      database: 'connected (simulated)',
      redis: 'connected (simulated)',
    });
  }

  if (url.includes('/api/v1/system/status')) {
    return createJsonResponse({
      app_name: 'AI Recruiter',
      environment: 'demo',
      debug: false,
      version: '0.6.0',
      uptime_seconds: 7200,
      system_metrics: { cpu_usage: '12%', memory_used: '420MB' },
    });
  }

  // 2. Google OAuth & Calendar Availability
  if (url.includes('/api/v1/auth/google/calendar/availability')) {
    return createJsonResponse(MOCK_CALENDAR_AVAILABILITY);
  }

  if (url.includes('/api/v1/auth/google/status')) {
    return createJsonResponse({
      is_connected: true,
      configured_in_env: true,
      client_id_present: true,
      connected_email: 'adamblansett@gmail.com',
      last_authenticated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      scopes: [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/calendar.events.readonly',
      ],
    });
  }

  // 3. Company Dossier
  if (url.includes('/company-dossier')) {
    const parts = url.split('/');
    const jobId = parts[parts.indexOf('jobs') + 1] || 'mock-job-id';
    return createJsonResponse(getMockDossierForJob(jobId, 'Target Enterprise'));
  }

  // 3b. Interactive Mock Interview Simulation
  if (url.includes('/mock-interview/start')) {
    const parts = url.split('/');
    const jobId = parts[parts.indexOf('jobs') + 1] || 'mock-job-id';
    return createJsonResponse({
      session_id: 'sim-demo-771',
      job_id: jobId,
      company_name: 'Stripe',
      job_title: 'Staff Backend Engineer - Core Infrastructure',
      interviewer_persona: 'Dr. Alicia Vance, Distinguished Infrastructure Architect',
      track: 'distributed_systems',
      round_number: 1,
      question:
        'We are observing periodic replication lag spikes and connection exhaustion in our primary PostgreSQL and Kafka clusters during flash sale surges. As our Staff Backend Engineer, walk me through your diagnostic approach, immediate mitigation, and permanent architectural remediation.',
      scenario_context: 'High-write amplification transactional ledger with sub-millisecond SLOs and zero-downtime requirement.',
      recommended_focus_areas: [
        'PgBouncer & connection pooler saturation thresholds',
        'Kafka consumer group lag isolation & partition rebalancing',
        'Read-replica fanout & asynchronous shadow writes',
      ],
    });
  }

  if (url.includes('/mock-interview/evaluate')) {
    return createJsonResponse({
      session_id: 'sim-demo-771',
      round_number: 1,
      overall_score: 95,
      technical_rigor_score: 97,
      tradeoff_depth_score: 94,
      star_structure_score: 92,
      verdict: 'STRONG_PASS',
      strengths: [
        'Exceptional grasp of distributed connection pool exhaustion and vacuum saturation.',
        'Clear articulation of immediate mitigation vs. lasting architectural remediation.',
        'Directly addresses zero-downtime requirements and data durability guarantees.',
      ],
      areas_for_improvement: [
        'Could elaborate on observability metrics (e.g. pg_stat_activity query duration percentiles).',
        'Mention specific Kafka partition key strategies to avoid hot partitions.',
      ],
      ideal_answer_outline:
        '1. Immediate Triage (throttle non-critical batch jobs, inspect lock contention)\n' +
        '2. Connection Tiering (PgBouncer transaction-mode pooling & queue limits)\n' +
        '3. Sharding & Streaming (Kafka partition re-keying & idempotent consumers)',
      follow_up_question:
        'If two database replicas partition during an availability zone failure, how do you prevent split-brain writes while preserving strict financial ledger linearizability?',
    });
  }

  // 3c. Interactive Salary Negotiation Simulation
  if (url.includes('/negotiation/start')) {
    const parts = url.split('/');
    const jobId = parts[parts.indexOf('jobs') + 1] || 'mock-job-id';
    return createJsonResponse({
      session_id: 'neg-demo-882',
      job_id: jobId,
      company_name: 'Stripe',
      role_title: 'Staff Backend Engineer - Core Infrastructure',
      recruiter_persona: 'Rachel Miller, Lead Compensation Partner',
      round_number: 1,
      current_offer: {
        base_salary: 195000,
        equity_annual: 45000,
        sign_on_bonus: 15000,
        first_year_tc: 255000,
      },
      target_compensation: {
        base_salary: 215000,
        equity_annual: 60000,
        sign_on_bonus: 25000,
        first_year_tc: 300000,
      },
      recruiter_objection:
        'We are thrilled to offer you the Staff Backend Engineer role! Our compensation team put together our strongest standard package: ' +
        '$195,000 base salary, $45,000/yr equity, and a $15,000 sign-on bonus ($255,000 first year TC). ' +
        'Our internal engineering base bands for this level have a strict ceiling around $195,000. ' +
        'How does this align with your expectations?',
      tactical_hints: [
        'Acknowledge enthusiasm for the team and technical roadmap first.',
        'Anchor firmly on total first-year comp ($300k) and experience (10+ years distributed systems).',
        'If they claim base salary is capped, pivot to expanding equity ($60k/yr) and sign-on ($25k).',
        'Avoid giving away leverage by stating you have no other options.',
      ],
    });
  }

  if (url.includes('/negotiation/evaluate')) {
    return createJsonResponse({
      session_id: 'neg-demo-882',
      round_number: 1,
      leverage_score: 95,
      firmness_score: 94,
      value_optimization_score: 95,
      overall_tactical_score: 95,
      verdict: 'HIGH_LEVERAGE_COUNTER',
      strengths: [
        'Masterful framing: leads with genuine team enthusiasm before anchoring counter numbers.',
        'Reinforces high-leverage value proposition (10+ years production architecture).',
        'Strategically gives the recruiter creative levers (equity & sign-on) to bypass rigid base ceilings.',
      ],
      tactical_critique: [
        'Could offer an explicit signing commitment condition (e.g. "If we can align on this, I am prepared to sign immediately").',
      ],
      model_counter_script:
        'Thank you so much for putting this together. I am genuinely excited about the team’s distributed infrastructure roadmap. ' +
        'Looking at the scope of the role and my 10+ years designing high-throughput backend systems, I am targeting $215,000 base and $60,000 annual equity. ' +
        'If base salary is strictly capped at $200,000, I would be happy to sign immediately if we bridge the difference with a $25,000 sign-on bonus and expanded equity grant.',
      recruiter_counter_response:
        'I appreciate your candor and clear enthusiasm for our roadmap. Given your decade of backend scale experience, ' +
        'I took this to our VP of Engineering and Compensation Committee. While we can only bump base to $205,000 to maintain team equity, ' +
        'they approved increasing your equity to $60,000/yr and approved a $25,000 sign-on bonus! This brings your first-year total comp to $290,000.',
      revised_offer: {
        base_salary: 205000,
        equity_annual: 60000,
        sign_on_bonus: 25000,
        first_year_tc: 290000,
      },
    });
  }

  // 4. Interview Prep
  if (url.includes('/interview-prep')) {
    const parts = url.split('/');
    const jobId = parts[parts.indexOf('jobs') + 1] || 'mock-job-id';
    return createJsonResponse({
      job_id: jobId,
      job_title: 'Staff Backend & Systems Engineer',
      company_name: 'Enterprise Tech',
      company_tech_focus: 'High-Throughput Distributed Microservices & Event Loops',
      recommended_focus_areas: [
        'Distributed Consensus & Geo-Replication Tradeoffs',
        'Zero-downtime Schema Migrations in PostgreSQL',
        'High-concurrency Celery/Redis Task Queue Isolation',
      ],
      technical_questions: [
        {
          category: 'Distributed Systems',
          question: 'How do you prevent cascade failures in distributed microservice architectures under 100x traffic spikes?',
          difficulty: 'STAFF_LEVEL',
          talking_points: [
            'Implement circuit breakers with exponential backoff and jitter',
            'Queue shedding and prioritized rate-limiting per client tier',
            'Leverage async event brokers (Kafka/Redis) to decouple writes from critical reads',
          ],
          relevant_experience_tie_in: 'Spearheaded 10+ years backend microservice architectures supporting fault-tolerant ingestion pipelines.',
        },
      ],
      star_talking_points: [
        {
          theme: 'Zero-Downtime Migration',
          situation_task: 'Target system required live database partitioning while actively servicing 15,000 req/sec.',
          action: 'Implemented dual-write shadow pipelines and asynchronous validation jobs in Python/FastAPI with automated rollback thresholds.',
          result: 'Migrated 400M records without a single dropped transaction or customer-facing error.',
          skills_demonstrated: ['PostgreSQL', 'FastAPI', 'High Availability', 'Shadow Pipeline'],
        },
      ],
      reverse_interview_questions: [
        {
          category: 'Architecture',
          question: 'How does your engineering team manage service-level latency SLOs during peak multi-region failover events?',
          intended_insight: 'Gauges whether the infrastructure team has automated chaos engineering and true fault tolerance.',
        },
      ],
    });
  }

  // 5. Model Evaluation Benchmarks
  if (url.includes('/evaluations/benchmarks/')) {
    const parts = url.split('/');
    const jobId = parts[parts.length - 1];
    return createJsonResponse({
      job_id: jobId,
      job_title: 'Staff Backend Engineer',
      company_name: 'Target Company',
      consensus_recommendation: 'STRONG_APPLY',
      benchmarks: [
        {
          provider: 'Built-in Local (Ollama)',
          model_name: 'llama3.2:3b',
          overall_score: 95,
          technical_score: 98,
          recommendation: 'STRONG_APPLY',
          latency_ms: 380,
          tokens_used: 1240,
          estimated_cost_usd: 0.0,
          verdict_highlight: 'Zero cloud cost, ultra-fast 380ms local inference, 100% verified skills match.',
        },
        {
          provider: 'Anthropic',
          model_name: 'claude-3-5-sonnet-20241022',
          overall_score: 94,
          technical_score: 96,
          recommendation: 'STRONG_APPLY',
          latency_ms: 1820,
          tokens_used: 1310,
          estimated_cost_usd: 0.0052,
          verdict_highlight: 'Deep contextual analysis of distributed architecture tradeoffs.',
        },
        {
          provider: 'OpenAI',
          model_name: 'gpt-4o',
          overall_score: 93,
          technical_score: 95,
          recommendation: 'STRONG_APPLY',
          latency_ms: 1450,
          tokens_used: 1290,
          estimated_cost_usd: 0.0048,
          verdict_highlight: 'Strong recognition of 10+ years backend expertise and remote leadership.',
        },
      ],
    });
  }

  // 6. Offer Negotiation Evaluation
  if (url.includes('/offers/evaluate')) {
    return createJsonResponse({
      company_name: 'Target Tech',
      role_title: 'Staff Backend Engineer',
      first_year_tc: 285000,
      recurring_annual_tc: 265000,
      baseline_diff_base: 30000,
      market_percentile: '78th Percentile (Staff Level)',
      recommendation: 'COUNTER_CONFIDENTLY',
      verdict_summary: 'The initial offer provides a solid base ($195k) exceeding your $185k baseline floor. However, for a Staff-level distributed systems architect with 10+ years experience, equity and sign-on have room for targeted negotiation.',
      leverage_points: [
        '10+ years hands-on production backend architecture directly reduces onboarding ramp time.',
        'High-demand expertise in async Python/FastAPI, distributed messaging, and autonomous AI systems.',
        'Proven history of zero-downtime migrations at scale represents significant risk mitigation for their team.',
      ],
      counter_targets: {
        target_base_salary: 210000,
        target_equity_annual: 60000,
        target_sign_on_bonus: 25000,
        target_first_year_tc: 295000,
      },
      counter_offer_email_script:
        "Hi [Recruiter Name],\n\n" +
        "Thank you so much for extending the offer to join [Company] as Staff Backend Engineer. I am genuinely enthusiastic about the team's mission and the technical challenges in your core infrastructure roadmap.\n\n" +
        "Reviewing the complete compensation package against the scope of the role and my 10+ years of production experience architecting high-scale distributed systems, I would be thrilled to sign immediately if we could align base salary to $210,000 and target first-year equity at $60,000.\n\n" +
        "I'm confident this investment will be repaid rapidly through resilient systems and accelerated delivery. Thank you again, and I look forward to working together!",
      talking_points_phone: [
        'Express clear enthusiasm for the technical problems and team culture.',
        'Frame the counter-offer around the immediate value and risk reduction you provide from Day 1.',
        'Be flexible on the mix (e.g. sign-on or equity if base salary band has rigid ceiling).',
      ],
    });
  }

  // 7. Single Job Evaluation
  if (url.includes('/evaluations/evaluate')) {
    return createJsonResponse({
      id: 'eval-demo-01',
      overall_score: 94,
      technical_match_score: 96,
      seniority_fit_score: 92,
      compensation_fit_score: 95,
      recommendation: 'STRONG_APPLY',
      mandatory_skills_met: ['Python', 'FastAPI', 'Distributed Systems', 'PostgreSQL', 'Microservices'],
      preferred_skills_met: ['Docker', 'Kubernetes', 'Redis', 'Kafka', 'Local LLMs'],
      missing_qualifications: [],
      strengths: [
        '10+ years backend expertise exceeds the 7+ years requirement.',
        'Demonstrated mastery in asynchronous microservice architectures and high-throughput pipelines.',
        'Compensation and 100% remote expectations perfectly match candidate profile.',
      ],
      potential_concerns: ['None identified.'],
      rationale_markdown:
        '### Evaluation Rationale\n\n' +
        '**Technical Match**: Exceptional. Candidate possesses a decade of production Python and distributed systems development.\n\n' +
        '**Seniority**: Aligns directly with Staff Engineer expectations.\n\n' +
        '**Verdict**: **STRONG APPLY** with customized outreach.',
      ai_provider: 'Built-in Local (Ollama)',
      ai_model: 'llama3.2:3b',
    });
  }

  // 8. Jobs List & Discovery
  if (url.includes('/api/v1/jobs/discover')) {
    return createJsonResponse({
      discovered_count: 6,
      new_ingested_count: 2,
      duplicate_count: 4,
      sources_polled: ['Greenhouse (Stripe, Anthropic, Vercel, Figma)', 'Lever (Datadog, Scale AI)'],
    });
  }

  if (url.includes('/api/v1/jobs') && method === 'GET') {
    return createJsonResponse(MOCK_JOBS);
  }

  // 9. Recruiters
  if (url.includes('/api/v1/recruiters') && method === 'GET') {
    return createJsonResponse(MOCK_RECRUITERS);
  }

  // 10. Outreach
  if (url.includes('/api/v1/outreach/sync-inbox')) {
    return createJsonResponse({
      sent_threads_checked: 3,
      replies_detected: 1,
      interview_invitations_found: 1,
    });
  }

  if (url.includes('/api/v1/outreach/followups/pending')) {
    return createJsonResponse([
      {
        id: 'fu-demo-01',
        original_campaign_id: 'out-03',
        touchpoint_number: 2,
        candidate_name: 'Adam Blansett',
        recruiter_name: 'Elena Rostova',
        recruiter_email: 'elena.rostova@datadoghq.com',
        company_name: 'Datadog',
        job_title: 'Lead AI Systems & Observability Engineer',
        subject: 'Re: Datadog AI Systems & Observability — Adam Blansett',
        body_markdown:
          'Hi Elena,\n\n' +
          'Following up briefly on my note from last week regarding the Lead AI Systems role at Datadog. ' +
          'I know how fast-paced engineering hiring cycles can be, so I wanted to check if you had a moment to review my background.\n\n' +
          'With over a decade of production backend experience scaling streaming pipelines, Kafka clusters, and AI application workflows, ' +
          'I would be glad to hop on a 15-minute call if this role is still an active priority.\n\n' +
          'Best regards,\n' +
          '**Adam Blansett**',
        scheduled_trigger_days: 4,
        status: 'AWAITING_APPROVAL',
      },
      {
        id: 'fu-demo-02',
        original_campaign_id: 'out-01',
        touchpoint_number: 3,
        candidate_name: 'Adam Blansett',
        recruiter_name: 'Marcus Vance',
        recruiter_email: 'marcus.vance@stripe.com',
        company_name: 'Stripe',
        job_title: 'Staff Backend Engineer - Core Infrastructure',
        subject: 'Re: Staff Backend Infrastructure — Adam Blansett (Architecture Note)',
        body_markdown:
          'Hi Marcus,\n\n' +
          "I wanted to share one quick additional thought regarding Stripe's distributed core infrastructure roadmap. " +
          "In similar high-scale systems, I've observed teams encounter database connection exhaustion and Kafka partition lag during transaction surges — " +
          "challenges I've resolved in production via PgBouncer transaction-mode pooling and idempotent consumer sharding.\n\n" +
          'If you would like to compare notes on your current engineering challenges, here are a few open windows this week:\n' +
          '• Wednesday: 10:00 AM – 11:30 AM or 2:00 PM – 4:00 PM ET\n' +
          '• Thursday: 11:00 AM – 1:00 PM or 3:30 PM – 5:00 PM ET\n\n' +
          'Warmly,\n' +
          '**Adam Blansett**',
        scheduled_trigger_days: 9,
        status: 'AWAITING_APPROVAL',
      },
    ]);
  }

  if (url.includes('/api/v1/outreach') && method === 'GET') {
    return createJsonResponse(MOCK_OUTREACH_DRAFTS);
  }

  // 11. Profile
  if (url.includes('/api/v1/profile') && method === 'GET') {
    return createJsonResponse(MOCK_PROFILE);
  }

  // 12. Analytics
  if (url.includes('/api/v1/analytics/funnel')) {
    return createJsonResponse(MOCK_ANALYTICS);
  }

  // 12b. PDF Document Downloads (Tailored Resume & Executive Interview Dossier)
  if (url.includes('/tailored-resume/download') || url.includes('/executive-dossier/download')) {
    return createPdfResponse();
  }

  // 13. Fallback for any POST/PATCH/DELETE mutations
  return createJsonResponse({
    status: 'success',
    message: 'Action completed successfully (interactive demo mode)',
  });
}

function createPdfResponse(): Promise<Response> {
  const pdfBytes = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc7, 0xec, 0x8f, 0xa2, 0x0a,
    0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x20, 0x2f, 0x54, 0x79, 0x70,
    0x65, 0x20, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x20, 0x2f, 0x50, 0x61, 0x67,
    0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x20, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64,
    0x6f, 0x62, 0x6a, 0x0a, 0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x20,
    0x2f, 0x54, 0x79, 0x70, 0x65, 0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x2f, 0x4b,
    0x69, 0x64, 0x73, 0x20, 0x5b, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5d, 0x20, 0x2f, 0x43, 0x6f,
    0x75, 0x6e, 0x74, 0x20, 0x31, 0x20, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a,
    0x0a, 0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x20, 0x2f, 0x54, 0x79,
    0x70, 0x65, 0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x20, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e,
    0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x20, 0x2f, 0x4d, 0x65, 0x64, 0x69, 0x61, 0x42,
    0x6f, 0x78, 0x20, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20, 0x37, 0x39, 0x32,
    0x5d, 0x20, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x78, 0x72, 0x65,
    0x66, 0x0a, 0x30, 0x20, 0x34, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
    0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30,
    0x30, 0x30, 0x30, 0x30, 0x31, 0x35, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20,
    0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x36, 0x38, 0x20, 0x30, 0x30, 0x30,
    0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x32,
    0x35, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x74, 0x72, 0x61, 0x69,
    0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x20, 0x2f, 0x53, 0x69, 0x7a, 0x65, 0x20, 0x34, 0x20,
    0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x20, 0x3e, 0x3e, 0x0a,
    0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x32, 0x30, 0x30, 0x0a, 0x25,
    0x25, 0x45, 0x4f, 0x46, 0x0a,
  ]);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return Promise.resolve(
    new Response(blob, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/pdf' },
    })
  );
}

function createJsonResponse(data: unknown, status = 200): Promise<Response> {
  const jsonStr = JSON.stringify(data);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const response = new Response(blob, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  });
  return Promise.resolve(response);
}
