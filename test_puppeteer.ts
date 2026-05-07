import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });
  page.on('pageerror', err => {
    console.error('BROWSER ERROR:', err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
