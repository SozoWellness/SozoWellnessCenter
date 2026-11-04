import source from './research-source.json';
import cellsonicTreatments from './cellsonic-treatments.md?raw';
import cellsonicTechnology from './cellsonic-technology.md?raw';
import cardioChf from './cardio-medbed-chf.md?raw';
import cardioScience from './cardio-medbed-science.md?raw';
import { wellnessArticles } from './wellness-articles';
import { parseInlineMarkup, type Inline } from '../lib/inline-markup';

export type { Inline } from '../lib/inline-markup';
export type Block =
  | { type: 'h2' | 'h3' | 'p'; content: Inline[] }
  | { type: 'ul'; items: Inline[][] };

export type ResearchArticle = {
  slug: string;
  path: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  blocks: Block[];
  markdown: string;
};

const images: Record<string, string> = {
  'hyperbaric-oxygen-therapy-a-comprehensive-guide': '/images/research/Hyperbaric-Oxygen-Therapy_-A-Comprehensive-Guide-1400x700.jpg',
  'unlock-your-potential-with-the-energy-for-life-assessment': '/images/research/Unlocking-Your-Potential-with-the-Energy-for-Life-Assessment-2-994x497.png',
  'benefits-of-hyperbaric-oxygen-therapy': '/images/research/Blue-HBOT-1798x899.png',
  'the-revolutionary-anti-aging-benefits-of-hyperbaric-chambers': '/images/research/The-Revolutionary-Anti-Aging-Benefits-of-Hyperbaric-Chambers-600x300.jpg',
};

const OLD = 'https://sozorootedwellness.com';
function rewriteHref(href: string) {
  if (!href.startsWith(OLD)) return href;
  const path = href.slice(OLD.length).replace(/\/$/, '');
  if (path === '/contact') return '/request-assessment';
  const slug = path.replace(/^\//, '');
  return images[slug] ? `/research/${slug}` : href;
}

export function parseInline(raw: string): Inline[] {
  return parseInlineMarkup(raw, rewriteHref);
}

function parseBody(md: string): { title: string; blocks: Block[] } {
  const chunks = md.split(/\n{2,}/).map(c => c.trim()).filter(Boolean);
  let title = '';
  const blocks: Block[] = [];
  for (const c of chunks) {
    if (c.startsWith('# ')) { title = c.slice(2); continue; }
    if (c === 'You are here:' || c.startsWith('![')) continue; // website chrome / hero image
    if (c.startsWith('## ')) blocks.push({ type: 'h2', content: parseInline(c.slice(3)) });
    else if (c.startsWith('### ')) blocks.push({ type: 'h3', content: parseInline(c.slice(4)) });
    else if (c.startsWith('- ')) blocks.push({ type: 'ul', items: c.split('\n').map(l => parseInline(l.replace(/^- /, ''))) });
    else blocks.push({ type: 'p', content: parseInline(c) });
  }
  return { title, blocks };
}

function parseListing(md: string) {
  return md.split(/\n(?=\[!\[)/).filter(b => b.includes('### [')).map(b => {
    const slug = /\]\(https:\/\/sozorootedwellness\.com\/([^/]+)\/\)/.exec(b)![1];
    const alt = /\[!\[([^\]]*)\]/.exec(b)![1];
    const author = /\[By ([^\]]+)\]/.exec(b)![1];
    const date = /\[([A-Z][a-z]+ \d{1,2}, \d{4})\]/.exec(b)![1];
    const lines = b.split(/\n{2,}/).map(l => l.trim());
    const metaIdx = lines.findIndex(l => l.startsWith('[Research]'));
    return { slug, alt, author, date, excerpt: lines[metaIdx + 1] };
  });
}

const listing = parseListing(source.listing);

export const researchArticles: ResearchArticle[] = listing.map(l => {
  const a = source.articles.find(x => x.slug === l.slug)!;
  const { title, blocks } = parseBody(a.markdown);
  const markdown = a.markdown.replace(/\nYou are here:\n/g, '\n').replace(/https:\/\/sozorootedwellness\.com\/contact\//g, '/request-assessment');
  return { slug: l.slug, path: `/research/${l.slug}`, title, author: l.author, date: l.date, excerpt: l.excerpt, image: images[l.slug], imageAlt: l.alt || title, blocks, markdown };
});

for (const [slug, markdown, excerpt, image, imageAlt] of [
  ['cellsonic-treatments', cellsonicTreatments, 'Explore Cellsonic applications, what a session involves and the questions to ask about pain, movement and your treatment goals.', '/images/research/cellsonic-treatments-hero.jpg', 'Conceptual illustration of an ankle surrounded by pressure-wave rings'],
  ['the-technology-behind-cellsonic', cellsonicTechnology, 'Understand pressure pulses, the body’s repair processes and what to expect when considering Cellsonic at SOZO.', '/images/research/cellsonic-technology-hero.jpg', 'Conceptual illustration of pressure waves passing through layered tissue'],
]) {
  const { title, blocks } = parseBody(markdown);
  researchArticles.push({ slug, path: `/research/${slug}`, title, author: 'SOZO Wellness Center', date: '', excerpt, image, imageAlt, blocks, markdown });
}

export function researchDownload(article: ResearchArticle) {
  return `data:text/markdown;charset=utf-8,${encodeURIComponent(article.markdown)}`;
}

for (const [slug, markdown, excerpt, image, imageAlt] of [
  ['cardio-medbed-heart-failure', cardioChf, 'Explore external counterpulsation research, heart-failure outcomes and the questions to discuss with your cardiologist. Cardio MedBed is available at SOZO.', '/images/research/cardio-medbed-chf-hero.jpg', 'Conceptual illustration of a heart and branching circulation pathways'],
  ['how-cardio-medbed-works', cardioScience, 'Understand how external counterpulsation works with your heartbeat and what to ask before considering Cardio MedBed treatment at SOZO.', '/images/research/cardio-medbed-science-hero.jpg', 'Abstract illustration of synchronized pressure bands and a rhythmic pulse wave'],
]) {
  const { title, blocks } = parseBody(markdown);
  researchArticles.push({ slug, path: `/research/${slug}`, title, author: 'SOZO Wellness Center', date: '', excerpt, image, imageAlt, blocks, markdown });
}

for (const article of wellnessArticles) {
  const { title, blocks } = parseBody(article.markdown);
  researchArticles.push({
    ...article, title, blocks, path: `/research/${article.slug}`,
    author: 'SOZO Wellness Center', date: '',
  });
}

export const getResearchArticle = (slug: string) => researchArticles.find(a => a.slug === slug);
