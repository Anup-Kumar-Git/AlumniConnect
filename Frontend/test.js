import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Log all console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.toString()));

  console.log('Navigating to http://localhost:5174/auth');
  await page.goto('http://localhost:5174/auth', { waitUntil: 'networkidle0' });

  // Assume user clicks "Student"
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div'));
    const studentCard = cards.find(c => c.textContent.includes('Student') && !c.textContent.includes('Register'));
    if (studentCard) studentCard.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Logging in...');
  await page.type('input[type="email"]', 'demo@example.com'); // We will just bypass it or let it fail
  // Wait, the backend requires a real login, otherwise it won't let us navigate to dashboard!
  // To avoid this, we can just inject a faked JWT token to localStorage!
  
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.jwt.token');
    localStorage.setItem('role', 'Student');
    localStorage.setItem('userName', 'Demo Student');
  });

  console.log('Navigating directly to /student-profile to bypass login');
  await page.goto('http://localhost:5174/student-profile', { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 2000));
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('PAGE BODY START----\n' + bodyText.substring(0, 500) + '\n----PAGE BODY END');

  console.log('Done!');
  await browser.close();
})();
