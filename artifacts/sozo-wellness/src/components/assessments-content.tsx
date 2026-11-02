import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ASSESSMENT_CTA, getInquiryHref, type InquiryInterest } from "@/lib/inquiry";
import "./assessments-content.css";

type Block = { title: string; text: string; image?: string; imageAlt?: string; imageFit?: 'cover' | 'contain'; imagePosition?: string; details?: { title: string; text: string }[] };
type Detail = { heading: string; paragraphs: string[]; blocks: Block[] };

const meta: Record<string, { id: string; interest: InquiryInterest; label: string; involves: string; receive: string }> = {
  'Vitalyzer': { id: 'vitalyzer', interest: 'Vitalyzer', label: 'Vitalyzer', involves: 'A noninvasive bio-energetic assessment.', receive: 'A visual report to review with our team, with categories such as stressors, emotions and foods.' },
  'NeuralChek': { id: 'neuralchek', interest: 'NeuralChek', label: 'NeuralChek', involves: 'A quick, noninvasive assessment with sensors placed on your body.', receive: 'Heart rate variability readings organized into a report, explained by our team.' },
  'Live blood analysis': { id: 'live-blood', interest: 'Live blood analysis', label: 'Live blood analysis', involves: 'Real-time microscope viewing of your blood cells.', receive: 'A personalized snapshot and a guided conversation with Carole Bernard, our Certified Microscopist.' },
};

export function AssessmentsContent({ detail }: { detail: Detail }) {
  return (
    <section className="asx section" data-testid="section-assessments">
      <div className="container">
        <div className="asx-intro">
          <div>
            <span className="eyebrow">A closer look</span>
            <h2 className="asx-heading">{detail.heading}</h2>
          </div>
          <div className="asx-paras">
            {detail.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="asx-compare" id="compare" data-testid="section-assessment-compare">
          <h2 className="asx-compare-title">The three assessments at a glance</h2>
          <div className="asx-compare-grid">
            {detail.blocks.map((b) => { const m = meta[b.title]; return (
              <div className="asx-compare-col" key={b.title}>
                <h3>{b.title}</h3>
                <dl><dt>What it involves</dt><dd>{m.involves}</dd><dt>What you receive</dt><dd>{m.receive}</dd></dl>
                <a href={`#${m.id}`} className="asx-jump" data-testid={`link-jump-${m.id}`}>Jump to {b.title} <ArrowRight size={15} aria-hidden="true" /></a>
              </div>
            ); })}
          </div>
        </div>

        <ol className="asx-list">
          {detail.blocks.map((b, i) => (
            <li
              key={b.title}
              id={meta[b.title].id}
              className={`asx-item${b.image ? " has-photo" : ""}`}
              data-testid={`assessment-${i}`}
            >
              <span className="asx-no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="asx-copy">
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                {b.details && (
                  <dl className="asx-details">
                    {b.details.map((item) => (
                      <div key={item.title}>
                        <dt>{item.title}</dt>
                        <dd>{item.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <Link
                  href={getInquiryHref(meta[b.title].interest)}
                  className="asx-link"
                  data-testid={`link-assessment-request-${i}`}
                  aria-label={`${ASSESSMENT_CTA}: ${b.title}`}
                >
                  {ASSESSMENT_CTA} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              {b.image && (
                <figure className="asx-photo">
                  <img
                    src={b.image}
                    alt={b.imageAlt || ""}
                    width={700}
                    height={500}
                    loading="lazy"
                    style={{ objectFit: b.imageFit, objectPosition: b.imagePosition }}
                  />
                </figure>
              )}
            </li>
          ))}
        </ol>

        <div className="asx-cta">
          <p>Not sure which one fits? Tell us what you are curious about.</p>
          <div className="asx-cta-actions">
            <Link
              href={getInquiryHref("Wellness assessments")}
              className="btn btn-primary"
              data-testid="link-assessments-request"
            >
              {ASSESSMENT_CTA} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href="tel:+13528022248" className="asx-phone" data-testid="link-assessments-phone">
              Text or Call <strong>352-802-2248</strong>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AssessmentsContent;
