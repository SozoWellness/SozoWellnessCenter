// Package details supplied via SOZO's existing packages page.
// Preserve the listed prices/offers independently; do not derive a new discount
// from the retail value or invent package terms, expiry dates or eligibility.
export type WellnessPackage = {
  id: string;
  name: string;
  price: string;
  retailValue: string;
  items: string[];
  offer?: string;
  frequency?: string;
};

export type PackageGroup = {
  id: string;
  title: string;
  subtitle: string;
  comingSoon?: boolean;
  service?: { label: string; href: string };
  description?: string;
  packages: WellnessPackage[];
};

export const packageGroups: PackageGroup[] = [
  {
    id: 'pain-solutions',
    title: 'Pain Solutions',
    subtitle: 'Pain Relief & Structural Reset',
    service: { label: 'Explore shockwave therapy', href: '/services/shockwave' },
    packages: [
      { id: 'pain-a', name: 'Pain Package A', price: '$400', retailValue: '$750', items: ['5 shockwave therapy sessions'], offer: 'Buy 4, get 1 free', frequency: '1 session per week' },
      { id: 'pain-b', name: 'Pain Package B', price: '$800', retailValue: '$1,500', items: ['10 shockwave therapy sessions'], offer: 'Buy 8, get 2 free', frequency: '2 sessions per week' },
      { id: 'pain-c', name: 'Pain Package C', price: '$1,200', retailValue: '$2,250', items: ['15 shockwave therapy sessions'], offer: 'Buy 12, get 3 free', frequency: '2 sessions per week' },
    ],
  },
  {
    id: 'brain-health',
    title: 'Brain Health',
    subtitle: 'Brain Performance & Neuro Reset',
    comingSoon: true,
    packages: [
      {
        id: 'brain-mapping',
        name: 'Brain Mapping Package',
        price: '$1,500',
        retailValue: '$3,000',
        items: [
          'QEEG initial brain scan — retail value per scan: $500',
          '20 brain mapping therapy sessions — retail value: $100 per session',
          'QEEG post brain scan',
        ],
      },
    ],
  },
  {
    id: 'energy-balance',
    title: 'Energy Balance',
    subtitle: 'Energetic Rebalancing & Detox',
    service: { label: 'Explore TheraWellness', href: '/services/therawellness' },
    packages: [
      {
        id: 'therawellness-standard',
        name: 'TheraWellness Standard Package',
        price: '$600',
        retailValue: '$1,000',
        items: ['Vitalyzer pre-assessment', '4 TheraWellness therapy sessions', 'Vitalyzer post-assessment'],
        frequency: '1 session per week',
      },
      {
        id: 'therawellness-boost',
        name: 'TheraWellness Boost Package',
        price: '$1,000',
        retailValue: '$1,600',
        items: ['Vitalyzer pre-assessment', '8 TheraWellness therapy sessions', 'Vitalyzer post-assessment'],
        frequency: '1 session per week',
      },
    ],
  },
  {
    id: 'oxygen-healing',
    title: 'Oxygen Healing',
    subtitle: 'Oxygenation & Regeneration',
    service: { label: 'Explore hyperbaric oxygen', href: '/services/hyperbaric-oxygen' },
    packages: [
      { id: 'hbot-a', name: 'HBOT Package A', price: '$1,000', retailValue: '$2,000', items: ['10 HBOT sessions', 'No additional therapies'] },
      {
        id: 'hbot-b',
        name: 'HBOT Package B',
        price: '$2,000',
        retailValue: '$3,000',
        items: ['20 HBOT sessions', '1 free wellness therapy per visit', 'Choose from Foot Detox, Red Light, TheraBoots, EBO2, Oxygen, Ozone, or Vibration Plate'],
      },
      {
        id: 'hbot-c',
        name: 'HBOT Package C',
        price: '$3,000',
        retailValue: '$4,000',
        items: ['30 HBOT sessions', '2 free wellness therapies per visit', 'Choose from Foot Detox, Red Light, TheraBoots, EBO2, Oxygen, Ozone, or Vibration Plate'],
      },
    ],
  },
  {
    id: 'customize-your-care',
    title: 'Customize Your Care',
    subtitle: 'A Fully Personalized Package',
    description: 'Let our SOZO Wellness team work with you to customize your care with a personalized package.',
    packages: [
      { id: 'custom', name: 'Custom Package', price: '$3,000–$15,000', retailValue: '$4,000–$18,000', items: ['Stem Cell Treatments', 'EBO2', 'Peptides'] },
    ],
  },
];
