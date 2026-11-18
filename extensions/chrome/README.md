# AI Recruiter — One-Click Browser Clipper

Clip job opportunities with one click directly from LinkedIn, Indeed, Greenhouse, Lever, and company career pages into your local AI Recruiter pipeline.

---

### Option A: Zero-Install Bookmarklet (Fastest)

1. Create a new bookmark in your browser bookmarks bar (Chrome, Brave, Edge, Firefox, Safari).
2. Name it: `⚡ Clip to AI Recruiter`
3. Paste the following URL code into the URL/Location field:

```javascript
javascript:(function(){const title=document.querySelector("h1")?.innerText.trim()||document.title.split("-")[0].trim();const url=window.location.href;const company=url.includes("greenhouse.io/")?url.split("greenhouse.io/")[1].split("/")[0]:(url.includes("lever.co/")?url.split("lever.co/")[1].split("/")[0]:prompt("Company Name:","Target Company"));if(!company)return;const desc=(document.querySelector(".job-description")||document.querySelector("main")||document.body).innerText.slice(0,3000);fetch("http://localhost:8000/api/v1/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,company_name:company,source_url:url,raw_description:desc,location:"United States (Remote)",remote_type:"REMOTE",min_salary:185000})}).then(r=>r.ok?alert("✓ Opportunity clipped to AI Recruiter!"):alert("Failed to clip. Is backend running?")).catch(e=>alert("Error connecting to http://localhost:8000"));})();
```

4. Click the bookmark on any job page to instantly clip the role into your pipeline!

---

### Option B: Chrome Extension (Manifest V3)

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` / `brave://extensions/`).
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `extensions/chrome` directory from this repository.
5. The extension icon will appear in your toolbar. Click it on any job posting to verify the parsed metadata and click **Clip to AI Recruiter Pipeline**.
