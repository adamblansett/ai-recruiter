import os

def create_adam_blansett_resume_pdf(output_path: str):
    """
    Generates a valid, clean PDF document for Adam Blansett
    using raw PDF 1.4 primitives. Requires zero third-party dependencies.
    """
    text_lines = [
        "ADAM BLANSETT",
        "Staff & Senior Software Engineer | Distributed Systems & AI Engineering",
        "Location: United States (Remote) | Email: adam.blansett@gmail.com",
        "-----------------------------------------------------------------------------------------",
        "PROFESSIONAL SUMMARY:",
        "Staff Software Engineer with 10+ years of experience designing and scaling resilient backend",
        "architectures, high-throughput APIs, and AI/LLM orchestration systems. Proven expertise in",
        "Python (FastAPI, SQLAlchemy, Celery), TypeScript (React, Node.js), and enterprise cloud platforms.",
        "Specialized in application security, zero-trust authorization (OAuth 2.0, JWT, IAM, Vault), and",
        "practical local/cloud AI model integrations.",
        "",
        "CORE TECHNICAL SKILLS:",
        "- Languages & Frameworks: Python, TypeScript, FastAPI, Pydantic, SQLAlchemy, Celery, React, Vite",
        "- AI & Machine Learning: LLM Evaluation, Structured Output Prompting, Ollama/Open-Weights, RAG",
        "- Databases & Caches: PostgreSQL, Redis, Database Optimization, Alembic Migrations",
        "- Security & Auth: OAuth 2.0, JWT, SSO, AWS Secrets Manager, HashiCorp Vault, Zero-Trust Architecture",
        "- Cloud & DevOps: Docker, Docker Compose, AWS, Linux Systems Architecture, CI/CD",
        "",
        "PROFESSIONAL EXPERIENCE:",
        "Staff Software Engineer / Backend & AI Architect (2020 - Present)",
        "- Architected high-concurrency microservices and asynchronous task pipelines processing millions of daily events.",
        "- Engineered provider-neutral LLM evaluation pipelines with structured schema validation and prompt isolation.",
        "- Designed zero-trust authentication and role-based access control protecting critical customer data.",
        "",
        "Senior Software Engineer (2016 - 2020)",
        "- Built enterprise REST APIs using FastAPI, PostgreSQL, and Redis, cutting p99 latency by 45%.",
        "- Implemented end-to-end automated testing suites with Pytest and continuous deployment pipelines.",
        "- Led cross-functional teams delivering mission-critical cloud integrations on AWS.",
        "",
        "Software Engineer (2014 - 2016)",
        "- Developed full-stack web applications, relational data schemas, and event-driven background workers.",
        "",
        "EDUCATION & CERTIFICATIONS:",
        "- B.S. in Computer Science",
        "- Advanced Distributed Systems Architecture & Secure Software Development"
    ]

    # Build PDF stream
    stream_content = "BT\n/F1 10 Tf\n20 TL\n50 750 Td\n"
    for line in text_lines:
        safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if line.startswith("ADAM BLANSETT"):
            stream_content += f"/F1 16 Tf ({safe_line}) Tj T* /F1 10 Tf\n"
        elif line.startswith("PROFESSIONAL") or line.startswith("CORE") or line.startswith("EDUCATION"):
            stream_content += f"/F1 12 Tf ({safe_line}) Tj T* /F1 10 Tf\n"
        else:
            stream_content += f"({safe_line}) Tj T*\n"
    stream_content += "ET\n"
    
    stream_bytes = stream_content.encode("latin-1")
    stream_len = len(stream_bytes)

    objects = []
    
    # 1: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objects.append(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    # 4: Contents Stream
    objects.append(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1") + stream_bytes + b"\nendstream\nendobj\n")
    # 5: Font
    objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    # Assemble PDF
    header = b"%PDF-1.4\n"
    body = b""
    xref_offsets = [0]
    
    current_offset = len(header)
    for obj in objects:
        xref_offsets.append(current_offset)
        body += obj
        current_offset += len(obj)

    xref_start = len(header) + len(body)
    xref = f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin-1")
    for off in xref_offsets[1:]:
        xref += f"{off:010d} 00000 n \n".encode("latin-1")

    trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("latin-1")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(header + body + xref + trailer)

    print(f"Master Resume generated successfully at: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "uploads/resumes/Adam_Blansett_Master_Resume.pdf"
    create_adam_blansett_resume_pdf(out)
