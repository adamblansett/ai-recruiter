#!/usr/bin/env python3
"""
AI Recruiter - Executive Pitch Deck Generator
Generates a standalone, presentation-ready HTML/CSS slide deck and Markdown dossier
summarizing Adam Blansett's 10+ years engineering track record for VP/C-suite final rounds.
Zero external dependencies required.
"""

import argparse
import os
import sys

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adam Blansett | Executive Engineering Pitch Deck</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --border: #1f2937;
      --emerald: #10b981;
      --amber: #f59e0b;
      --cyan: #06b6d4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
    }
    header {
      width: 100%;
      max-width: 1000px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .badge {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-light);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .slide-container {
      width: 100%;
      max-width: 1000px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px;
      min-height: 560px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    .slide { display: none; height: 100%; }
    .slide.active { display: flex; flex-direction: column; justify-content: space-between; }
    h1 { font-size: 36px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    h2 { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 20px; }
    h3 { font-size: 18px; font-weight: 600; color: var(--accent-light); margin-bottom: 8px; }
    p.lead { font-size: 18px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
    }
    .metric-value { font-size: 32px; font-weight: 800; color: var(--emerald); margin-bottom: 4px; }
    .metric-label { font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    ul { list-style: none; padding-left: 0; }
    li { margin-bottom: 10px; font-size: 14px; color: #d1d5db; line-height: 1.5; display: flex; align-items: flex-start; }
    li::before { content: "•"; color: var(--accent-light); font-weight: bold; display: inline-block; width: 1em; margin-left: -0.5em; }
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1000px;
      margin-top: 24px;
    }
    .btn {
      background: #1f2937;
      color: #fff;
      border: 1px solid #374151;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn:hover { background: #374151; }
    .dots { display: flex; gap: 8px; }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #374151;
      cursor: pointer;
      transition: background 0.2s;
    }
    .dot.active { background: var(--accent); }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .slide-container { border: none; box-shadow: none; max-width: 100%; }
      .slide { display: block !important; page-break-after: always; margin-bottom: 40px; }
      .controls, header { display: none; }
      .card { border: 1px solid #ccc; color: #000; }
      h1, h2, h3 { color: #000; }
      li { color: #222; }
    }
  </style>
</head>
<body>

  <header>
    <div>
      <span class="badge">Executive Dossier & Presentation</span>
      <span style="margin-left: 12px; font-size: 14px; color: var(--text-muted);">Adam Blansett • Staff / Principal Distributed Systems Architect</span>
    </div>
    <div>
      <button class="btn" onclick="window.print()" style="font-size: 12px; padding: 6px 14px;">Print / Export PDF</button>
    </div>
  </header>

  <div class="slide-container">

    <!-- Slide 1: Title & Positioning -->
    <div class="slide active" id="slide-0">
      <div>
        <span class="badge" style="margin-bottom: 16px; display: inline-block;">Executive Candidate Thesis</span>
        <h1>Adam Blansett</h1>
        <h2 style="color: var(--accent-light); font-weight: 500;">Staff / Principal Backend & Distributed Systems Architect</h2>
        <p class="lead">
          10+ years architecting high-throughput distributed backends, resilient event-streaming architectures, 
          and production AI infrastructure. Proven record of delivering 99.99% availability, zero-downtime database migrations, 
          and multi-million dollar cloud infrastructure optimizations.
        </p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="metric-value">10+ Years</div>
          <div class="metric-label">Production Backend Mastery</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Python (FastAPI, Asyncio), Go, PostgreSQL, Kafka, Redis</p>
        </div>
        <div class="card">
          <div class="metric-value">99.99%</div>
          <div class="metric-label">System Availability SLA</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Self-healing architectures, circuit breakers & idempotency</p>
        </div>
        <div class="card">
          <div class="metric-value">$185k+ Floor</div>
          <div class="metric-label">Compensation Expectation</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Targeting $215k–$260k TC, 100% remote-first</p>
        </div>
      </div>
    </div>

    <!-- Slide 2: Value Pillars & Scale -->
    <div class="slide" id="slide-1">
      <div>
        <span class="badge" style="margin-bottom: 16px; display: inline-block;">Core Value Pillars</span>
        <h2>Engineering Impact & Scale Metrics</h2>
        <p class="lead">Direct business impact achieved through architectural rigor and systems thinking.</p>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>High-Throughput Streaming & Messaging</h3>
          <ul>
            <li>Engineered Kafka & Celery event-ingestion processing 150k+ events/sec with sub-50ms latency.</li>
            <li>Designed dead-letter routing and automated reprocessing, eliminating manual intervention.</li>
            <li>Implemented Redis Cluster distributed caching with 99.2% cache hit rates.</li>
          </ul>
        </div>
        <div class="card">
          <h3>Database Scale & Data Integrity</h3>
          <ul>
            <li>Executed live zero-downtime partitioning of 400M+ row PostgreSQL clusters under active traffic.</li>
            <li>Implemented PgBouncer transaction-mode connection pools to eliminate database connection spikes.</li>
            <li>Enforced strict idempotency keys across all financial and transactional endpoints.</li>
          </ul>
        </div>
        <div class="card">
          <h3>Infrastructure Optimization & Cost Efficiency</h3>
          <ul>
            <li>Reduced AWS ECS/RDS infrastructure expenditures by 38% while improving P99 latency by 45%.</li>
            <li>Standardized containerized microservices across Docker and Kubernetes with automated CI/CD.</li>
            <li>Implemented distributed tracing and Prometheus/Grafana telemetry for rapid MTTR.</li>
          </ul>
        </div>
        <div class="card">
          <h3>Technical Leadership & Mentorship</h3>
          <ul>
            <li>Directly mentored 15+ senior and staff engineers in distributed systems design and RFC review.</li>
            <li>Authored engineering architecture standards and automated security/concurrency linting.</li>
            <li>Championed remote-first engineering culture with high psychological safety and autonomy.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Slide 3: Case Studies -->
    <div class="slide" id="slide-2">
      <div>
        <span class="badge" style="margin-bottom: 16px; display: inline-block;">Architectural Case Studies</span>
        <h2>Proven Production Solutions</h2>
        <p class="lead">Real-world architectural execution under high concurrency and strict reliability constraints.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <h3 style="color: var(--cyan);">Zero-Downtime Data Migration</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;"><strong>Challenge:</strong> Live partition migration across 400M records without customer-facing errors.</p>
          <ul>
            <li>Built dual-write shadow pipeline with asynchronous validation workers in Python/FastAPI.</li>
            <li>Configured automated rollback thresholds and continuous drift verification.</li>
            <li>Cutover executed in 0 seconds of user downtime.</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="color: var(--amber);">Event Ingestion Backpressure</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;"><strong>Challenge:</strong> Preventing cascade database failure during 100x traffic spikes.</p>
          <ul>
            <li>Decoupled ingestion from write storage using Kafka partition topics and dynamic workers.</li>
            <li>Integrated token bucket rate limiters in Redis for client tier prioritization.</li>
            <li>Eliminated all dropped transactions during peak load events.</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="color: var(--emerald);">Local-First AI Pipeline</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;"><strong>Challenge:</strong> Autonomous resume and dossier analysis with zero third-party data egress.</p>
          <ul>
            <li>Integrated local Ollama/Llama 3.2 3B model with structured Pydantic schema validation.</li>
            <li>Achieved sub-400ms inference time with 100% data isolation and zero API costs.</li>
            <li>Deterministic fallbacks ensure reliable operation even during system disconnects.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Slide 4: 30-60-90 Roadmap -->
    <div class="slide" id="slide-3">
      <div>
        <span class="badge" style="margin-bottom: 16px; display: inline-block;">Execution Plan</span>
        <h2>30-60-90 Day High-Impact Onboarding Roadmap</h2>
        <p class="lead">Structured execution ensuring rapid time-to-value from Day 1.</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div style="font-size: 14px; font-weight: 700; color: var(--accent-light); margin-bottom: 8px;">DAYS 1 – 30</div>
          <h3 style="color: #fff; font-size: 16px;">Discovery & Architectural Audit</h3>
          <ul>
            <li>Conduct comprehensive audit of backend service topologies, latency bottlenecks, and telemetry.</li>
            <li>Shadow on-call rotations and analyze incident post-mortems to identify critical failure modes.</li>
            <li>Ship first high-leverage production bug fix or optimization within Week 2.</li>
          </ul>
        </div>
        <div class="card">
          <div style="font-size: 14px; font-weight: 700; color: var(--emerald); margin-bottom: 8px;">DAYS 31 – 60</div>
          <h3 style="color: #fff; font-size: 16px;">Scalability & Resiliency Hardening</h3>
          <ul>
            <li>Implement circuit breakers, connection pooling, and dead-letter queues on critical paths.</li>
            <li>Target 30%+ P99 latency reduction across high-volume API endpoints.</li>
            <li>Collaborate with product and infrastructure teams on quarterly RFC roadmaps.</li>
          </ul>
        </div>
        <div class="card">
          <div style="font-size: 14px; font-weight: 700; color: var(--amber); margin-bottom: 8px;">DAYS 61 – 90</div>
          <h3 style="color: #fff; font-size: 16px;">Platform Acceleration & Autonomy</h3>
          <ul>
            <li>Deliver major architectural milestone (e.g. streaming ingestion upgrade or multi-region replication).</li>
            <li>Establish architectural decision record (ADR) framework and lead technical design sessions.</li>
            <li>Multiply team throughput by unblocking peers and driving technical excellence.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Slide 5: Strategic ROI & Fit -->
    <div class="slide" id="slide-4">
      <div>
        <span class="badge" style="margin-bottom: 16px; display: inline-block;">Value Proposition</span>
        <h2>Why Adam Blansett: The Senior Leadership Multiplier</h2>
        <p class="lead">A Staff-level partner who combines deep hands-on execution with strategic system vision.</p>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Immediate Zero-Ramp Velocity</h3>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
            10+ years of battle-tested experience across Python, distributed messaging, and databases means 
            zero ramp-up time on architectural patterns, edge cases, and high-concurrency debugging.
          </p>
        </div>
        <div class="card">
          <h3>Architectural Risk Mitigation</h3>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
            Prevent costly architectural missteps before they hit production. Proven track record in zero-downtime 
            migrations and fault tolerance protects customer trust and uptime SLAs.
          </p>
        </div>
        <div class="card">
          <h3>Force Multiplier for Senior Peers</h3>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
            Elevates team technical standards through structured design reviews, pragmatic engineering tradeoff analysis, 
            and hands-on mentorship that accelerates the entire organization.
          </p>
        </div>
        <div class="card">
          <h3>Executive Contact & Next Steps</h3>
          <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
            <strong>Email:</strong> adamblansett@gmail.com<br>
            <strong>Portfolio:</strong> adamblansett.dev<br>
            <strong>GitHub:</strong> github.com/adamblansett<br>
            <strong>Status:</strong> Immediate availability for Staff/Principal backend challenges.
          </p>
        </div>
      </div>
    </div>

  </div>

  <div class="controls">
    <button class="btn" id="prevBtn" onclick="changeSlide(-1)">Previous Slide</button>
    <div class="dots" id="dotsContainer"></div>
    <button class="btn" id="nextBtn" onclick="changeSlide(1)">Next Slide</button>
  </div>

  <script>
    let currentSlide = 0;
    const totalSlides = 5;

    const dotsContainer = document.getElementById('dotsContainer');
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(i);
      dotsContainer.appendChild(dot);
    }

    function showSlide(index) {
      for (let i = 0; i < totalSlides; i++) {
        const slide = document.getElementById('slide-' + i);
        if (slide) slide.classList.remove('active');
        dotsContainer.children[i].classList.remove('active');
      }
      document.getElementById('slide-' + index).classList.add('active');
      dotsContainer.children[index].classList.add('active');
      document.getElementById('prevBtn').disabled = (index === 0);
      document.getElementById('nextBtn').disabled = (index === totalSlides - 1);
    }

    function changeSlide(direction) {
      currentSlide = Math.max(0, Math.min(totalSlides - 1, currentSlide + direction));
      showSlide(currentSlide);
    }

    function goToSlide(index) {
      currentSlide = index;
      showSlide(currentSlide);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        changeSlide(1);
      } else if (e.key === 'ArrowLeft') {
        changeSlide(-1);
      }
    });

    showSlide(0);
  </script>
</body>
</html>
"""

MARKDOWN_TEMPLATE = """# Adam Blansett | Executive Engineering Pitch Deck
**Target Role**: Staff / Principal Backend & Distributed Systems Architect  
**Core Expertise**: 10+ Years Backend & Distributed Systems Mastery  
**Baseline Floor**: $185,000+ Base (100% Remote, US Citizen)  

---

## Slide 1: Executive Candidate Thesis
- **Candidate**: Adam Blansett
- **Title**: Staff / Principal Distributed Systems Architect
- **Thesis**: 10+ years architecting high-throughput distributed backends, resilient event-streaming architectures, and production AI infrastructure. Proven record of delivering 99.99% availability, zero-downtime database migrations, and multi-million dollar cloud infrastructure optimizations.
- **Key Metrics**:
  - 10+ Years Backend Engineering (FastAPI, Python, Kafka, PostgreSQL, Redis)
  - 99.99% Production Uptime SLA
  - $185,000+ Baseline Compensation Floor (Targeting $215k–$260k TC)

---

## Slide 2: Core Value Pillars & Impact
1. **High-Throughput Streaming & Messaging**:
   - Engineered Kafka & Celery event-ingestion processing 150k+ events/sec with sub-50ms latency.
   - Designed dead-letter routing and automated reprocessing, eliminating manual intervention.
   - Implemented Redis Cluster distributed caching with 99.2% cache hit rates.

2. **Database Scale & Data Integrity**:
   - Executed live zero-downtime partitioning of 400M+ row PostgreSQL clusters under active traffic.
   - Implemented PgBouncer transaction-mode connection pools to eliminate connection spikes.
   - Enforced strict idempotency keys across all transactional endpoints.

3. **Infrastructure Optimization & Cost Efficiency**:
   - Reduced AWS ECS/RDS expenditures by 38% while improving P99 latency by 45%.
   - Standardized containerized microservices across Docker and Kubernetes with automated CI/CD.

4. **Technical Leadership & Mentorship**:
   - Directly mentored 15+ senior and staff engineers in distributed systems design and RFC review.
   - Championed remote-first engineering culture with high psychological safety and autonomy.

---

## Slide 3: Architectural Case Studies
- **Case 1: Zero-Downtime Data Migration**
  - Live partition migration across 400M records without customer-facing errors.
  - Dual-write shadow pipeline with asynchronous validation workers in Python/FastAPI.
  - Cutover executed in 0 seconds of user downtime.

- **Case 2: Event Ingestion Backpressure**
  - Decoupled ingestion from write storage using Kafka partition topics and dynamic workers.
  - Integrated token bucket rate limiters in Redis for client tier prioritization.
  - Eliminated all dropped transactions during 100x traffic spikes.

- **Case 3: Local-First AI Pipeline**
  - Integrated local Ollama/Llama 3.2 3B model with structured Pydantic schema validation.
  - Sub-400ms inference time with 100% data isolation and zero external cloud API costs.

---

## Slide 4: 30-60-90 Day High-Impact Roadmap
- **Days 1–30 (Discovery & Audit)**:
  - Conduct comprehensive audit of backend service topologies, latency bottlenecks, and telemetry.
  - Shadow on-call rotations and analyze incident post-mortems to identify critical failure modes.
  - Ship first high-leverage production bug fix or optimization within Week 2.
- **Days 31–60 (Scalability & Resiliency Hardening)**:
  - Implement circuit breakers, connection pooling, and dead-letter queues on critical paths.
  - Target 30%+ P99 latency reduction across high-volume API endpoints.
- **Days 61–90 (Platform Acceleration & Autonomy)**:
  - Deliver major architectural milestone (e.g. streaming ingestion upgrade or multi-region replication).
  - Establish architectural decision record (ADR) framework and lead technical design sessions.

---

## Slide 5: The Senior Leadership Multiplier
- **Immediate Zero-Ramp Velocity**: 10+ years across Python, distributed messaging, and databases.
- **Architectural Risk Mitigation**: Avoid costly missteps before they hit production.
- **Force Multiplier**: Elevates team technical standards through structured design reviews and mentorship.
"""


def main():
    parser = argparse.ArgumentParser(description="Generate Executive Pitch Deck artifacts")
    parser.add_argument("--output-dir", default="data/artifacts", help="Directory to save generated artifacts")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    html_path = os.path.join(args.output_dir, "Adam_Blansett_Executive_Pitch_Deck.html")
    md_path = os.path.join(args.output_dir, "Adam_Blansett_Executive_Pitch_Deck.md")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_TEMPLATE)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(MARKDOWN_TEMPLATE)

    print(f"Generated Executive Pitch Deck HTML: {html_path}")
    print(f"Generated Executive Pitch Deck Markdown: {md_path}")


if __name__ == "__main__":
    main()
