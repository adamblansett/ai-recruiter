#!/usr/bin/env python3
"""
AI Recruiter - Executive Architectural Interview Dossier PDF Generator
Produces a high-impact, professional executive PDF briefing for Adam Blansett
tailored for panel interviews with CTOs and VPs of Engineering.
Zero external dependencies required (Pure Python RFC-compliant PDF 1.4).
"""

import argparse
import os
import sys

def render_pdf(output_path: str, title: str, subtitle: str, sections: dict):
    lines = [title, subtitle, "-" * 85]
    for heading, items in sections.items():
        lines.append("")
        lines.append(heading.upper())
        for it in items:
            lines.append(f"  • {it}" if not it.startswith("-") else f"    {it}")

    stream_content = "BT\n/F1 10 Tf\n18 TL\n45 745 Td\n"
    for line in lines:
        safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if line == title:
            stream_content += f"/F1 15 Tf ({safe_line}) Tj T* /F1 10 Tf\n"
        elif line.isupper() and len(line) > 3 and not line.startswith("-"):
            stream_content += f"/F1 11 Tf ({safe_line}) Tj T* /F1 10 Tf\n"
        else:
            stream_content += f"({safe_line}) Tj T*\n"
    stream_content += "ET\n"

    stream_bytes = stream_content.encode("latin-1", errors="replace")
    stream_len = len(stream_bytes)

    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1") + stream_bytes + b"\nendstream\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ]

    offsets = []
    current_offset = 9
    for obj in objects:
        offsets.append(current_offset)
        current_offset += len(obj)

    xref = f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin-1")
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode("latin-1")

    trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{current_offset}\n%%EOF\n".encode("latin-1")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(b"%PDF-1.4\n")
        for obj in objects:
            f.write(obj)
        f.write(xref)
        f.write(trailer)

def generate_dossier(company: str, role: str, output_path: str):
    sections = {
        "Executive Architectural Profile": [
            "Staff Software Engineer with 10+ years architecting fault-tolerant, high-throughput distributed backends.",
            "Deep specialization in asynchronous Python/FastAPI microservices, PostgreSQL query optimization, and Redis.",
            "Proven leadership delivering zero-downtime database schema migrations and resilient event-driven architectures.",
        ],
        "Core Architectural Specializations": [
            "Distributed Event Streaming & Queuing: Kafka, Celery, RabbitMQ, and durable dead-letter routing.",
            "High-Concurrency Storage & Caching: PostgreSQL, PgBouncer, connection pool tuning, and Redis cache clusters.",
            "Zero-Trust Application Security: OAuth 2.0, JWT, HashiCorp Vault, and multi-tenant role-based access control.",
            "Cloud Infrastructure & Container Orchestration: Docker, Docker Compose, AWS, Terraform, and Linux internals.",
        ],
        "AI & LLM Orchestration Infrastructure": [
            "Provider-neutral AI evaluation pipelines with structured schema validation and prompt isolation boundaries.",
            "Local open-weights integration with Ollama (Llama 3.2 3B) and enterprise cloud AI gateways.",
            "Retrieval-Augmented Generation (RAG) architecture and vector database embedding strategies.",
        ],
        "Technical Leadership & System Design Governance": [
            "Author of high-impact RFC architectural specs and cross-functional engineering quality standards.",
            "Mentorship of senior and mid-level engineers in distributed system debugging, concurrency, and p99 latency reduction.",
            "Obsessive focus on automated integration testing, CI/CD safety rails, and ironclad operational hygiene.",
        ],
        f"Strategic Value Alignment for {company}": [
            f"Directly accelerates {company}'s high-throughput backend scaling and microservice reliability roadmaps.",
            f"Immediate impact across system design, API robustness, and developer autonomy within {role} scope.",
        ],
    }

    render_pdf(
        output_path=output_path,
        title="ADAM BLANSETT - EXECUTIVE ARCHITECTURAL DOSSIER",
        subtitle=f"Candidate Briefing for Engineering Leadership | Target: {role} at {company}",
        sections=sections,
    )
    print(f"✓ Executive Dossier PDF generated successfully: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Executive Interview Dossier PDF")
    parser.add_argument("--company", default="Anthropic", help="Target company name")
    parser.add_argument("--role", default="Staff Systems & Infrastructure Engineer", help="Target role title")
    parser.add_argument("--output", default="Adam_Blansett_Executive_Interview_Dossier.pdf", help="Output PDF file path")
    args = parser.parse_args()

    generate_dossier(args.company, args.role, args.output)
