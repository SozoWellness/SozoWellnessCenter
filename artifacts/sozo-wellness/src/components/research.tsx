import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { researchArticles, getResearchArticle, researchDownload, type Inline } from '@/data/research';
import './research.css';

function Text({ parts }: { parts: Inline[] }) {
  return <>{parts.map((p, i) => {
    const inner = p.bold ? <strong>{p.text}</strong> : p.text;
    if (!p.href) return <span key={i}>{inner}</span>;
    if (p.href.startsWith('/')) return <Link key={i} href={p.href} data-testid={`link-article-inline-${i}`}>{inner}</Link>;
    return <a key={i} href={p.href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  })}</>;
}

function Meta({ author, date }: { author: string; date: string }) {
  return <p className="research-meta"><span>Articles &amp; Resources</span><span>By {author}</span>{date && <span>{date}</span>}</p>;
}

export function ResearchHighlights({ topic }: { topic: 'hyperbaric' | 'assessment' | 'cellsonic' | 'cardio' }) {
  const articles = researchArticles.filter(a => topic === 'hyperbaric'
    ? a.slug.includes('hyperbaric')
    : topic === 'cellsonic' ? a.slug.includes('cellsonic')
    : topic === 'cardio' ? a.slug.includes('cardio-medbed')
    : a.slug === 'unlock-your-potential-with-the-energy-for-life-assessment');
  const heading = topic === 'hyperbaric' ? 'Explore hyperbaric oxygen in depth.' : topic === 'cellsonic' ? 'Take a closer look at Cellsonic.' : topic === 'cardio' ? 'Explore the research behind Cardio MedBed.' : 'Discover the Energy for Life Assessment.';
  return <section className="section research-highlights" aria-labelledby={`research-${topic}-heading`}>
    <div className="container">
      <div className="section-header">
        <div><span className="eyebrow">Articles &amp; Resources</span><h2 id={`research-${topic}-heading`} className="section-title serif">{heading}</h2></div>
        <Link href="/blog" className="btn btn-text">Explore all articles &amp; resources <ArrowUpRight size={17}/></Link>
      </div>
      <div className={topic === 'assessment' ? 'research-highlight-single' : 'research-grid'}>
        {articles.map(a => <Link href={a.path} key={a.slug} className={topic === 'assessment' ? 'research-lead' : 'research-card'} data-testid={`link-${topic}-research-${a.slug}`}>
          <img src={a.image} alt={a.imageAlt} loading="lazy" width="1000" height="500"/>
          <div className="research-highlight-copy">
            <Meta author={a.author} date={a.date}/>
            <h3 className="serif">{a.title}</h3>
            <p>{a.excerpt}</p>
            <span className="btn btn-text">Read article <ArrowRight size={17}/></span>
          </div>
        </Link>)}
      </div>
    </div>
  </section>;
}

export function ResearchListing() {
  const [lead, ...rest] = researchArticles;
  return <>
    <section className="page-hero"><div className="container">
      <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / Articles &amp; Resources</span>
      <div style={{ marginTop: 32 }}><span className="eyebrow">Articles &amp; Resources</span></div>
      <h1 className="serif fade-up">Articles &amp; Resources</h1>
    </div></section>
    <section className="section research-list"><div className="container">
      <Link href={lead.path} className="research-lead" data-testid={`card-research-${lead.slug}`}>
        <img src={lead.image} alt={lead.imageAlt} width="1400" height="700" />
        <div><Meta author={lead.author} date={lead.date} /><h2 className="serif">{lead.title}</h2><p>{lead.excerpt}</p><span className="btn btn-text">Details <ArrowUpRight size={17} /></span></div>
      </Link>
      <div className="research-grid">
        {rest.map(a => <Link href={a.path} key={a.slug} className="research-card" data-testid={`card-research-${a.slug}`}>
          {a.image && <img src={a.image} alt={a.imageAlt} loading="lazy" width="1000" height="500" />}
          <Meta author={a.author} date={a.date} />
          <h2 className="serif">{a.title}</h2>
          <p>{a.excerpt}</p>
          <span className="btn btn-text">Details <ArrowUpRight size={17} /></span>
        </Link>)}
      </div>
      <section style={{ marginTop: 56 }} aria-labelledby="research-downloads-heading">
        <h2 id="research-downloads-heading" className="serif">Download articles</h2>
        <p>Save any article as a Markdown (.md) file.</p>
        <ul>{researchArticles.map(a => <li key={a.slug} style={{ marginTop: 16 }}><a href={researchDownload(a)} download={`${a.slug}.md`} className="btn btn-text" data-testid={`download-${a.slug}`}>{a.title} — Download .md</a></li>)}</ul>
      </section>
    </div></section>
  </>;
}

export function ResearchArticlePage({ slug }: { slug: string }) {
  const a = getResearchArticle(slug)!;
  const idx = researchArticles.indexOf(a);
  const next = researchArticles[(idx + 1) % researchArticles.length];
  return <article className="research-article">
    <header className="research-head"><div className="container">
      <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / <Link href="/blog" data-testid="link-breadcrumb-research">Articles &amp; Resources</Link></span>
      <h1 className="serif fade-up" data-testid="text-article-title">{a.title}</h1>
      <Meta author={a.author} date={a.date} />
      {a.slug.includes('cardio-medbed') && <p className="notice">Cardio MedBed is available at SOZO. <Link href="/services/cardio-medbed" className="btn btn-text" data-testid="link-article-cardio-service">Explore Cardio MedBed <ArrowRight size={16}/></Link></p>}
      <a href={researchDownload(a)} download={`${a.slug}.md`} className="btn btn-outline" style={{ marginTop: 24 }} data-testid="download-article-markdown">Download article (.md)</a>
    </div></header>
    {a.image && <div className="container research-figure"><img src={a.image} alt={a.imageAlt} width="1400" height="700" /></div>}
    <div className="container research-body" data-testid="article-body">
      {a.blocks.map((b, i) => b.type === 'ul'
        ? <ul key={i}>{b.items.map((it, j) => <li key={j}><Text parts={it} /></li>)}</ul>
        : b.type === 'h2' ? <h2 key={i}><Text parts={b.content} /></h2>
        : b.type === 'h3' ? <h3 key={i}><Text parts={b.content} /></h3>
        : <p key={i}><Text parts={b.content} /></p>)}
    </div>
    <nav className="container research-nav" aria-label="Articles & Resources navigation">
      <Link href="/blog" className="btn btn-outline" data-testid="link-back-research"><ArrowLeft size={16} /> All articles &amp; resources</Link>
      <Link href={next.path} className="research-next" data-testid="link-next-article"><span>Next article</span><strong>{next.title}</strong><ArrowRight size={18} /></Link>
    </nav>
  </article>;
}
