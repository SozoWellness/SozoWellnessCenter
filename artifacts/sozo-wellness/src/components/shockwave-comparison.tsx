import { Hammer, Sprout, Check, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { technologies, rowLabels, togetherBenefits, approachServices, type Tech } from '@/data/shockwave-comparison';
import { ASSESSMENT_CTA, getInquiryHref } from '@/lib/inquiry';
import './shockwave-comparison.css';

type RowKey = keyof typeof rowLabels;
const rows: RowKey[] = ['technology', 'action', 'bestFor', 'how', 'sensation', 'thinkOf'];

function Cell({ t, k }: { t: Tech; k: RowKey }) {
  if (k === 'technology') return <><strong>{t.technology}</strong>{t.technologyNote && <span className="swc-note">({t.technologyNote})</span>}</>;
  if (k === 'bestFor') return <ul className="swc-list">{t.bestFor.map(b => <li key={b}>{b}</li>)}</ul>;
  if (k === 'thinkOf') return <q className="swc-quote">{t.thinkOf}</q>;
  return <>{t[k]}</>;
}

function Head({ t, mobile = false }: { t: Tech; mobile?: boolean }) {
  const Name = mobile ? 'h3' : 'span';
  return <>
    <span className="swc-kind">{t.kind}</span>
    <Name className="swc-name">{t.name}</Name>
    {t.sub && <span className="swc-sub">{t.sub}</span>}
    <img src={t.image} alt={t.imageAlt} width={460} height={t.id === 'regen' ? 134 : 142} loading="lazy" decoding="async" />
  </>;
}

export function ShockwaveComparison() {
  return (
    <section id="shockwave-comparison" className="swc" aria-labelledby="swc-title" data-testid="section-shockwave-comparison">
      <div className="container">
        <header className="swc-intro">
          <span className="eyebrow">Shockwave & regeneration technologies</span>
          <h2 id="swc-title" className="serif">Understanding <em>the difference.</em></h2>
          <p>Different tools. Different actions. One goal: helping your body heal. Here is how the four technologies compare, side by side.</p>
        </header>

        {/* Desktop/tablet: true comparison table */}
        <div className="swc-table-wrap">
          <table className="swc-table">
            <caption className="sr-only">At a glance: KINAS S-TO-R-Z, Radial Shockwave, Focused Shockwave and ReGen RCT compared</caption>
            <thead>
              <tr>
                <td className="swc-corner">At a glance</td>
                {technologies.map(t => <th key={t.id} scope="col" className={`swc-col swc-${t.id}`}><Head t={t} /></th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(k => (
                <tr key={k} className={`swc-row-${k}`}>
                  <th scope="row">{rowLabels[k]}</th>
                  {technologies.map(t => <td key={t.id} className={`swc-${t.id}`}><Cell t={t} k={k} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one readable card per technology */}
        <div className="swc-cards">
          {technologies.map(t => (
            <article key={t.id} className={`swc-card swc-${t.id}`} aria-labelledby={`swc-card-${t.id}`} data-testid={`card-technology-${t.id}`}>
              <header className="swc-card-head" id={`swc-card-${t.id}`}><Head t={t} mobile /></header>
              <dl>
                {rows.map(k => <div key={k} className={`swc-dl-${k}`}><dt>{rowLabels[k]}</dt><dd><Cell t={t} k={k} /></dd></div>)}
              </dl>
            </article>
          ))}
        </div>

        <div className="swc-big" aria-labelledby="swc-big-title">
          <h3 id="swc-big-title" className="serif">The big difference</h3>
          <div className="swc-big-grid">
            <div className="swc-side swc-mech">
              <Hammer size={34} strokeWidth={1.4} aria-hidden="true" />
              <h4>Radial & Focused Shockwave</h4>
              <p className="swc-tag">Primarily <strong>mechanical</strong> therapy.</p>
              <p>It creates physical stress in the tissues to break up scar tissue, reduce pain, and stimulate the body’s repair crew.</p>
              <p className="swc-dir">Works from the outside in.</p>
            </div>
            <span className="swc-vs" aria-hidden="true">vs.</span>
            <div className="swc-side swc-bio">
              <Sprout size={34} strokeWidth={1.4} aria-hidden="true" />
              <h4>ReGen RCT®</h4>
              <p className="swc-tag">Primarily <strong>biologic / regenerative</strong> therapy.</p>
              <p>It stimulates cellular communication, improves circulation, encourages growth factors and stem cell activity, and optimizes the body’s natural healing.</p>
              <p className="swc-dir">Works from the inside out.</p>
            </div>
          </div>
        </div>

        <div className="swc-lower">
          <div className="swc-garden">
            <h3 className="serif">A simple way to understand it</h3>
            <div className="swc-garden-grid">
              <div className="swc-plot swc-soil">
                <h4>Radial / Focused Shockwave</h4>
                <p>Imagine a garden with hard, packed soil.</p>
                <p>Shockwave loosens the ground, breaks up rocks and debris, and removes obstacles so new growth can occur.</p>
              </div>
              <p className="swc-together"><span>Best</span> when used together</p>
              <div className="swc-plot swc-grow">
                <h4>ReGen RCT®</h4>
                <p>Once the soil is ready, ReGen RCT® nourishes the garden: feeding the cells, improving circulation, and encouraging healthy growth and long-term healing.</p>
              </div>
            </div>
          </div>
          <aside className="swc-benefits" aria-labelledby="swc-benefits-title">
            <h3 id="swc-benefits-title">Together, these technologies help:</h3>
            <ul>{togetherBenefits.map(b => <li key={b}><Check size={16} strokeWidth={2.4} aria-hidden="true" />{b}</li>)}</ul>
          </aside>
        </div>

        <div className="swc-approach">
          <div>
            <span className="eyebrow">Our SOZO approach</span>
            <p className="serif">Every body is different. That’s why we combine advanced technologies and personalized care to create the best possible plan for you.</p>
            <ul className="swc-services" aria-label="Technologies and care we combine">
              {approachServices.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <Link href={getInquiryHref('Shockwave therapy')} className="btn btn-primary" data-testid="link-shockwave-assessment">
            {ASSESSMENT_CTA} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
