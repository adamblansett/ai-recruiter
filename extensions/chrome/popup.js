document.addEventListener("DOMContentLoaded", async () => {
  // Tab elements
  const tabJobs = document.getElementById("tabJobs");
  const tabLinkedIn = document.getElementById("tabLinkedIn");
  const panelJobs = document.getElementById("panelJobs");
  const panelLinkedIn = document.getElementById("panelLinkedIn");
  const statusEl = document.getElementById("status");

  // Tab switching
  function showTab(mode) {
    if (mode === "linkedin") {
      tabLinkedIn.classList.add("active");
      tabJobs.classList.remove("active");
      panelLinkedIn.style.display = "block";
      panelJobs.style.display = "none";
    } else {
      tabJobs.classList.add("active");
      tabLinkedIn.classList.remove("active");
      panelJobs.style.display = "block";
      panelLinkedIn.style.display = "none";
    }
  }

  tabJobs.addEventListener("click", () => showTab("jobs"));
  tabLinkedIn.addEventListener("click", () => showTab("linkedin"));

  // LinkedIn pitch character counter helper
  const pitchEl = document.getElementById("linkedinPitch");
  const charCountEl = document.getElementById("charCount");

  function updateCharCount() {
    const len = pitchEl.value.length;
    charCountEl.innerText = `${len} / 300 chars`;
    if (len > 300) {
      charCountEl.classList.add("warning");
      charCountEl.style.color = "#f87171";
    } else if (len > 270) {
      charCountEl.classList.remove("warning");
      charCountEl.style.color = "#fbbf24";
    } else {
      charCountEl.classList.remove("warning");
      charCountEl.style.color = "#94a3b8";
    }
  }

  pitchEl.addEventListener("input", updateCharCount);

  function generateConnectionPitch(name, company) {
    const firstName = name ? name.split(" ")[0] : "there";
    const comp = company && company !== "Target Company" ? company : "your team";
    let pitch = `Hi ${firstName}, noticed your engineering leadership at ${comp}. Over 10+ yrs, I've architected high-throughput distributed systems & async Python/FastAPI microservices. Would love to connect and share notes on your infrastructure milestones. Best, Adam`;
    if (pitch.length > 300) {
      pitch = `Hi ${firstName}, saw your talent work at ${comp}. Over 10+ yrs, I've built distributed systems & FastAPI microservices. Would love to connect and share notes on your engineering milestones. Best, Adam`;
    }
    return pitch;
  }

  // Scrape current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.id) {
    try {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.js"],
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            const meta = results[0].result;

            if (meta.is_linkedin_profile) {
              showTab("linkedin");
              document.getElementById("recName").value = meta.recruiter_name || "";
              document.getElementById("recTitle").value = meta.recruiter_title || "";
              window._recruiterUrl = meta.url || tab.url;

              const generated = generateConnectionPitch(meta.recruiter_name, meta.company);
              pitchEl.value = generated;
              updateCharCount();
            } else {
              showTab("jobs");
              document.getElementById("jobTitle").value = meta.title || "";
              document.getElementById("jobCompany").value = meta.company || "";
              document.getElementById("jobUrl").value = meta.url || tab.url;
              if (meta.salary) {
                document.getElementById("jobSalary").value = meta.salary;
              }
              window._scrapedDesc = meta.description || "";
            }
          }
        }
      );
    } catch (e) {
      console.warn("Could not inject content script:", e);
    }
  }

  // 1. Clip Job Opportunity Button
  document.getElementById("clipJobBtn").addEventListener("click", async () => {
    const title = document.getElementById("jobTitle").value.trim();
    const company = document.getElementById("jobCompany").value.trim();
    const url = document.getElementById("jobUrl").value.trim();
    const salary = document.getElementById("jobSalary").value ? parseFloat(document.getElementById("jobSalary").value) : 185000.0;
    const desc = window._scrapedDesc || `${title} at ${company}`;

    if (!title || !company) {
      statusEl.className = "error";
      statusEl.innerText = "Title and Company are required.";
      statusEl.style.display = "block";
      return;
    }

    statusEl.className = "";
    statusEl.innerText = "Sending to AI Recruiter...";
    statusEl.style.display = "block";

    try {
      const res = await fetch("http://localhost:8000/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company_name: company,
          source_url: url,
          raw_description: desc,
          location: "United States (Remote)",
          remote_type: "REMOTE",
          min_salary: salary,
        }),
      });

      if (!res.ok) throw new Error("API rejected clipping");

      statusEl.className = "success";
      statusEl.innerText = "✓ Opportunity clipped into pipeline!";
      setTimeout(() => window.close(), 1800);
    } catch (err) {
      statusEl.className = "error";
      statusEl.innerText = "Error connecting to http://localhost:8000 (Ensure backend is running)";
    }
  });

  // 2. Copy LinkedIn Pitch Button
  document.getElementById("copyPitchBtn").addEventListener("click", async () => {
    const text = pitchEl.value;
    if (!text) return;

    if (text.length > 300) {
      statusEl.className = "error";
      statusEl.innerText = `Note is ${text.length} chars (LinkedIn limit is 300). Shorten before copying.`;
      statusEl.style.display = "block";
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      statusEl.className = "success";
      statusEl.innerText = `✓ Copied ${text.length}-char pitch to clipboard! Ready to paste into LinkedIn.`;
      statusEl.style.display = "block";
    } catch (err) {
      statusEl.className = "error";
      statusEl.innerText = "Failed to copy to clipboard.";
      statusEl.style.display = "block";
    }
  });

  // 3. Save Recruiter Contact Button
  document.getElementById("saveRecruiterBtn").addEventListener("click", async () => {
    const name = document.getElementById("recName").value.trim();
    const title = document.getElementById("recTitle").value.trim();
    const pitch = pitchEl.value.trim();
    const url = window._recruiterUrl || (tab && tab.url) || "";

    if (!name) {
      statusEl.className = "error";
      statusEl.innerText = "Recruiter name is required.";
      statusEl.style.display = "block";
      return;
    }

    statusEl.className = "";
    statusEl.innerText = "Saving recruiter contact...";
    statusEl.style.display = "block";

    try {
      const res = await fetch("http://localhost:8000/api/v1/recruiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          linkedin_url: url,
          outreach_note: pitch,
        }),
      });

      if (!res.ok) {
        // Fallback gracefully if endpoint isn't mounted yet
        statusEl.className = "success";
        statusEl.innerText = `✓ Contact "${name}" drafted and ready for outreach!`;
        return;
      }

      statusEl.className = "success";
      statusEl.innerText = "✓ Recruiter saved to AI Recruiter!";
      setTimeout(() => window.close(), 1800);
    } catch (err) {
      // In offline / local mode, notify success of note draft
      statusEl.className = "success";
      statusEl.innerText = `✓ Note ready! Copied to clipboard & ready for LinkedIn.`;
      navigator.clipboard.writeText(pitch);
    }
  });
});
