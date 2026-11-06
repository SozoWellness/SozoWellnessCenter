import { ASSESSMENT_CTA, getInquiryHref, type InquiryInterest } from '@/lib/inquiry';

export type DiscoveryService = { title: string; href: string; image: string; alt: string; text: string; interest: InquiryInterest; fit?: 'cover' | 'contain'; position?: string; status?: string };

export const discoveryServices: DiscoveryService[] = [
  { title: 'Wellness assessments', href: '/services/assessments', image: '/images/clinic/live-blood-review.webp', alt: 'A practitioner and visitor reviewing blood-cell images beside a microscope', text: 'Three ways to learn more about where you are: a bio-energetic report, heart rate variability readings or live blood microscopy.', interest: 'Wellness assessments' },
  { title: 'Hyperbaric oxygen', href: '/services/hyperbaric-oxygen', image: '/images/hyperbaric-chamber.png', alt: 'Two visitors seated inside the hyperbaric oxygen chamber', text: 'Recovery starts at the cellular level. Put oxygen-focused chamber sessions at the heart of a more intentional wellness routine.', interest: 'Hyperbaric oxygen' },
  { title: 'Shockwave therapy', href: '/services/shockwave', image: '/images/clinic/radial-shockwave-session.webp', alt: 'A practitioner applying radial shockwave therapy to a seated visitor’s lower leg', text: 'Radial ESWT and CellSonic ESWT for deeper pain concerns, comfort and movement.', interest: 'Shockwave therapy' },
  { title: 'Rife frequency', href: '/services/rife', image: '/images/clinic/rife-session.webp', alt: 'A visitor resting on a frequency mat in the Rife treatment room', text: 'Guided, mat-based electromagnetic frequency sessions offered as complementary wellness.', interest: 'Rife frequency' },
  { title: 'TheraWellness', href: '/services/therawellness', image: '/images/clinic/therawellness-session.webp', alt: 'A visitor lying comfortably during a TheraWellness session', text: 'Personalized, noninvasive wellness sessions focused on relaxation, balance and a calmer mind.', interest: 'TheraWellness' },
  { title: 'Cardio MedBed', href: '/services/cardio-medbed', image: '/images/clinic/cardio-medbed-lifestyle.webp', alt: 'A person resting on a Cardio MedBed with leg cuffs while a practitioner adjusts the controls', text: 'Explore noninvasive EECP for heart health, circulation and oxygen delivery.', interest: 'Cardio MedBed' },
  { title: 'Pulse / Red Light Therapy', href: '/services/red-light-therapy', image: '/images/clinic/red-light-session.webp', alt: 'A visitor resting during a Pulse / Red Light Therapy session', text: 'Noninvasive, personalized polychromatic light sessions with comfort, recovery and everyday well-being in mind.', interest: 'Wellness assessments' },
  { title: 'Foot Detox', href: '/services/foot-detox', image: '/images/clinic/foot-detox-session.webp', alt: 'The Foot Detox treatment room at SOZO with the AO Infinity device', text: 'A seated, noninvasive AO Infinity session with personal guidance and a quiet moment for you.', interest: 'Wellness assessments' },
];

export const goalCards = [
  { title: 'Find my starting point', text: 'Get a clearer picture of your wellness baseline before deciding what comes next.', service: 'Wellness assessments', href: '/services/assessments' },
  { title: 'Move with more ease', text: 'Explore supportive options for recovery, comfort and mobility.', service: 'Shockwave therapy', href: '/services/shockwave' },
  { title: 'Feel more in balance', text: 'Make room for a restorative pause and a more intentional routine.', service: 'TheraWellness', href: '/services/therawellness' },
  { title: 'Explore oxygen wellness', text: 'Learn what a chamber-based oxygen experience involves.', service: 'Hyperbaric oxygen', href: '/services/hyperbaric-oxygen' },
];

export const excerpts = [
  { quote: 'I feel so much better. My stamina has increased so much. I can still hit a wall, but it’s not debilitating. I can just rest.', name: 'Melody W.', context: 'After hyperbaric oxygen and other treatments at SOZO. A personal experience, not a promise of results.' },
];

export const serviceHeroes: Record<string, { interest: InquiryInterest; cta: string; highlights: string[] }> = {
  '/services/assessments': { interest: 'Wellness assessments', cta: ASSESSMENT_CTA, highlights: ['Vitalyzer bio-energetic report', 'NeuralChek heart rate variability readings', 'Live blood microscopy with a certified microscopist'] },
  '/services/hyperbaric-oxygen': { interest: 'Hyperbaric oxygen', cta: ASSESSMENT_CTA, highlights: ['Oxygen-focused wellness and recovery', 'A comfortable, guided chamber experience', 'Personal attention before and during your visit'] },
  '/services/shockwave': { interest: 'Shockwave therapy', cta: ASSESSMENT_CTA, highlights: ['Radial ESWT and CellSonic ESWT', 'For deeper pain concerns and movement', 'An assessment helps decide if it is right for you'] },
  '/services/rife': { interest: 'Rife frequency', cta: ASSESSMENT_CTA, highlights: ['Selected electromagnetic frequency programs', 'Noninvasive, mat-based sessions', 'Personal attention to your wellness goals'] },
  '/services/therawellness': { interest: 'TheraWellness', cta: ASSESSMENT_CTA, highlights: ['Noninvasive, personalized wellness', 'Relaxation, balance and mental calm', 'Guidance built around your goals'] },
  '/services/cardio-medbed': { interest: 'Cardio MedBed', cta: ASSESSMENT_CTA, highlights: ['Noninvasive external counterpulsation', 'Inflatable cuffs synchronized with your heartbeat', 'Designed to support heart and circulatory wellness'] },
  '/services/wolfe-non-surgical-bodywork': { interest: 'Wolfe Non-Surgical Bodywork', cta: ASSESSMENT_CTA, highlights: ['Targeted, hands-on deep tissue work', 'Focused on flexibility and comfortable movement', 'Your health history and comfort come first'] },
  '/services/red-light-therapy': { interest: 'Wellness assessments', cta: ASSESSMENT_CTA, highlights: ['Pulse Light, also known as Red Light Therapy', 'Neurocare Pro Platinum polychromatic light', 'Personalized, noninvasive and full-body capable'] },
  '/services/foot-detox': { interest: 'Wellness assessments', cta: ASSESSMENT_CTA, highlights: ['AO Infinity Foot Detox device', 'Seated, noninvasive and fully clothed', 'Suitability conversation before you book'] },
};
export { getInquiryHref };
