import { Link } from 'wouter';
import { ArrowRight, Check } from 'lucide-react';
import { getInquiryHref } from '@/lib/inquiry';
import { serviceHeroes } from '@/data/discovery';
import './service-hero.css';

type D = { eyebrow: string; title: string; intro: string; availability?: string; image?: string; imageAlt?: string; imageFit?: 'cover' | 'contain'; imageAspectRatio?: string };

export function ServiceHero({ path, d, image, imageAlt, fit }: { path: string; d: D; image?: string; imageAlt?: string; fit?: 'cover' | 'contain' }) {
  const h = serviceHeroes[path];
  const src = image || d.image;
  return <section className="sh" data-testid="section-service-hero"><div className={`container sh-grid${src ? '' : ' sh-grid-text'}`}>
    <div className="sh-copy">
      <span className="crumb"><Link href="/" data-testid="link-breadcrumb-home">Home</Link> / {d.eyebrow}</span>
      <h1 className="serif fade-up">{d.title}</h1>
      <p className="sh-intro fade-up delay-1">{d.intro}</p>
      <ul className="sh-points fade-up delay-1">{h.highlights.map(t => <li key={t}><Check size={18} aria-hidden="true"/>{t}</li>)}</ul>
      {d.availability && <p className="notice sh-availability" data-testid="notice-service-availability">{d.availability}</p>}
      <Link href={getInquiryHref(h.interest)} className="btn btn-primary fade-up delay-2" data-testid="link-page-hero-request">{h.cta} <ArrowRight size={17} aria-hidden="true"/></Link>
    </div>
    {src && <figure className="sh-photo" style={d.imageAspectRatio ? { aspectRatio: d.imageAspectRatio } : undefined}><img src={src} alt={imageAlt || d.imageAlt || ''} loading="eager" fetchPriority="high" width={900} height={640} style={{ objectFit: fit || d.imageFit }}/></figure>}
  </div></section>;
}
