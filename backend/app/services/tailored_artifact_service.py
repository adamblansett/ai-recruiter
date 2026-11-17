import hashlib
import logging
import os
import uuid
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.job import JobOpportunity
from app.services.candidate_service import CandidateService

logger = logging.getLogger(__name__)


class TailoredArtifactService:
    """
    Generates role-specific, tailored single-page PDF resumes and cover letters
    dynamically aligned to target company requirements and job descriptions.
    """

    @classmethod
    def _render_pdf(cls, output_path: str, title: str, subtitle: str, sections: Dict[str, List[str]]):
        """Builds a pure-Python RFC-compliant PDF 1.4 document without external dependencies."""
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

        header = b"%PDF-1.4\n"
        body = b""
        xref_offsets = [0]
        cur_offset = len(header)
        for obj in objects:
            xref_offsets.append(cur_offset)
            body += obj
            cur_offset += len(obj)

        xref_start = len(header) + len(body)
        xref = f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin-1")
        for off in xref_offsets[1:]:
            xref += f"{off:010d} 00000 n \n".encode("latin-1")

        trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("latin-1")

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(header + body + xref + trailer)

    @classmethod
    async def generate_tailored_artifacts(
        cls,
        db: AsyncSession,
        job_id: uuid.UUID,
    ) -> Dict[str, str]:
        # 1. Fetch Job
        stmt = select(JobOpportunity).where(JobOpportunity.id == job_id)
        res = await db.execute(stmt)
        job = res.scalars().first()
        if not job:
            raise ValueError(f"Job opportunity {job_id} not found")

        # 2. Fetch Profile
        profile = await CandidateService.get_active_profile(db)
        if not profile:
            profile = await CandidateService.seed_initial_candidate(db)

        company_name = job.company.name if job.company else "Hiring Organization"
        job_title = job.title

        # 3. Dynamic Skill Re-ranking based on job keywords
        job_lower = f"{job_title} {job.cleaned_description}".lower()

        primary_skills = []
        secondary_skills = []
        for s in profile.skills:
            if s.name.lower() in job_lower or (
                "ai" in s.category.lower() and "ai" in job_lower
            ) or (
                "backend" in s.category.lower() and "backend" in job_lower
            ):
                primary_skills.append(f"{s.name} ({s.years_experience} yrs - {s.proficiency_level})")
            else:
                secondary_skills.append(s.name)

        # 4. Assemble Tailored Resume Sections
        resume_sections = {
            f"Target Alignment: {job_title} at {company_name}": [
                f"Senior/Staff Software Engineer with 10+ years engineering high-concurrency systems,",
                f"distributed microservices, and AI orchestration pipelines. Targeted expertise for {company_name}.",
            ],
            "Key Technical Proficiencies (Prioritized for this Role)": primary_skills[:6] + [
                f"Additional Technologies: {', '.join(secondary_skills[:6])}"
            ],
            "Selected High-Impact Engineering Achievements": [
                "Engineered high-concurrency Python/FastAPI microservices processing millions of daily transactions.",
                "Architected provider-neutral LLM evaluation engine with prompt isolation and strict Pydantic validation.",
                "Designed zero-trust OAuth 2.0 / JWT authorization pipelines with encryption and database-level invariants.",
                "Optimized complex PostgreSQL relational schemas and asynchronous Celery/Redis background task queues.",
            ],
            "Experience Summary": [
                "Lead / Staff Software Engineer (2016 - Present): Distributed Backend & AI Systems Architecture",
                "Senior Software Engineer (2014 - 2016): Enterprise Cloud Infrastructure & APIs",
            ],
        }

        # 5. Write Tailored PDF Resume
        out_dir = os.path.join(settings.UPLOAD_DIR, "tailored")
        os.makedirs(out_dir, exist_ok=True)
        resume_filename = f"Adam_Blansett_Resume_{job.company.name if job.company else 'Tailored'}_{uuid.uuid4().hex[:6]}.pdf"
        resume_filepath = os.path.join(out_dir, resume_filename)

        cls._render_pdf(
            output_path=resume_filepath,
            title="ADAM BLANSETT",
            subtitle=f"Staff & Senior Software Engineer | Tailored for: {job_title} ({company_name})",
            sections=resume_sections,
        )

        # 6. Generate Tailored Cover Letter (Markdown)
        cover_letter_markdown = (
            f"# Application for {job_title}\n\n"
            f"**Candidate:** Adam Blansett  \n"
            f"**Target Company:** {company_name}  \n"
            f"**Role:** {job_title}  \n\n"
            f"---\n\n"
            f"Dear Hiring Team at {company_name},\n\n"
            f"I am writing to express my strong interest in the **{job_title}** role at {company_name}. "
            f"With over a decade of hands-on software engineering experience architecting scalable distributed backend systems, "
            f"asynchronous task pipelines (FastAPI, PostgreSQL, Redis, Celery), and enterprise AI/LLM orchestration, "
            f"I have consistently built resilient, secure systems designed to operate under intensive production workloads.\n\n"
            f"What particularly excites me about {company_name} is your focus on engineering excellence and high-impact technology. "
            f"Throughout my career, I have specialized in building provider-neutral LLM evaluation harnesses, "
            f"zero-trust application security (OAuth 2.0, JWT, Vault), and high-throughput APIs where correctness and performance are paramount.\n\n"
            f"I would welcome the opportunity to discuss how my technical leadership and background can directly accelerate {company_name}'s "
            f"engineering roadmaps. Thank you for your time and consideration.\n\n"
            f"Sincerely,\n\n"
            f"**Adam Blansett**  \n"
            f"Staff & Senior Software Engineer"
        )

        cover_letter_path = os.path.join(out_dir, f"Cover_Letter_{company_name}_{uuid.uuid4().hex[:6]}.md")
        with open(cover_letter_path, "w", encoding="utf-8") as f:
            f.write(cover_letter_markdown)

        return {
            "status": "success",
            "job_id": str(job_id),
            "company_name": company_name,
            "job_title": job_title,
            "resume_pdf_path": resume_filepath,
            "resume_download_url": f"/api/v1/jobs/{job_id}/tailored-resume/download",
            "cover_letter_markdown": cover_letter_markdown,
            "cover_letter_path": cover_letter_path,
        }
