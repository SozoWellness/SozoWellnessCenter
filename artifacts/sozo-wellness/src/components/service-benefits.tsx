import { BedDouble, Compass, HeartHandshake, Leaf, MessageCircleQuestion, Footprints, Waves, Activity, Sparkles, Info, Wind, ClipboardList, type LucideIcon } from 'lucide-react';

type Block = { title: string; text: string };
type Group = { label: string; intro: string; from: number; to?: number; icons: LucideIcon[] };

const configs: Record<string, Group[]> = {
  '/services/wolfe-non-surgical-bodywork': [
    { label: 'Benefits to explore with Wolfe Non-Surgical Bodywork.', intro: 'Focused hands-on care with your comfort, flexibility and movement goals in mind.', from: 0, to: 3, icons: [Footprints, Activity, HeartHandshake] },
    { label: 'Know what to expect.', intro: 'Understand the technique and talk through suitability before your session.', from: 3, icons: [Info, ClipboardList, Compass] },
  ],
  '/services/cardio-medbed': [
    { label: 'Potential benefits of Cardio MedBed EECP.', intro: 'Heart health and circulation are connected. Explore the ways EECP is designed to support both.', from: 0, to: 6, icons: [HeartHandshake, Wind, Activity, Waves, Leaf, Sparkles] },
    { label: 'What to expect from EECP.', intro: 'Understand the session experience and the health review that comes before treatment.', from: 6, icons: [BedDouble, ClipboardList] },
  ],
  '/services/therawellness': [{
    label: 'Benefits of your TheraWellness session.',
    intro: 'Make room for relaxation, mental calm and a sense of balance—with guidance built around your goals.',
    from: 0, icons: [Leaf, Wind, Compass, BedDouble, HeartHandshake],
  }],
  '/services/rife': [
    {
      label: 'Benefits of your Rife session.',
      intro: 'Selected electromagnetic frequencies, a noninvasive format and attention to the whole person—not just another appointment.',
      from: 0, to: 3, icons: [BedDouble, HeartHandshake, Compass],
    },
    {
      label: 'Know what to expect.',
      intro: 'We’ll walk you through the session before you begin.',
      from: 3, icons: [ClipboardList],
    },
  ],
  '/services/shockwave': [
    { label: 'Two approaches. One personal plan.', intro: 'We offer Radial ESWT and CellSonic ESWT. Our team discusses which approach fits your area of concern.', from: 0, to: 2, icons: [Waves, Activity] },
    { label: 'Move toward more comfortable days.',
      intro: 'Explore potential benefits for selected tendon and soft-tissue conditions. An assessment helps determine whether treatment is right for you.',
      from: 2, to: 5, icons: [Sparkles, Activity, Footprints] },
    { label: 'Know what to expect.', intro: 'Understand the experience before you begin.', from: 5, icons: [Info] },
  ],
  '/services/hyperbaric-oxygen': [
    {
      label: 'Why oxygen matters for recovery.',
      intro: 'Oxygen availability, natural repair and cellular energy: three connected reasons to put oxygen at the center of the conversation.',
      from: 0, to: 3, icons: [Wind, Sparkles, HeartHandshake],
    },
    {
      label: 'Built around your well-being.',
      intro: 'A comfortable setting, a personal conversation and guidance throughout your session.',
      from: 3, icons: [Wind, MessageCircleQuestion, ClipboardList, Info, HeartHandshake],
    },
  ],
};

const clean = (t: string) => { const s = t.replace(/^Potential benefit:\s*/i, ''); return s.charAt(0).toUpperCase() + s.slice(1); };

export function ServiceBenefits({ path, blocks }: { path: string; blocks: Block[] }) {
  const groups = configs[path] || [{ label: 'Highlights', intro: '', from: 0, to: blocks.length, icons: [Sparkles] }];
  return <div className="benefits">
    {groups.map(g => {
      const items = blocks.slice(g.from, g.to);
      if (!items.length) return null;
      return <section className="benefit-group" key={g.label} aria-label={g.label}>
        <header className="benefit-head"><h3>{g.label}</h3><p>{g.intro}</p></header>
        <ul className={`benefit-list ${items.length === 1 ? 'single' : ''}`}>
          {items.map((b, i) => { const Icon = g.icons[i % g.icons.length]; return <li className="benefit-card" key={b.title}>
            <span className="benefit-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.5} /></span>
            <div><h4>{clean(b.title)}</h4><p>{b.text}</p></div>
          </li>; })}
        </ul>
      </section>;
    })}
  </div>;
}
