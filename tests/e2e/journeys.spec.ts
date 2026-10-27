import { test, expect, type Page } from '@playwright/test';

/** Clients come back by verifying the mobile they enquired with. */
async function signInClient(page: Page) {
  await page.goto('/my-enquiries');
  await page.getByLabel('Mobile number').fill('9812345678');
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.getByLabel('Six-digit verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify & continue' }).click();
  await expect(page.getByRole('heading', { name: 'My enquiries', level: 1 })).toBeVisible();
}

/** The workspace is locked: logging in returns to the page that was asked for. */
async function signInProfessional(page: Page, path = '/dashboard') {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel('Mobile number').fill('9812345670');
  await page.getByLabel('Password').fill('a-strong-pass');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL((url) => url.pathname === path);
}

/** Terms, data consent and 18+ are three separate boxes; tick them all. */
async function tickConsents(page: Page) {
  const boxes = page.getByRole('checkbox');
  await expect(boxes).toHaveCount(3);
  for (const box of await boxes.all()) await box.check();
}

async function signInAdmin(page: Page, path = '/admin') {
  await page.goto(path);
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Admin email').fill('admin@urdesigner.in');
  await page.getByLabel('Password').fill('UrDesigner@2026');
  await page.getByRole('button', { name: 'Log in' }).click();
}

test('discovery is server-rendered and searchable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto('http://127.0.0.1:5173/architects/ahmedabad?type=architect');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Aangan Studio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Earth & Form' })).toHaveCount(0);
  await page
    .getByRole('link', { name: /View profile/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: 'Services & indicative pricing' })).toBeVisible();
  await expect(page).toHaveTitle(/Aangan Studio/);
  expect((await page.goto('http://127.0.0.1:5173/does-not-exist'))?.status()).toBe(404);
  await context.close();
});

test('proposal debit, client decision and persistence form a connected journey', async ({
  page,
}) => {
  await signInProfessional(page, '/dashboard/enquiries/e1/proposal');
  await page
    .getByLabel('Your approach & scope')
    .fill(
      'We propose a warm and considered interior scheme with natural materials and generous family spaces.',
    );
  await page.getByLabel('Expected timeline').fill('8');
  await page.getByLabel('Indicative design fee').fill('30000');
  await page.getByRole('button', { name: 'Send · 150 connects', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Send · 150 connects' }).click();
  await expect(page).toHaveURL(/\/dashboard\/enquiries\/e1$/);
  await expect(page.locator('.balance-chip')).toContainText('50');
  await signInClient(page);
  await expect(page.getByRole('link', { name: 'Compare 2 proposals' })).toBeVisible();
  await page.getByRole('link', { name: 'Compare 2 proposals' }).click();
  await expect(page.getByRole('table')).toContainText('Aangan Studio');
  await page.goto('/my-enquiries/proposal/e1');
  await page.getByRole('button', { name: 'Decline proposal', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Decline proposal' }).click();
  await expect(page.getByText('You declined this proposal.', { exact: false })).toBeVisible();
  await page.goto('/dashboard/connects');
  await expect(page.locator('.wallet-hero')).toContainText('125');
  await page.reload();
  await expect(page.locator('.wallet-hero')).toContainText('125');
});

test('pack submission remains pending until admin verifies it', async ({ page }) => {
  await signInProfessional(page, '/dashboard/connects/payment/300');
  await page.getByLabel('Sample transaction reference').fill('DEMOTEST12345');
  await page.getByRole('button', { name: 'Simulate payment submission' }).click();
  await expect(page.getByText('Your submission is with the team.')).toBeVisible();
  await expect(page.locator('.balance-chip')).toContainText('200');
  await signInAdmin(page, '/admin/payments');
  await expect(page).toHaveURL(/\/admin\/payments$/);
  await page.getByRole('button', { name: 'Verify & credit 300 connects' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Verify & credit 300 connects' })
    .click();
  await page.goto('/dashboard/connects');
  await expect(page.locator('.wallet-hero')).toContainText('500');
  await expect(page.getByRole('cell', { name: 'Connect pack · payment verified' })).toBeVisible();
});

test('project-first enquiry flow verifies a sample identity and sends', async ({ page }) => {
  await page.goto('/enquiry/aangan-studio-ahmedabad');
  await page.getByLabel('Give your project a name').fill('Our new courtyard home');
  await page
    .getByLabel('What would you like to create?')
    .fill(
      'We would like a calm family home around a courtyard with abundant natural light and ventilation.',
    );
  await page.getByLabel('Service required').selectOption('Architectural Design');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name').fill('Sample Client');
  await page.getByRole('textbox', { name: /^Email/ }).fill('sample@example.invalid');
  await page.getByLabel('Mobile number').fill('9876543210');
  await tickConsents(page);
  await page.getByRole('button', { name: 'Continue to verification' }).click();
  await page.getByLabel('Six-digit verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your idea is on its way.' })).toBeVisible();
  await page.getByRole('link', { name: 'View my enquiries' }).click();
  await expect(page.getByRole('heading', { name: 'Our new courtyard home' })).toBeVisible();
});

test('profile autosave, services and project upload update discovery', async ({ page }) => {
  await signInProfessional(page, '/dashboard/profile');
  await page.getByLabel('Studio / firm name').fill('Aangan Test Practice');
  await page.goto('/dashboard/services');
  await page.getByRole('button', { name: 'Add service', exact: true }).click();
  await page.getByLabel('Service category').selectOption('Landscape Design');
  await page.getByRole('button', { name: 'Save service' }).click();
  await expect(page.getByRole('heading', { name: 'Landscape Design' })).toBeVisible();
  await page.goto('/dashboard/portfolio/new');
  await page.getByLabel('Project title').fill('The garden pavilion');
  await page.getByLabel('Upload project images').setInputFiles('public/images/house.jpg');
  await expect(page.getByRole('button', { name: 'Cover image' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { name: 'The garden pavilion' })).toBeVisible();
  await page.goto('/p/aangan-studio-ahmedabad');
  await expect(page.getByRole('heading', { name: 'Aangan Test Practice' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Landscape Design' })).toBeVisible();
});

test('a reused requirement stays selected through professional discovery', async ({ page }) => {
  await signInClient(page);
  await page.goto('/my-enquiries');
  await page
    .getByRole('link', { name: 'Share this project with another professional' })
    .first()
    .click();
  await expect(page).toHaveURL(/\/architects\/ahmedabad\?requirement=r1/);
  await expect(page.getByText('Sharing: A warm, contemporary family home')).toBeVisible();
  // Only Ahmedabad practices: no Mumbai or Bengaluru studios to pay for a lead they can't take.
  await expect(page.getByRole('heading', { name: 'Form & Field' })).toHaveCount(0);
  await page.getByRole('link', { name: 'View profile' }).nth(2).click();
  await page.getByRole('link', { name: 'Send enquiry', exact: true }).first().click();
  await expect(page.getByLabel('Start a new project or reuse a requirement')).toHaveValue('r1');
  await page.getByRole('button', { name: 'Send to Studio Mitti' }).click();
  await expect(page.getByRole('heading', { name: 'Your idea is on its way.' })).toBeVisible();
  await page.getByRole('link', { name: 'View my enquiries' }).click();
  await expect(page.getByText(/3 of 5 professionals contacted/)).toBeVisible();
});

test('core routes load with no console errors, broken images or horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await signInProfessional(page);
  await signInAdmin(page);
  const paths = [
    '/',
    '/architects',
    '/p/aangan-studio-ahmedabad',
    '/p/aangan-studio-ahmedabad/project/pr1',
    '/join',
    '/login',
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/services',
    '/dashboard/portfolio',
    '/dashboard/enquiries/e1',
    '/dashboard/enquiries/e1/proposal',
    '/dashboard/connects/buy',
    '/dashboard/referrals',
    '/admin',
    '/admin/payments',
    '/admin/enquiries',
    '/admin/reports',
    '/my-enquiries',
    '/my-enquiries/saved',
    '/connects',
    '/terms',
    '/privacy',
  ];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      path,
    ).toBe(true);
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
        ),
      path,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    '/',
    '/architects',
    '/p/aangan-studio-ahmedabad',
    '/dashboard',
    '/dashboard/enquiries/e1/proposal',
    '/dashboard/connects/buy',
    '/admin',
    '/my-enquiries',
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      path,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('a new professional sets up a profile before reaching the dashboard', async ({ page }) => {
  await page.goto('/join');
  await expect(page.getByRole('button', { name: /looking for a designer/i })).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue to verification' }).click();
  await expect(page.getByText('Enter a 10-digit mobile number')).toBeVisible();
  await expect(page.getByText('Enter a valid email')).toBeVisible();
  await expect(page.getByText('Password needs 8+ characters')).toBeVisible();
  await page.getByLabel('Mobile number').fill('9000000001');
  await page.getByLabel('Email address').fill('new@studio.in');
  await page.getByLabel('Password').fill('a-strong-pass');
  await tickConsents(page);
  await page.getByRole('button', { name: 'Continue to verification' }).click();
  await page.getByLabel('Six-digit verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify & continue' }).click();
  await expect(page).toHaveURL(/\/dashboard\/setup/);
  await expect(page.getByText('Aarav')).toHaveCount(0);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard\/setup/);
  await page.getByLabel('Full name').fill('meera shah');
  await page.getByLabel('Full name').blur();
  await expect(page.getByLabel('Full name')).toHaveValue('Meera Shah');
});

test('the enquiry form explains what is wrong and enforces the 20-character rule', async ({
  page,
}) => {
  await page.goto('/enquiry/aangan-studio-ahmedabad');
  await page.getByLabel('Give your project a name').fill('Kitchen');
  await page.getByLabel('What would you like to create?').fill('Too short');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText(/Write at least 20 characters/)).toBeVisible();
  await expect(page.getByText('A first introduction starts with you.')).toHaveCount(0);
  const options = await page.getByLabel('Service required').locator('option').allTextContents();
  expect(options).toEqual([
    'Choose a service',
    'Architectural Design',
    'Residential Interior Design',
    'Space Planning',
    'Not sure yet',
  ]);
});

test('admin is locked and login is for professionals only', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto('/login');
  await expect(page.getByRole('link', { name: 'Browse professionals' })).toBeVisible();
  await expect(page.getByRole('button', { name: /looking for a designer/i })).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toContainText(
    'My enquiries',
  );
  await signInClient(page);
  await expect(page.getByRole('button', { name: /Account menu/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toContainText(
    'My enquiries',
  );
});

test('QA fixes: locked workspace, city 404s, crawler files and mobile login', async ({
  page,
  request,
}) => {
  await page.goto('/dashboard/referrals');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Freferrals/);
  expect((await request.get('/architects/xyzcity')).status()).toBe(404);
  await page.goto('/architects/xyzcity');
  await expect(page.getByText('We don’t cover this city yet.')).toBeVisible();
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Disallow: /dashboard');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('/p/aangan-studio-ahmedabad</loc>');
  const profile = await (await request.get('/p/aangan-studio-ahmedabad')).text();
  expect(profile).toContain('rel="canonical"');
  expect(profile).toContain('property="og:image"');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Professional log in' }),
  ).toBeVisible();
});

test('QA fixes: enquiry form wording, negative size and short emails', async ({ page }) => {
  await page.goto('/enquiry/aangan-studio-ahmedabad');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.error-text', { hasText: 'Give your project a name' })).toBeVisible();
  await expect(page.getByText('Describe what you’d like to create')).toBeVisible();
  await expect(page.getByText(/^Enter give/)).toHaveCount(0);
  await page.getByLabel('Give your project a name').fill('Courtyard home');
  await page
    .getByLabel('What would you like to create?')
    .fill('A calm family home around a courtyard with plenty of light.');
  await page.getByLabel('Service required').selectOption('Space Planning');
  await page.getByLabel('Project size (optional)').fill('-500');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter 1 or more')).toBeVisible();
  await page.getByLabel('Project size (optional)').fill('1850');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name').fill('<script>alert(1)</script>');
  await page.getByRole('textbox', { name: /^Email/ }).fill('a@b');
  await page.getByLabel('Mobile number').fill('9876543210');
  await tickConsents(page);
  await page.getByRole('button', { name: 'Continue to verification' }).click();
  await expect(page.getByText(/Use letters only/)).toBeVisible();
  await expect(page.getByText('Enter a valid email, e.g. name@example.com')).toBeVisible();
});

test('review r6: honest profiles, three cities, own-profile view and public connects page', async ({
  page,
}) => {
  await page.goto('/p/aangan-studio-ahmedabad');
  // CoA is plain text, not a badge; there are no outbound links before acceptance.
  await expect(page.getByText('CoA number provided').first()).toBeVisible();
  await expect(page.locator('.profile-header svg.lucide-badge-check')).toHaveCount(0);
  await expect(page.locator('.profile-aside a[href^="http"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Send enquiry' }).first()).toBeVisible();
  await page.goto('/architects');
  const cities = await page.getByLabel('Project city').locator('option').allTextContents();
  expect(cities).toEqual(['All cities', 'Ahmedabad', 'Mumbai', 'Bengaluru']);
  await expect(page.getByText(/\d+ professionals?/)).toHaveCount(0);
  await expect(page.getByLabel('Sort by')).toHaveCount(0);
  await page.goto('/connects');
  await expect(page.getByRole('heading', { name: 'How connects work.' })).toBeVisible();
  await expect(page.getByText('150 connects (₹150)')).toBeVisible();
  await signInProfessional(page);
  await page.goto('/p/aangan-studio-ahmedabad');
  await expect(page.getByText('This is your public profile, as clients see it.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Send enquiry' })).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Join as a professional/ })).toHaveCount(0);
  await page.goto('/p/no-such-studio');
  await expect(page.getByText('Profile not found.')).toBeVisible();
});
