// Content script to scrape job page metadata
function extractJobMetadata() {
  const url = window.location.href;
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
    title,
    company: company.charAt(0).toUpperCase() + company.slice(1),
    url,
    salary,
    description
  };
}

extractJobMetadata();
