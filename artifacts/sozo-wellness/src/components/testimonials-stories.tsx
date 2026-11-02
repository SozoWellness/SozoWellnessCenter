import { testimonials } from '../data/testimonials';
import './testimonials-stories.css';

export function TestimonialsStories() {
  return (
    <section className="ts-section" aria-labelledby="ts-heading">
      <div className="container">
        <h2 id="ts-heading" className="ts-heading serif">In their own words</h2>
        <ol className="ts-list">
          {testimonials.map((t, i) => (
            <li className="ts-item" key={t.id} data-testid={`story-${t.id}`}>
              <article className="ts-article" aria-labelledby={`ts-name-${t.id}`}>
                <header className="ts-head">
                  <span className="ts-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 id={`ts-name-${t.id}`} className="ts-name serif" data-testid={`text-name-${t.id}`}>{t.name}</h3>
                </header>
                <div className="ts-body">
                  {t.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default TestimonialsStories;
