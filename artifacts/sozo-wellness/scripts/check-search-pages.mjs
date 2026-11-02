import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://sozorootedwellness.com';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sameRoutes(actual, expected, label) {
  const missing = [...expected].filter(route => !actual.includes(route));
  const extra = actual.filter(route => !expected.includes(route));
  assert(!missing.length && !extra.length, `${label}: missing [${missing.join(', ')}], unexpected [${extra.join(', ')}]`);
  assert(new Set(actual).size === actual.length, `${label}: duplicate routes`);
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, double, single]) => [key, double ?? single]));
}

function headValue(head, tag, attribute, value, result) {
  const values = [...head.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))]
    .map(match => attributes(match[0]))
    .filter(attrs => attrs[attribute] === value)
    .map(attrs => attrs[result]);
  assert(values.length === 1 && values[0], `expected one ${tag}[${attribute}="${value}"] with ${result}`);
  return values[0];
}

function readable(html) {
  return html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function rewriteRules(toml) {
  return [...toml.matchAll(/\[\[services\.production\.rewrites\]\]([\s\S]*?)(?=\[\[|\[services\.|$)/g)]
    .map(([, block]) => {
      const from = block.match(/^from\s*=\s*"([^"]+)"/m)?.[1];
      const to = block.match(/^to\s*=\s*"([^"]+)"/m)?.[1];
      assert(from && to, 'incomplete production rewrite');
      return { from, to };
    });
}

async function builtRoutes(output, subdir = '') {
  const entries = await readdir(path.join(output, subdir), { withFileTypes: true });
  const routes = [];
  for (const entry of entries) {
    const relative = path.posix.join(subdir, entry.name);
    if (entry.isDirectory()) routes.push(...await builtRoutes(output, relative));
    else if (entry.name === 'index.html') routes.push(subdir ? `/${subdir}` : '/');
  }
  return routes;
}

function checkPageLinks(html, route, routes) {
  const pages = new Set(routes);
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attributes(match[0]).href;
    if (!href || href.startsWith('#') || href.startsWith('?')) continue;
    if (href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) {
      const destination = new URL(href, site);
      const clinicDomains = ['sozorootedwellness.com', 'sozowellness.com'];
      const hostname = destination.hostname.replace(/^www\./, '');
      assert(!clinicDomains.includes(hostname),
        `${route}: outbound clinic-site link "${href}" must use a local page instead`);
      continue;
    }

    // Resolve against the published route, not its index.html or an invented trailing slash.
    const destination = new URL(href, `${site}${route}`).pathname;
    // Static files are not page routes (e.g. PDFs, images and Vite assets).
    if (path.posix.extname(destination)) continue;
    const page = destination.replace(/\/+$/, '') || '/';
    assert(pages.has(page), `${route}: broken internal page link "${href}" (target ${page})`);
  }
}

// Keep this independent of App's meta map and the prerenderer's route list.
// Adding a <Route> must require a matching static page, sitemap entry and rewrite.
export async function checkSearchPages({ app = path.join(root, 'src/App.tsx'), output = path.join(root, 'dist/public'), toml = path.join(root, '.replit-artifact/artifact.toml'), sourceSitemap = path.join(root, 'public/sitemap.xml') } = {}) {
  const [source, config, sitemap, publicSitemap] = await Promise.all([
    readFile(app, 'utf8'), readFile(toml, 'utf8'),
    readFile(path.join(output, 'sitemap.xml'), 'utf8'), readFile(sourceSitemap, 'utf8'),
  ]);
  const routes = [...source.matchAll(/<Route\b[^>]*\bpath\s*=\s*"([^"]+)"/g)].map(match => match[1]);
  assert(routes.length > 0, 'No public routes found in App.tsx');
  assert([...source.matchAll(/<Route\b[^>]*\bpath\s*=/g)].length === routes.length,
    'A public Route does not use a literal double-quoted path; update the search-page check to support it');
  assert(routes.every(route => route.startsWith('/') && !/[:*?]/.test(route)), 'Public routes must be static paths; update the search-page check for dynamic routes');
  assert(new Set(routes).size === routes.length, 'Duplicate public routes in App.tsx');

  const expectedUrls = routes.map(route => `${site}${route}`);
  for (const [label, xml] of [['dist/public/sitemap.xml', sitemap], ['public/sitemap.xml', publicSitemap]]) {
    const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => match[1].trim());
    sameRoutes(urls, expectedUrls, label);
  }
  sameRoutes(await builtRoutes(output), routes, 'dist/public HTML pages');

  const rules = rewriteRules(config);
  // Unmatched URLs must fall through to the static host's 404.html, not a SPA rewrite.
  sameRoutes(rules.map(rule => rule.from), routes.filter(route => route !== '/'), 'exact production rewrites');
  for (const rule of rules) {
    assert(rule.to === `${rule.from}/index.html`, `${rule.from}: rewrite must target its own prerendered HTML, not the home page`);
  }
  const notFound = await readFile(path.join(output, '404.html'), 'utf8');
  assert(/<title>Page not found \| SOZO Wellness Center<\/title>/.test(notFound), '404.html: missing distinct title');
  assert(/<meta name="robots" content="noindex, follow"/.test(notFound), '404.html: must be noindex');
  assert(/<main\b[^>]*>[\s\S]*?Page not found[\s\S]*?<\/main>/i.test(notFound), '404.html: missing not-found content');
  assert(!/<link rel="canonical"/.test(notFound), '404.html: must not claim a canonical page');

  const titles = new Set();
  const descriptions = new Set();
  const bodies = new Set();
  for (const route of routes) {
    const html = await readFile(path.join(output, route === '/' ? '' : route.slice(1), 'index.html'), 'utf8');
    checkPageLinks(html, route, routes);
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
    assert(head, `${route}: missing head`);
    const titleTags = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
    assert(titleTags.length === 1, `${route}: expected exactly one title`);
    const title = titleTags[0][1].trim();
    const description = headValue(head, 'meta', 'name', 'description', 'content');
    assert(title && title.length >= 15 && !titles.has(title), `${route}: missing, short or duplicate title`);
    assert(description.length >= 50 && !descriptions.has(description), `${route}: missing, short or duplicate description`);
    titles.add(title);
    descriptions.add(description);
    assert(headValue(head, 'link', 'rel', 'canonical', 'href') === `${site}${route}`, `${route}: incorrect canonical URL`);
    for (const [type, name, expected] of [
      ['property', 'og:url', `${site}${route}`],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
    ]) {
      assert(headValue(head, 'meta', type, name, 'content') === expected, `${route}: incorrect ${name}`);
    }
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/gi);
    assert(main?.length === 1, `${route}: expected exactly one main element`);
    const headings = [...main[0].matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    assert(headings.length === 1 && readable(headings[0][1]).length >= 8, `${route}: expected one meaningful H1 inside main`);
    const body = readable(main[0]);
    assert(body.length >= 150 && !bodies.has(body), `${route}: main content is empty, too short or identical to another page (possible home-page fallback)`);
    bodies.add(body);
  }
  return routes.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const count = await checkSearchPages();
    console.info(`Search-page check passed for ${count} public routes.`);
  } catch (error) {
    console.error(`Search-page check failed: ${error.message}`);
    process.exitCode = 1;
  }
}