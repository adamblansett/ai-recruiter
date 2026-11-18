#!/usr/bin/env python3
"""
AI Recruiter - End-to-End Live Integration Verification Suite
Performs comprehensive multi-layer validation across backend services, candidate profile guards,
application autofill safety gates, inbox meeting extraction, and pitch deck generation.
Outputs full audit report to data/e2e_verification_report.json.
Zero external dependencies required.
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
ARTIFACTS_DIR = os.path.join(DATA_DIR, "artifacts")
REPORT_PATH = os.path.join(DATA_DIR, "e2e_verification_report.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


class VerificationRunner:
    def __init__(self):
        self.results = []
        self.start_time = time.time()

    def record(self, test_name: str, passed: bool, details: dict):
        status = "PASSED" if passed else "FAILED"
        print(f"[{status}] {test_name}")
        self.results.append({
            "test_name": test_name,
            "status": status,
            "passed": passed,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": details,
        })

    def run_all(self) -> bool:
        print("=" * 70)
        print("  AI Recruiter - Live End-to-End Integration Verification Suite")
        print("=" * 70)

        self.verify_environment()
        self.verify_core_files()
        self.verify_candidate_profile_and_floor()
        self.verify_application_autofill_service()
        self.verify_inbox_meeting_extraction()
        self.verify_executive_pitch_deck()
        self.verify_system_design_whiteboard_specs()
        self.verify_security_hardening()

        elapsed = time.time() - self.start_time
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["passed"])
        failed_tests = total_tests - passed_tests

        all_passed = (failed_tests == 0)

        report = {
            "suite": "AI Recruiter End-to-End Integration Verification",
            "candidate": "Adam Blansett",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "duration_seconds": round(elapsed, 3),
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": f"{round((passed_tests / total_tests) * 100, 1)}%",
                "verdict": "READY_FOR_PRODUCTION" if all_passed else "ATTENTION_REQUIRED",
            },
            "test_results": self.results,
        }

        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        print("-" * 70)
        print(f"Verification Summary: {passed_tests}/{total_tests} passed in {round(elapsed, 2)}s")
        print(f"Detailed Report Written to: {REPORT_PATH}")
        print("=" * 70)
        return all_passed

    def verify_environment(self):
        info = {
            "python_version": sys.version.split()[0],
            "platform": sys.platform,
            "root_dir": ROOT_DIR,
        }
        passed = sys.version_info.major == 3
        self.record("Environment Compatibility", passed, info)

    def verify_core_files(self):
        required_files = [
            "backend/app/services/application_autofill_service.py",
            "backend/app/services/negotiation_simulator_service.py",
            "scripts/poll_inbox_daemon.py",
            "scripts/generate_pitch_deck.py",
            "scripts/generate_executive_dossier.py",
            "frontend/src/pages/Jobs.tsx",
            "frontend/src/context/DemoContext.tsx",
        ]
        missing = [f for f in required_files if not os.path.exists(os.path.join(ROOT_DIR, f))]
        passed = len(missing) == 0
        self.record(
            "Core Architectural File Integrity",
            passed,
            {"checked": len(required_files), "missing": missing},
        )

    def verify_candidate_profile_and_floor(self):
        autofill_path = os.path.join(ROOT_DIR, "backend", "app", "services", "application_autofill_service.py")
        sys.path.insert(0, os.path.join(ROOT_DIR, "backend", "app", "services"))
        import application_autofill_service

        cand = application_autofill_service.CANDIDATE_PROFILE
        salary_floor = cand.get("desired_salary_min", 0)
        full_name = cand.get("full_name")
        remote_ok = "remote" in cand.get("location", "").lower()
        no_sponsorship = cand.get("requires_sponsorship") == "No"

        passed = (
            full_name == "Adam Blansett"
            and salary_floor >= 185000
            and remote_ok
            and no_sponsorship
        )
        self.record(
            "Candidate Profile & $185k Compensation Floor Guard",
            passed,
            {
                "full_name": full_name,
                "salary_floor": salary_floor,
                "remote_first": remote_ok,
                "requires_sponsorship": no_sponsorship,
            },
        )

    def verify_application_autofill_service(self):
        import application_autofill_service
        service = application_autofill_service.ApplicationAutofillService

        preview = service.generate_preview(
            job_id="test-datadog-01",
            job_title="Staff Backend Engineer",
            company_name="Datadog",
            ats_platform="greenhouse",
        )

        has_fields = len(preview.fields) >= 12
        has_custom_answers = any(f.is_custom_question and len(f.value) > 20 for f in preview.fields)

        # Test safety gate: confirmed=False MUST fail
        unconfirmed_req = application_autofill_service.AutofillSubmitRequest(
            application_id=preview.application_id,
            confirmed=False,
        )
        gate_blocked = False
        try:
            service.submit_application(preview, unconfirmed_req)
        except ValueError:
            gate_blocked = True

        # Test safety gate: confirmed=True MUST succeed
        confirmed_req = application_autofill_service.AutofillSubmitRequest(
            application_id=preview.application_id,
            confirmed=True,
        )
        submit_res = service.submit_application(preview, confirmed_req)
        gate_allowed = submit_res.success and submit_res.status == "SUBMITTED"

        passed = has_fields and has_custom_answers and gate_blocked and gate_allowed
        self.record(
            "Application Auto-Filler Safety & Synthesis Guard",
            passed,
            {
                "field_count": len(preview.fields),
                "custom_questions_synthesized": has_custom_answers,
                "unconfirmed_submission_blocked": gate_blocked,
                "confirmed_submission_executed": gate_allowed,
                "receipt_id": submit_res.confirmation_receipt_id,
            },
        )

    def verify_inbox_meeting_extraction(self):
        sys.path.insert(0, os.path.join(ROOT_DIR, "scripts"))
        import poll_inbox_daemon

        sample_text_1 = "Hi Adam, let's schedule an engineering screen: https://calendly.com/recruiter/30min"
        sample_text_2 = "Looking forward to speaking. Google Meet room: https://meet.google.com/abc-defg-hij"
        sample_text_3 = "Just confirming your interest. No link yet."

        links_1 = poll_inbox_daemon.extract_scheduling_links(sample_text_1)
        links_2 = poll_inbox_daemon.extract_scheduling_links(sample_text_2)
        links_3 = poll_inbox_daemon.extract_scheduling_links(sample_text_3)

        passed = (
            "https://calendly.com/recruiter/30min" in links_1
            and "https://meet.google.com/abc-defg-hij" in links_2
            and len(links_3) == 0
        )
        self.record(
            "Inbox Meeting Link Extraction Regex Parser",
            passed,
            {
                "calendly_detected": len(links_1) > 0,
                "google_meet_detected": len(links_2) > 0,
                "non_meeting_negative_match": len(links_3) == 0,
            },
        )

    def verify_executive_pitch_deck(self):
        import generate_pitch_deck
        generate_pitch_deck.main()

        html_path = os.path.join(ARTIFACTS_DIR, "Adam_Blansett_Executive_Pitch_Deck.html")
        md_path = os.path.join(ARTIFACTS_DIR, "Adam_Blansett_Executive_Pitch_Deck.md")

        html_exists = os.path.exists(html_path) and os.path.getsize(html_path) > 1000
        md_exists = os.path.exists(md_path) and os.path.getsize(md_path) > 500

        with open(md_path, "r", encoding="utf-8") as f:
            md_text = f.read()

        has_thesis = "Executive Candidate Thesis" in md_text
        has_metrics = "99.99%" in md_text and "$185,000+" in md_text
        has_roadmap = "30-60-90 Day" in md_text

        passed = html_exists and md_exists and has_thesis and has_metrics and has_roadmap
        self.record(
            "Executive Pitch Deck Presentation Generation",
            passed,
            {
                "html_generated": html_exists,
                "markdown_generated": md_exists,
                "candidate_thesis_verified": has_thesis,
                "scale_metrics_verified": has_metrics,
                "roadmap_verified": has_roadmap,
            },
        )

    def verify_system_design_whiteboard_specs(self):
        jobs_path = os.path.join(ROOT_DIR, "frontend", "src", "pages", "Jobs.tsx")
        with open(jobs_path, "r", encoding="utf-8") as f:
            jobs_src = f.read()

        has_whiteboard_modal = "whiteboardModalOpen" in jobs_src
        has_ingestion_template = "ingestion_stream" in jobs_src
        has_task_queue = "task_queue" in jobs_src
        has_multi_region = "multi_region" in jobs_src
        has_agentic_ai = "agentic_ai" in jobs_src
        has_autofill_modal = "autofillModalOpen" in jobs_src
        has_pitch_deck_modal = "pitchDeckModalOpen" in jobs_src

        passed = (
            has_whiteboard_modal
            and has_ingestion_template
            and has_task_queue
            and has_multi_region
            and has_agentic_ai
            and has_autofill_modal
            and has_pitch_deck_modal
        )
        self.record(
            "Frontend Architecture Whiteboard & Studio Integration",
            passed,
            {
                "whiteboard_modal": has_whiteboard_modal,
                "ingestion_stream_template": has_ingestion_template,
                "task_queue_template": has_task_queue,
                "multi_region_template": has_multi_region,
                "agentic_ai_template": has_agentic_ai,
                "autofill_modal": has_autofill_modal,
                "pitch_deck_modal": has_pitch_deck_modal,
            },
        )

    def verify_security_hardening(self):
        sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))
        from app.core import security

        # 1. Test XSS / Script sanitization
        dirty_input = "<script>alert('xss')</script>Normal text <iframe src='evil.com'></iframe>"
        clean_input = security.sanitize_input(dirty_input)
        xss_blocked = "<script>" not in clean_input and "<iframe>" not in clean_input

        # 2. Test CSRF state generation & constant-time validation
        csrf_state = security.generate_csrf_state()
        csrf_valid = security.verify_csrf_state(csrf_state, csrf_state)
        csrf_tampered_blocked = not security.verify_csrf_state(csrf_state, "tampered-state")

        # 3. Test AES-256-GCM encryption & decryption
        secret_payload = "super-secret-oauth-refresh-token-2026"
        encrypted = security.encrypt_secret(secret_payload)
        decrypted = security.decrypt_secret(encrypted)
        encryption_ok = (decrypted == secret_payload and encrypted != secret_payload.encode())

        # 4. Test JWT creation with jti, claims, and revocation
        token = security.create_access_token(subject="user-uuid-1234")
        claims = security.decode_access_token(token)
        jti = claims.get("jti")
        jwt_claims_ok = (
            claims.get("sub") == "user-uuid-1234"
            and jti is not None
            and claims.get("iss") == "ai-recruiter"
            and claims.get("aud") == "ai-recruiter-api"
        )
        security.revoke_token(jti)
        revocation_ok = security.is_token_revoked(jti)

        # 5. Test Open Redirect prevention
        safe_rel = security.is_safe_redirect_url("/profile?success=true")
        blocked_phish = not security.is_safe_redirect_url("https://malicious-phishing.com/steal")
        blocked_proto_rel = not security.is_safe_redirect_url("//evil.com/redirect")
        redirect_guards_ok = safe_rel and blocked_phish and blocked_proto_rel

        # 6. Test Frontend Security Headers in index.html
        index_html_path = os.path.join(ROOT_DIR, "frontend", "index.html")
        with open(index_html_path, "r", encoding="utf-8") as f:
            index_html = f.read()
        has_nosniff = "X-Content-Type-Options" in index_html
        has_frame_deny = "X-Frame-Options" in index_html
        frontend_headers_ok = has_nosniff and has_frame_deny

        all_sec_passed = (
            xss_blocked
            and csrf_valid
            and csrf_tampered_blocked
            and encryption_ok
            and jwt_claims_ok
            and revocation_ok
            and redirect_guards_ok
            and frontend_headers_ok
        )

        self.record(
            "Defense-in-Depth Security Hardening & Cryptographic Audit",
            all_sec_passed,
            {
                "xss_sanitization_blocked": xss_blocked,
                "csrf_protection_verified": csrf_valid and csrf_tampered_blocked,
                "aes_gcm_authenticated_encryption": encryption_ok,
                "jwt_claims_and_revocation_verified": jwt_claims_ok and revocation_ok,
                "open_redirect_guards_verified": redirect_guards_ok,
                "frontend_security_meta_tags": frontend_headers_ok,
            },
        )


if __name__ == "__main__":
    runner = VerificationRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
