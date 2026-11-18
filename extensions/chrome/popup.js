document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.id) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const meta = results[0].result;
          document.getElementById("title").value = meta.title || "";
          document.getElementById("company").value = meta.company || "";
          document.getElementById("url").value = meta.url || tab.url;
          if (meta.salary) {
            document.getElementById("salary").value = meta.salary;
          }
          window._scrapedDesc = meta.description || "";
        }
      }
    );
  }

  document.getElementById("clipBtn").addEventListener("click", async () => {
    const statusEl = document.getElementById("status");
    const title = document.getElementById("title").value.trim();
    const company = document.getElementById("company").value.trim();
    const url = document.getElementById("url").value.trim();
    const salary = document.getElementById("salary").value ? parseFloat(document.getElementById("salary").value) : 185000.0;
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
      statusEl.innerText = "Error connecting to http://localhost:8000";
    }
  });
});
