export type Partner = {
  id: string;
  name: string;
  category: string;
  description: string;
  recommendation: string;
  image: string;
  imageAlt: string;
  href?: string;
  clinicOnly?: boolean;
};

// Images and recommendation context: SOZO's existing Products and Partners page.
// Preserve referral identifiers in outbound URLs; do not replace them with homepages.
export const partners: Partner[] = [
  {
    id: 'anti-aging-bed', name: 'AntiAging Bed', category: 'Rest & recovery',
    description: 'Wellness-focused sleep systems, including a biohacking mattress and specialized bed cover, designed around comfort and relaxation.',
    recommendation: 'We recommend exploring AntiAging Bed because quality rest is a foundation of our whole-person approach to recovery and everyday well-being.',
    image: '/images/partners/anti-aging-bed.jpg', imageAlt: 'AntiAging Bed wellness bed experience',
    href: 'https://antiagingbed.com/sozowellness',
  },
  {
    id: 'asea', name: 'ASEA', category: 'Cellular wellness',
    description: 'Redox-focused supplements and topical products developed around cellular wellness, vitality and healthy aging.',
    recommendation: 'We include ASEA for people interested in cellular wellness as part of a broader, inside-out approach to feeling their best.',
    image: '/images/partners/asea.jpg', imageAlt: 'ASEA wellness products',
    href: 'https://aseaglobal.com/Darcelle',
  },
  {
    id: 'braintap', name: 'BrainTap', category: 'Mind & relaxation',
    description: 'Guided audio and light-based technology designed to support relaxation, focus, mental clarity and restorative rest.',
    recommendation: 'We recommend BrainTap as an option for building intentional relaxation and mind-body wellness into your daily routine.',
    image: '/images/clinic/braintap-session.webp', imageAlt: 'A seated visitor relaxing with a BrainTap headset',
    href: 'https://braintap.com/?afmc=7my&utm_campaign=7my&utm_source=leaddyno&utm_medium=affiliate',
  },
  {
    id: 'centropix', name: 'CENTROPIX', category: 'Frequency wellness',
    description: 'Frequency and pulsed electromagnetic field (PEMF) wellness technologies designed around balance, recovery and vitality.',
    recommendation: 'We recommend exploring CENTROPIX if you are interested in technology-based wellness tools that complement a holistic routine.',
    image: '/images/partners/centropix.jpg', imageAlt: 'CENTROPIX KLOUD wellness system',
    // The supplied backoffice.centropix.com/Darcelle returns 404.
    // This is the public affiliate destination already linked on SOZO's current site.
    href: 'https://www.centropix.us/sozo/en',
  },
  {
    id: 'doc-of-detox', name: 'DOC OF DETOX', category: 'Whole-person wellness',
    description: 'Wellness education, self-care resources, nutritional products and personal development tools for a proactive approach to well-being.',
    recommendation: 'As a Certified DODPowerPack Clinic, we value Doc of Detox’s emphasis on education, self-care and taking an active role in your wellness.',
    image: '/images/partners/doc-of-detox.jpg', imageAlt: 'Doc of Detox Ultimate Energy Kit',
    href: 'https://DOD.Live/DarcelleBurandt',
  },
  {
    id: 'frequense', name: 'FREQUENSE', category: 'Everyday nutrition',
    description: 'Nutritional formulations that combine premium ingredients with frequency-focused concepts, including minerals, collagen, mushrooms and nootropics.',
    recommendation: 'We include Frequense for its range of options aimed at everyday nourishment, hydration and vitality within a personalized wellness routine.',
    image: '/images/partners/frequense.jpg', imageAlt: 'Frequense Rise nutritional product',
    href: 'https://frequense.com/SozoWellness',
  },
  {
    id: 'h-wave', name: 'H-WAVE', category: 'Recovery & mobility',
    description: 'Electrical stimulation technology designed to support pain management, recovery and physical function without medication.',
    recommendation: 'We recommend discussing H-Wave with our team if you are exploring non-invasive support for comfort and mobility. Purchase directly through SOZO.',
    image: '/images/clinic/h-wave-session.webp', imageAlt: 'A reclining visitor during an H-Wave session, with the device beside the chair',
    clinicOnly: true,
  },
  {
    id: 'microdaily', name: 'MICRO-DAILY / ENGAGE', category: 'Foundational nutrition',
    description: 'Micronutrient formulations focused on nutritional support, cellular health and overall wellness.',
    recommendation: 'We recommend exploring MicroDaily because foundational nutrition complements our focus on whole-body wellness and long-term vitality.',
    image: '/images/partners/microdaily.jpg', imageAlt: 'MicroDaily nutritional products from Engage Global',
    href: 'https://microdaily.com/DarcelleBurandt5356',
  },
  {
    id: 'purium', name: 'PURIUM', category: 'Plant-based nutrition',
    description: 'Plant-based superfoods, supplements and lifestyle programs centered on whole-food nutrition and healthy habits.',
    recommendation: 'We recommend Purium for people looking to bring nutrient-dense, plant-based options into a proactive approach to everyday well-being.',
    image: '/images/partners/purium.jpg', imageAlt: 'Purium plant-based nutrition bundle',
    href: 'https://ishoppurium.com/SOZO',
  },
  {
    id: 'zinzino', name: 'SANKI – ZINZINO', category: 'Personalized nutrition',
    description: 'Personalized nutrition, omega-based products and testing programs focused on essential fatty acid balance and individual nutritional needs.',
    recommendation: 'We recommend exploring Zinzino for its emphasis on understanding your nutritional needs and making informed, personalized wellness choices.',
    image: '/images/partners/zinzino.jpg', imageAlt: 'Zinzino nutritional products',
    href: 'https://zinzino.com/2020928615',
  },
  {
    id: 'theon-global', name: 'Theon Global', category: 'Targeted nutrition',
    description: 'Nutritional products including fulvic and humic minerals, turmeric, superfood blends and black seed oil.',
    recommendation: 'We include Theon Global for its nature-inspired formulations and focus on whole-body wellness, giving you more options to discuss around your goals.',
    image: '/images/partners/theon-global.jpg', imageAlt: 'Theon Global fulvic mineral product',
    href: 'https://theonglobal.com/?ref=sozo',
  },
];
