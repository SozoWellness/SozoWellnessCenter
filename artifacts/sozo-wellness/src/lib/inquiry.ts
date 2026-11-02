export const ASSESSMENT_CTA = 'Book Your Assessment';

export const inquiryInterests = [
  'Wellness assessments',
  'Vitalyzer',
  'NeuralChek',
  'Live blood analysis',
  'Hyperbaric oxygen',
  'Shockwave therapy',
  'Rife frequency',
  'TheraWellness',
  'Cardio MedBed',
  'Wolfe Non-Surgical Bodywork',
] as const;

export type InquiryInterest = typeof inquiryInterests[number];

export function getInquiryHref(interest: InquiryInterest): string {
  return `/request-assessment?interest=${encodeURIComponent(interest)}`;
}

export function getInquiryInterest(search: string): InquiryInterest | '' {
  const interest = new URLSearchParams(search).get('interest');
  return inquiryInterests.find(option => option === interest) ?? '';
}
