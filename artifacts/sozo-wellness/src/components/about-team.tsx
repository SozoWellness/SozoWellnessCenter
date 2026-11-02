import { teamMembers, teamIntroduction } from '../data/team';
import { Link } from 'wouter';
import './about-team.css';

export function AboutTeam() {
  return (
    <section id="team" className="team-section" aria-labelledby="team-heading" data-testid="section-team">
      <div className="container">
        <header className="team-header">
          <div>
            <span className="eyebrow">Meet Our Team</span>
            <h2 id="team-heading" className="serif team-title">The people who <em>welcome you in.</em></h2>
          </div>
          <p className="team-intro">{teamIntroduction}</p>
        </header>

        <ul className="team-grid" role="list">
          {teamMembers.map((m) => (
            <li key={m.id} className="team-card" data-testid={`card-team-${m.id}`}>
              {m.profileHref ? (
                <Link href={m.profileHref} className="team-photo team-profile-link" aria-label={`Meet ${m.name}`} data-testid={`link-team-photo-${m.id}`}>
                  <img src={m.image} alt={`Portrait of ${m.name}`} width="686" height="960" loading="lazy" decoding="async" />
                </Link>
              ) : (
                <div className="team-photo">
                  <img src={m.image} alt={`Portrait of ${m.name}`} width="686" height="960" loading="lazy" decoding="async" />
                </div>
              )}
              <h3 className="serif team-name">{m.profileHref ? (
                <Link href={m.profileHref} className="team-name-link" data-testid={`link-team-name-${m.id}`}>{m.name}</Link>
              ) : m.name}</h3>
              <p className="team-role">{m.role}</p>
              {m.practiceNote && <p className="team-practice-note">{m.practiceNote}</p>}
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}

export default AboutTeam;
