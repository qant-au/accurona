// Checks the verification page (bash verify/restart.sh first): every package
// loaded, did its job, and nothing failed under the CSP.
//
//   node verify/check.mjs [http://localhost:2224]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:2224/';
const problems = [];
const failures = [];
const expect = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(m.text());
});
page.on('pageerror', (e) => problems.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
});

await page.goto(url);
await page.waitForFunction(() => window.__verify?.axonometra, null, {
  timeout: 30000
});
const report = await page.evaluate(() => window.__verify);
const installed = await (await fetch(new URL('installed.txt', url))).text();
console.log(installed.trim());

expect(report.core.sceneValid, '@accurona/core validates the scene');
expect(
  report.core.referenceProblems === 0,
  '@accurona/core: no broken references'
);
expect(
  report.core.lengths['ft-in'] === `8'10-5/16"`,
  '@accurona/core formats feet and inches'
);
expect(report.core.parsed === 2692, '@accurona/core parses 8\' 10"');

await page.getByRole('button', { name: 'Say hello' }).click();
expect(
  await page.getByText('Hello from @accurona/ui').isVisible(),
  '@accurona/ui: a tool button raises a notification'
);

expect(
  report.elements.count > 200,
  `@accurona/elements: ${report.elements.count} elements`
);
expect(
  report.elements.images === report.elements.count,
  '@accurona/elements: a plan drawing each'
);
const broken = await page
  .getByTestId('elements')
  .locator('img')
  .evaluateAll((imgs) => imgs.filter((i) => !i.naturalWidth).length);
expect(broken === 0, '@accurona/elements: the drawings load');

expect(
  report.axonometra.walls === 4,
  '@axonometra/editor opens the scene: 4 walls'
);
expect(
  report.axonometra.placements === 3,
  '@axonometra/editor: 3 devices placed'
);
expect(
  report.axonometra.keepsDiagram,
  "@axonometra/editor keeps Reticulyne's view on save"
);
expect(report.axonometra.savedValid, '@axonometra/editor saves a valid scene');
expect(
  (await page
    .getByTestId('axonometra')
    .getByRole('application', { name: 'Floor plan' })
    .count()) === 1,
  '@axonometra/editor: the canvas is there'
);

const ret = page.getByTestId('reticulyne');
for (const name of ['Access point', 'Camera', 'Firewall']) {
  expect(
    await ret.getByText(name).first().isVisible(),
    `@reticulyne/editor shows ${name}`
  );
}

expect(
  problems.length === 0,
  'no console errors, failed requests or CSP violations'
);
for (const p of problems) console.log('     ', p.slice(0, 200));
await browser.close();
if (failures.length) {
  console.error(`${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('All checks passed');
