import { Link } from 'wouter';
import { ArrowRight, Brain, Heart, Sparkles, Wind } from 'lucide-react';
import './whole-person-wellness.css';

const dimensions = [
  {
    title: 'Mental wellness',
    icon: Brain,
    text: 'Your thoughts, habits and the patterns behind your choices shape how you experience each day. We make room to notice those patterns with curiosity, consider a fresh perspective and choose practical next steps that reflect what matters to you.',
  },
  {
    title: 'Physical wellness',
    icon: Wind,
    text: 'Moving comfortably, having energy for daily life and making time for rest and recovery all matter. We help you explore assessments and body-focused therapies in the context of your routines, priorities and personal wellness goals.',
  },
  {
    title: 'Emotional wellness',
    icon: Heart,
    text: 'How you feel emotionally is part of your wellness—not separate from it. Stress, life changes and everyday demands deserve space in the conversation. We begin with compassionate listening and a supportive environment where you can feel heard, ask questions and take the next step at your own pace.',
  },
  {
    title: 'Spiritual wellness',
    icon: Sparkles,
    text: 'Feeling whole also includes meaning, purpose and connection. We honor the beliefs and values you bring to your wellness journey, making room for reflection, hope and the things that give your life meaning. Your spiritual well-being is personal, and your choices remain yours.',
  },
];

export function WholePersonWellness() {
  return (
    <section id="whole-person-wellness" className="section whole-person" aria-labelledby="whole-person-heading">
      <div className="container">
        <header className="whole-person-intro">
          <span className="eyebrow">Wellness from the root</span>
          <h2 id="whole-person-heading" className="section-title serif">Whole-person wellness means seeing all of you.</h2>
          <p className="section-intro">We are whole life wellness coaches. Your mental, emotional, physical and spiritual well-being are connected, and we care for wellness from the root. That is why our approach starts with you as a person—your experiences, your hopes and the life you want to live—not simply a list of services.</p>
        </header>
        <div className="whole-person-grid">
          {dimensions.map(({ title, icon: Icon, text }) => (
            <article className="whole-person-dimension" key={title}>
              <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
              <h3 className="serif">{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="whole-person-integrative">
          <div>
            <span className="eyebrow">Our integrative care approach</span>
            <h3 className="serif">Modern technology. Holistic principles. Personal attention.</h3>
          </div>
          <div>
            <p>We bring personalized wellness assessments and advanced therapies together with a holistic view of your daily life. We listen to what you are experiencing, consider your goals and explain the options that may fit—rather than assuming one service is the answer for everyone.</p>
            <p>Our wellness approach makes room for the medical care you already receive and the habits that support you between visits. Compassion, integrity, innovation and empowerment guide the process, with your questions and choices at the center.</p>
            <div className="whole-person-actions">
              <Link href="/services/whole-life-coaching" className="btn btn-primary" data-testid="link-about-coaching">Whole life wellness coaching <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link href="/services/assessments" className="btn btn-outline" data-testid="link-whole-person-assessments">Explore our assessments <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
