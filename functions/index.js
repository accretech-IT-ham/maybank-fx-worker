import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function onRequest() {
  const res = await fetch("https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/rates/forex_rates.page");
  const html = await res.text();

  const currencies = ["US Dollar", "Japanese Yen", "Euro", "Thai Baht"];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = doc.querySelectorAll("table tbody tr");
  const result = {};

  rows.forEach(r => {
    const text = r.innerText;
    currencies.forEach(c => {
      if (text.includes(c)) {
        const cols = r.querySelectorAll("td");
        result[c] = {
          buy: cols[2]?.innerText.trim(),
          sell: cols[3]?.innerText.trim()
        };
      }
    });
  });

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
}