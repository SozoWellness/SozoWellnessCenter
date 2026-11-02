import brainHealth from './articles/brain-health-neuralchek.md?raw';
import recovery from './articles/time-to-recover.md?raw';
import vitalyzer from './articles/vitalyzer-first-look.md?raw';
import liveBlood from './articles/live-blood-up-close.md?raw';
import rife from './articles/first-rife-session.md?raw';
import thera from './articles/make-room-to-recharge.md?raw';
import starting from './articles/energy-medicine-start.md?raw';

export const wellnessArticles = [
  {
    slug: 'brain-health-neuralchek', markdown: brainHealth,
    excerpt: 'Explore the brain–body connection, everyday habits for mental clarity and how NeuralChek adds context to a conversation about stress and recovery.',
    image: '/images/clinic/neuralchek-assessment.webp',
    imageAlt: 'A practitioner guiding a visitor through a NeuralChek assessment',
  },
  {
    slug: 'are-you-giving-yourself-time-to-recover', markdown: recovery,
    excerpt: 'Make room for recovery without giving up the activities you love. Explore your daily patterns and where a NeuralChek assessment fits.',
    image: '/images/waiting-area.jpg',
    imageAlt: 'A quiet seating area at SOZO, illustrating making space to pause and recover',
  },
  {
    slug: 'vitalyzer-assessment-first-look', markdown: vitalyzer,
    excerpt: 'See what happens during a Vitalyzer assessment, how its visual energetic report is discussed and which questions to bring.',
    image: '/images/clinic/vitalyzer-assessment.webp',
    imageAlt: 'A practitioner using a handheld Vitalyzer sensor during an assessment',
  },
  {
    slug: 'live-blood-analysis-up-close', markdown: liveBlood,
    excerpt: 'From a small sample to a live image: explore the microscopy experience and how it differs from a laboratory blood test.',
    image: '/images/clinic/live-blood-review.webp',
    imageAlt: 'A practitioner and visitor reviewing live-blood images on a monitor beside a microscope',
  },
  {
    slug: 'your-first-rife-session', markdown: rife,
    excerpt: 'Curious about frequency therapy? Learn what to ask, how our guided mat-based sessions work and what to expect at SOZO.',
    image: '/images/clinic/rife-session.webp',
    imageAlt: 'The mat-based Rife frequency therapy setting at SOZO',
  },
  {
    slug: 'make-room-to-recharge-therawellness', markdown: thera,
    excerpt: 'Explore TheraWellness as a personalized, non-invasive wellness experience and make space for relaxation, balance and your own goals.',
    image: '/images/clinic/therawellness-session.webp',
    imageAlt: 'The TheraWellness session setting',
  },
  {
    slug: 'energy-medicine-where-to-start', markdown: starting,
    excerpt: 'Understand the difference between assessments and therapies, compare SOZO’s approaches and find a clear starting point for your wellness.',
    image: '/images/inside-sozo.jpg',
    imageAlt: 'Inside SOZO Wellness Center',
  },
];
