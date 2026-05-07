import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();

  page.on('requestfailed', request => {
    console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });
  page.on('response', response => {
    if (!response.ok()) {
       console.log('BROWSER RESPONSE NOT OK:', response.url(), response.status());
    }
  });
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });
  page.on('pageerror', err => {
    console.error('BROWSER ERROR:', err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Open Admin Panel
  await page.evaluate(() => {
    document.querySelector('button[title="后台管理 / Admin Panel"]').click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.type('#adminPwdInput', '1593574628q');
  await page.click('#adminPwdConfirm');
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => {
    return document.getElementById('adminMessagesList').innerText;
  });
  console.log("MESSAGES ON PAGE:", text);
  
  await browser.close();
})();
