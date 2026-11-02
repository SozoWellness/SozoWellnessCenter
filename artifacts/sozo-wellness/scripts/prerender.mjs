import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const vite = await createServer({
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
});

const escapeAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

try {
  const { default: App, meta, SITE_URL } = await vite.ssrLoadModule('/src/App.tsx');
  const shell = await readFile(path.join(output, 'index.html'), 'utf8');
  const routes = Object.keys(meta);

  for (const route of routes) {
    const [title, description] = meta[route];
    const url = `${SITE_URL}${route}`;
    const content = renderToString(createElement(App, { ssrPath: route }));
    if (!content.includes('<h1')) throw new Error(`Missing page content for ${route}`);

    let html = shell.replace(/<title>.*?<\/title>/s, `<title>${escapeText(title)}</title>`);
    for (const [selector, value] of [
      ['name="description"', description],
      ['property="og:title"', title],
      ['property="og:description"', description],
      ['name="twitter:title"', title],
      ['name="twitter:description"', description],
    ]) {
      const pattern = new RegExp(`(<meta ${selector} content=")[^"]*(" */>)`);
      if (!pattern.test(html)) throw new Error(`Missing ${selector} in HTML shell`);
      html = html.replace(pattern, `$1${escapeAttribute(value)}$2`);
    }
    html = html.replace('</head>', `    <link rel="canonical" href="${escapeAttribute(url)}" />\n    <meta property="og:url" content="${escapeAttribute(url)}" />\n  </head>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
    const destination = route === '/' ? path.join(output, 'index.html') : path.join(output, route.slice(1), 'index.html');
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  // The static host serves this file with HTTP 404 when no file or exact rewrite matches.
  // Render the same not-found view used by client-side navigation, without a canonical URL.
  const notFoundTitle = 'Page not found | SOZO Wellness Center';
  const notFoundDescription = 'The page you requested is not available. Return to SOZO Wellness Center to explore our wellness services near The Villages, Florida.';
  const notFoundContent = renderToString(createElement(App, { ssrPath: '/page-not-found' }));
  if (!notFoundContent.includes('data-testid="link-404-home"')) throw new Error('Missing not-found page content');
  let notFoundHtml = shell.replace(/<title>.*?<\/title>/s, `<title>${escapeText(notFoundTitle)}</title>`);
  for (const [selector, value] of [
    ['name="description"', notFoundDescription],
    ['property="og:title"', notFoundTitle],
    ['property="og:description"', notFoundDescription],
    ['name="twitter:title"', notFoundTitle],
    ['name="twitter:description"', notFoundDescription],
  ]) {
    const pattern = new RegExp(`(<meta ${selector} content=")[^"]*(" */>)`);
    if (!pattern.test(notFoundHtml)) throw new Error(`Missing ${selector} in HTML shell`);
    notFoundHtml = notFoundHtml.replace(pattern, `$1${escapeAttribute(value)}$2`);
  }
  notFoundHtml = notFoundHtml.replace(/(<meta name="robots" content=")[^"]*(" *\/>)/, '$1noindex, follow$2');
  notFoundHtml = notFoundHtml.replace('<div id="root"></div>', `<div id="root">${notFoundContent}</div>`);
  await writeFile(path.join(output, '404.html'), notFoundHtml);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(path.join(output, 'sitemap.xml'), sitemap);
  console.info(`Prerendered ${routes.length} public routes.`);
} finally {
  await vite.close();
}