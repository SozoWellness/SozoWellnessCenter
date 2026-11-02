import { Link } from 'wouter';
import { privacyContact, privacyEffectiveDate, privacySections } from '@/data/privacy-policy';

export function PrivacyPolicy() {
  return <>
    <section className="page-hero">
      <div className="container">
        <span className="crumb"><Link href="/" data-testid="link-privacy-home">Home</Link> / Privacy Policy</span>
        <div style={{ marginTop: 32 }}><span className="eyebrow">Your privacy</span></div>
        <h1 className="serif">Privacy Policy</h1>
        <p>Our approach to website enquiries, personal information and your privacy choices.</p>
      </div>
    </section>
    <section className="section">
      <div className="container policy-content" data-testid="privacy-policy">
        <p data-testid="text-privacy-effective-date"><strong>Effective date:</strong> <time dateTime={privacyEffectiveDate}>October 6, 2026</time></p>
        <p>At SOZO Wellness Center, we respect your privacy. This policy explains how we handle information associated with our website, general enquiries and email communications.</p>
        {privacySections.map(section => <section className="policy-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>)}
        <section className="policy-section">
          <h2>12. Contact our privacy team</h2>
          <p>For questions about this policy or your personal information, contact:</p>
          <address>
            <strong>{privacyContact.name}</strong><br/>
            {privacyContact.address}<br/>
            <a href={privacyContact.telephone} data-testid="link-privacy-phone">{privacyContact.phone}</a><br/>
            <a href={`mailto:${privacyContact.email}`} data-testid="link-privacy-email">{privacyContact.email}</a>
          </address>
        </section>
      </div>
    </section>
  </>;
}
