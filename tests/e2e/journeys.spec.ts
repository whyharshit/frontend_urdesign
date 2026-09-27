import { test, expect } from '@playwright/test';

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
  await page.goto('/dashboard/enquiries/e1/proposal');
  await page
    .getByLabel('Your approach & scope')
    .fill(
      'We propose a warm and considered interior scheme with natural materials and generous family spaces.',
    );
  await page.getByLabel('Expected timeline').fill('8–10 weeks');
  await page.getByLabel('Indicative design fee').fill('₹30,000');
  await page.getByRole('button', { name: 'Send · 150 connects', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Send · 150 connects' }).click();
  await expect(page).toHaveURL(/\/dashboard\/enquiries\/e1$/);
  await expect(page.locator('.balance-chip')).toContainText('50');
  await page.goto('/my-enquiries');
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
  await page.goto('/dashboard/connects/payment/300');
  await page.getByLabel('Sample transaction reference').fill('DEMOTEST12345');
  await page.getByRole('button', { name: 'Simulate payment submission' }).click();
  await expect(page.getByText('Your submission is with the team.')).toBeVisible();
  await expect(page.locator('.balance-chip')).toContainText('200');
  await page.getByRole('link', { name: 'admin payment verification' }).click();
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
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name').fill('Sample Client');
  await page.getByRole('textbox', { name: /^Email/ }).fill('sample@example.invalid');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continue to verification' }).click();
  await page.getByLabel('Six-digit verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your idea is on its way.' })).toBeVisible();
  await page.getByRole('link', { name: 'View my enquiries' }).click();
  await expect(page.getByRole('heading', { name: 'Our new courtyard home' })).toBeVisible();
});

test('profile autosave, services and project upload update discovery', async ({ page }) => {
  await page.goto('/dashboard/profile');
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
  await page.goto('/architects?requirement=r1');
  await page.getByRole('link', { name: 'View profile' }).nth(2).click();
  await page.getByRole('link', { name: 'Send enquiry', exact: true }).first().click();
  await expect(page.getByLabel('Start a new project or reuse a requirement')).toHaveValue('r1');
  await page.getByRole('button', { name: 'Send to Form & Field' }).click();
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
    '/my-enquiries',
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
