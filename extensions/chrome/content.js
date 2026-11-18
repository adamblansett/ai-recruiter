// Content script to scrape job postings and LinkedIn recruiter profiles
function extractPageMetadata() {
  const url = window.location.href;

  // 1. Detect LinkedIn Recruiter Profile (linkedin.com/in/*)
  if (url.includes("linkedin.com/in/")) {
    let name = "";
    let headline = "";
    let company = "";

    // Candidate / Recruiter Name
    const h1 = document.querySelector("h1");
    if (h1) name = h1.innerText.trim();

    // Headline / Role
    const headlineEl = document.querySelector(".text-body-medium") || 
                       document.querySelector("[data-anonymize='headline']") ||
                       document.querySelector(".pv-text-details__left-panel div");
    if (headlineEl) headline = headlineEl.innerText.trim();

    // Company from headline or experience
    const companyMatch = headline.match(/(?:at|@)\s+([A-Za-z0-9\s.,&-]+)/i);
    if (companyMatch) {
      company = companyMatch[1].trim().split("·")[0].split("|")[0].trim();
    }

    return {
      is_linkedin_profile: true,
      recruiter_name: name,
      recruiter_title: headline,
      company: company || "Target Company",
      url: url.split("?")[0]
    };
  }

  // 2. Standard Job Opportunity Scraping
  let title = "";
  let company = "";
  let description = "";
  let salary = null;

  // Title extraction
  const h1 = document.querySelector("h1");
  if (h1 && h1.innerText.trim().length > 3) {
    title = h1.innerText.trim();
  } else {
    title = document.title.split("-")[0].split("|")[0].trim();
  }

  // Company extraction
  const companyMeta = document.querySelector('meta[property="og:site_name"]') ||
                      document.querySelector('meta[name="author"]');
  if (companyMeta && companyMeta.content) {
    company = companyMeta.content.trim();
  } else if (url.includes("greenhouse.io/")) {
    const parts = url.split("greenhouse.io/")[1].split("/");
    company = parts[0];
  } else if (url.includes("jobs.lever.co/")) {
    const parts = url.split("jobs.lever.co/")[1].split("/");
    company = parts[0];
  }

  // Salary extraction
  const bodyText = document.body.innerText;
  const salaryMatch = bodyText.match(/\$(\d{2,3}(?:,\d{3})+)/);
  if (salaryMatch) {
    salary = parseFloat(salaryMatch[1].replace(/,/g, ""));
  }

  // Description extraction
  const descEl = document.querySelector(".job-description") ||
                 document.querySelector("#content") ||
                 document.querySelector('[data-automation-id="job-posting-description"]') ||
                 document.querySelector("main") ||
                 document.body;
  description = descEl.innerText.slice(0, 4000);

  return {
    is_linkedin_profile: false,
    title,
    company: company ? (company.charAt(0).toUpperCase() + company.slice(1)) : "Target Company",
    url,
    salary,
    description
  };
}

extractPageMetadata();
