// The owner's revised task list and explicit public-price approval are the source.
// Edit this catalog through Replit, review the preview, then approve a push.
// Staff have not finalized service eligibility, redemption, expiration or sharing.
// Do not infer those rules or reuse the superseded service-specific packages.

export type FreedomPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
};

export const freedomPackages: FreedomPackage[] = [
  {
    id: 'freedom-6',
    name: 'Freedom Package — 6 Credits',
    credits: 6,
    price: 600,
    description: 'A starting point for making time for your wellness.',
  },
  {
    id: 'freedom-12',
    name: 'Freedom Package — 12 Credits',
    credits: 12,
    price: 1000,
    description: 'Make room for regular sessions with guidance from our team.',
  },
  {
    id: 'freedom-22',
    name: 'Freedom Package — 22 Credits',
    credits: 22,
    price: 1800,
    description: 'Plan a series of visits around your personal wellness goals.',
  },
  {
    id: 'freedom-36',
    name: 'Freedom Package — 36 Credits',
    credits: 36,
    price: 2800,
    description: 'Support a longer-term wellness routine with a larger wellness credit package.',
  },
];

export const painPackages: FreedomPackage[] = [
  {
    id: 'pain-5',
    name: 'Pain Package — 5 Credits',
    credits: 5,
    price: 400,
    description: 'A focused starting point with guidance for your personal wellness goals.',
  },
  {
    id: 'pain-10',
    name: 'Pain Package — 10 Credits',
    credits: 10,
    price: 800,
    description: 'More wellness credits to support your personalized plan.',
  },
];

export const packagePolicy = {
  summary: 'Choose a wellness credit package with personal guidance from our team.',
  termsNote: 'Our team will confirm how wellness credits apply to your selected services and explain the package terms before you decide.',
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
  { id: 'red-light-therapy', name: 'Red Light Therapy', href: '/services/red-light-therapy' },
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
