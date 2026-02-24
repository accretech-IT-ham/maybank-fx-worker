import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function onRequest() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/rates/forex_rates.page",
    { waitUntil: "networkidle2" }
  );

  const fxData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    const target = ["US Dollar", "Japanese Yen", "Euro", "Thai Baht"];
    const out = [];

    rows.forEach(r => {
      const cellText = r.innerText.trim();
      if (target.some(t => cellText.includes(t))) {
        const cols = r.querySelectorAll("td");
        const text = Array.from(cols).map(c => c.innerText.trim());
        out.push({
          currency: text[1],
          buy: text[2],
          sell: text[3]
        });
      }
    });

    return out;
  });

  await browser.close();

  return new Response(JSON.stringify(fxData), {
    headers: { "Content-Type": "application/json" }
  });
}