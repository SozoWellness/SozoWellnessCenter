// The owner's revised task list and explicit public-price approval are the source.
// Edit this catalog through Replit, review the preview, then approve a push.
// Staff have not finalized service eligibility, redemption, expiration or sharing.
// Do not infer those rules or reuse the superseded service-specific packages.

export type FreedomPackage = {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
};

export const freedomPackages: FreedomPackage[] = [
  {
    id: 'freedom-6',
    name: 'Freedom Package — 6 Sessions',
    sessions: 6,
    price: 600,
    description: 'A starting point for making time for your wellness.',
  },
  {
    id: 'freedom-12',
    name: 'Freedom Package — 12 Sessions',
    sessions: 12,
    price: 1000,
    description: 'Make room for regular sessions with guidance from our team.',
  },
  {
    id: 'freedom-22',
    name: 'Freedom Package — 22 Sessions',
    sessions: 22,
    price: 1800,
    description: 'Plan a series of visits around your personal wellness goals.',
  },
  {
    id: 'freedom-36',
    name: 'Freedom Package — 36 Sessions',
    sessions: 36,
    price: 2800,
    description: 'Support a longer-term wellness routine with a larger session package.',
  },
];

export const painPackage = {
  id: 'pain-5',
  name: 'Pain Package',
  sessions: 5,
  price: 400,
  description: 'Talk with our team about your goals and the sessions included in this package.',
};

export const packagePolicy = {
  summary: 'Choose a session package with personal guidance from our team.',
  termsNote: 'Before you decide, our team will confirm which services are included, how your selected sessions apply, and the package terms.',
};

export const circulationProgram = {
  id: 'circulation-vitality',
  name: 'SOZO Circulation & Vitality Program',
  subtitle: '30-Visit Circulation & Oxygen Intensive',
  price: 5000,
  regularPrice: 6000,
  visits: 30,
  weeks: 6,
  visitsPerWeek: 5,
  sessionMinutes: 60,
  therapies: ['Hyperbaric Oxygen Chamber', 'Cardio MedBed'],
  schedule: 'Weekends excluded.',
  pricingNote: 'This program has its own listed price. Our team can explain the details and discuss how it fits your wellness plan.',
};

export type WellnessService = { id: string; name: string; href?: string; aliases?: string[] };

export const wellnessServices: WellnessService[] = [
  { id: 'hyperbaric-oxygen', name: 'Hyperbaric Oxygen Therapy (HBOT)', href: '/services/hyperbaric-oxygen', aliases: ['Hyperbaric Oxygen'] },
  { id: 'cardio-medbed', name: 'Cardio MedBed (EECP)', href: '/services/cardio-medbed', aliases: ['Cardio MedBed'] },
  { id: 'core-restore', name: 'Core Restore' },
  { id: 'rife-frequency', name: 'Rife Frequency', href: '/services/rife' },
  { id: 'cellsonic', name: 'CellSonic', href: '/services/shockwave' },
  { id: 'therawellness', name: 'TheraWellness', href: '/services/therawellness' },
  { id: 'ozone-therapy', name: 'Ozone Therapy' },
  { id: 'red-light-therapy', name: 'Red Light Therapy' },
  { id: 'pemf-therapy', name: 'PEMF Therapy', aliases: ['OLY Life PEMF'] },
  { id: 'focused-shockwave', name: 'Focused Shockwave Therapy', href: '/services/shockwave', aliases: ['Focused Shockwave'] },
];

export type WellnessPathway = { id: string; title: string; services: string[] };

export const wellnessPathways: WellnessPathway[] = [
  {
    id: 'sexual-health-hormone-balance',
    title: 'Sexual Health & Hormone Balance',
    services: ['Core Restore', 'Rife Frequency', 'Ozone Therapy', 'Red Light Therapy', 'OLY Life PEMF', 'TheraWellness'],
  },
  {
    id: 'brain-health-mental-clarity',
    title: 'Brain Health & Mental Clarity',
    services: ['Hyperbaric Oxygen', 'TheraWellness', 'Rife Frequency', 'Red Light Therapy', 'OLY Life PEMF', 'Core Restore'],
  },
  {
    id: 'cancer-support-immune-strength',
    title: 'Cancer Support & Immune Strength',
    services: ['Rife Frequency', 'TheraWellness', 'Hyperbaric Oxygen', 'Core Restore', 'Red Light Therapy', 'OLY Life PEMF'],
  },
  {
    id: 'pain-recovery',
    title: 'Pain & Recovery',
    services: ['Focused Shockwave', 'Hyperbaric Oxygen', 'OLY Life PEMF', 'Red Light Therapy', 'Core Restore', 'TheraWellness'],
  },
  {
    id: 'cardiovascular-health-circulation',
    title: 'Cardiovascular Health & Circulation',
    services: ['Cardio MedBed (EECP)', 'Hyperbaric Oxygen', 'Red Light Therapy', 'OLY Life PEMF', 'TheraWellness', 'Rife Frequency'],
  },
  {
    id: 'detox-lymphatic-support',
    title: 'Detox & Lymphatic Support',
    services: ['TheraWellness', 'Ozone Therapy', 'OLY Life PEMF', 'Red Light Therapy', 'Hyperbaric Oxygen', 'Rife Frequency'],
  },
  {
    id: 'energetic-balancing-stress-relief',
    title: 'Energetic Balancing & Stress Relief',
    services: ['TheraWellness', 'Rife Frequency', 'Cardio MedBed', 'Red Light Therapy', 'OLY Life PEMF', 'Hyperbaric Oxygen'],
  },
  {
    id: 'athletic-performance-recovery',
    title: 'Athletic Performance & Recovery',
    services: ['Cardio MedBed', 'Hyperbaric Oxygen', 'Focused Shockwave', 'Red Light Therapy', 'OLY Life PEMF', 'Core Restore'],
  },
  {
    id: 'beauty-anti-aging-cellular-health',
    title: 'Beauty, Anti-Aging & Cellular Health',
    services: ['TheraWellness', 'Red Light Therapy', 'OLY Life PEMF', 'Hyperbaric Oxygen', 'Core Restore', 'Rife Frequency'],
  },
  {
    id: 'whole-body-wellness-longevity',
    title: 'Whole-Body Wellness & Longevity',
    services: ['Hyperbaric Oxygen', 'Cardio MedBed', 'TheraWellness', 'Red Light Therapy', 'OLY Life PEMF', 'Rife Frequency'],
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
