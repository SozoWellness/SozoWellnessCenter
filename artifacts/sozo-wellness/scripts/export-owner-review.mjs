// Export the approved-scope review as a self-contained, non-runtime document.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'generated-artifacts/owner-review');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const inline = text => escape(text)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
function render(markdown) {
  const lines = markdown.split('\n');
  let html = '', list = false, fence = false, table = false;
  const close = () => { if (list) { html += '</ul>'; list = false; } if (table) { html += '</tbody></table></div>'; table = false; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      close(); html += fence ? '</code></pre>' : '<pre><code>'; fence = !fence; continue;
    }
    if (fence) { html += escape(line) + '\n'; continue; }
    if (line.startsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      if (list) { html += '</ul>'; list = false; }
      const cells = line.split('|').slice(1, -1);
      if (!table) {
        html += '<div class="table-wrap"><table><thead><tr>' + cells.map(c => `<th>${inline(c.trim())}</th>`).join('') + '</tr></thead><tbody>';
        table = true;
      } else html += '<tr>' + cells.map(c => `<td>${inline(c.trim())}</td>`).join('') + '</tr>';
      continue;
    }
    if (table) { html += '</tbody></table></div>'; table = false; }
    const heading = line.match(/^(#{1,4}) (.+)$/);
    if (heading) { close(); const level = heading[1].length + 1; html += `<h${level}>${inline(heading[2])}</h${level}>`; continue; }
    const item = line.match(/^(?:- |\d+\. )(.+)$/);
    if (item) {
      if (!list) { html += '<ul>'; list = true; }
      html += `<li>${inline(item[1]).replace(/^\[x\] /, '<span class="done">Completed</span> ').replace(/^\[ \] /, '<span class="pending">Pending</span> ')}</li>`;
    } else {
      if (list) { html += '</ul>'; list = false; }
      if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
  }
  close(); return html;
}
const sections = [
  ['readiness', 'Launch readiness', 'WEBSITE-LAUNCH-READINESS.md'],
  ['journeys', 'Workflow audit', 'WEBSITE-WORKFLOW-AUDIT.md'],
  ['services', 'Services & book', 'WEBSITE-SERVICE-REVIEW.md'],
  ['resources', 'Resource organization', 'RESOURCE-ORGANIZATION-PLAN.md'],
];
const content = await Promise.all(sections.map(async ([id, title, file]) =>
  `<section id="${id}"><p class="section-label">${escape(title)}</p>${render(await readFile(path.join(root, file), 'utf8'))}</section>`));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SOZO — Owner Review & Launch Readiness</title><style>
*{box-sizing:border-box}body{margin:0;background:#f7f4ea;color:#193f3b;font:17px/1.65 system-ui,sans-serif}header,main{max-width:1180px;margin:auto;padding:32px clamp(18px,4vw,52px)}header{padding-top:54px}h1{font:normal clamp(32px,5vw,52px)/1.15 Georgia,serif;margin:12px 0}h2{font:normal 34px/1.25 Georgia,serif}h3{font-size:24px;margin-top:34px}h4,h5{font-size:20px}p,li{max-width:1050px}section{border-top:2px solid #9ab9ad;padding-block:32px;scroll-margin-top:20px}.section-label{font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:14px;color:#6b4d2d}nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}nav a{padding:10px 16px;background:#164d4b;color:white;border-radius:4px;text-decoration:none}code{font-size:.88em;overflow-wrap:anywhere}pre{overflow:auto;padding:20px;background:#e7eee5}strong{font-weight:700}.table-wrap{overflow:auto;margin-block:20px}table{border-collapse:collapse;width:100%;font-size:16px}th,td{border:1px solid #b8ccc0;padding:12px 14px;text-align:left;vertical-align:top}th{background:#dce9e0}td{min-width:130px}li{margin-bottom:10px}.done,.pending{font-weight:700;font-size:13px;padding:3px 7px;border-radius:3px;white-space:nowrap}.done{background:#d7e7d8}.pending{background:#f1deb5}.notice{padding:18px 22px;border-left:4px solid #a8743d;background:#eee4d0}@media print{body{background:white;color:#111;font-size:11pt}header,main{max-width:none;padding:12px}nav{display:none}section{break-before:page}.table-wrap{overflow:visible}th,td{min-width:0;font-size:9pt;padding:6px}pre{white-space:pre-wrap}}
</style></head><body><header><p class="section-label">SOZO Wellness Center · November 5, 2026</p><h1>Owner Review &amp; Launch Readiness</h1><p class="notice"><strong>Preview updates only — not launch approval.</strong> No live-site changes, messages, subscriptions, bookings or file deletions were made. Outstanding acceptance checks are identified below.</p><nav aria-label="Report sections">${sections.map(([id,title])=>`<a href="#${id}">${title}</a>`).join('')}</nav></header><main>${content.join('\n')}</main></body></html>`;
await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'sozo-owner-review.html'), html);
console.log('Exported generated-artifacts/owner-review/sozo-owner-review.html');
