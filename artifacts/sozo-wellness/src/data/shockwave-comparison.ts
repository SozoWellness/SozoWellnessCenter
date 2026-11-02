export type Tech = {
  id: 'kinas' | 'radial' | 'focused' | 'regen';
  name: string; sub?: string; kind: string;
  image: string; imageAlt: string;
  technology: string; technologyNote: string;
  action: string; bestFor: string[]; how: string; sensation: string; thinkOf: string;
};

export const rowLabels = {
  technology: 'Technology', action: 'Primary action', bestFor: 'Best for',
  how: 'How it works', sensation: 'Treatment sensation', thinkOf: 'Best way to think of it',
} as const;

export const technologies: Tech[] = [
  {
    id: 'kinas', name: 'KINAS S-TO-R-Z', kind: 'Vibroacoustic',
    image: '/images/shockwave-comparison/kinas.webp', imageAlt: 'KINAS S-TO-R-Z handheld vibroacoustic device',
    technology: 'Vibroacoustic Frequency Technology (V-AFT™)', technologyNote: '',
    action: 'Neuromuscular stimulation and cellular activation through sound waves',
    bestFor: ['Muscle tension & spasms', 'Nervous system balance', 'Chronic pain & sensitivity', 'Whole-body wellness', 'Cellular communication'],
    how: 'Delivers specific acoustic frequencies that stimulate cells and the nervous system, improve microcirculation, and support the body’s natural healing processes.',
    sensation: 'Gentle vibrations and sound. Very comfortable and relaxing.',
    thinkOf: 'Re-tunes the body and wakes up the cells.',
  },
  {
    id: 'radial', name: 'Radial Shockwave', kind: 'Mechanical',
    image: '/images/shockwave-comparison/radial.webp', imageAlt: 'Radial shockwave handheld applicator',
    technology: 'Radial Pressure Wave', technologyNote: 'Pneumatic / Electrohydraulic',
    action: 'Mechanical stimulation to break up tissue and jump-start healing',
    bestFor: ['Tendon injuries', 'Plantar fasciitis', 'Tennis elbow', 'Shoulder pain', 'Shin splints', 'Muscle attachment pain'],
    how: 'Sends high-energy waves from the applicator head that spread out in a radial pattern, stimulating blood flow, breaking up scar tissue, and triggering repair.',
    sensation: 'Moderate to strong tapping sensation. May feel sore during treatment.',
    thinkOf: 'Loosens tight tissue and breaks up roadblocks.',
  },
  {
    id: 'focused', name: 'Focused Shockwave', kind: 'Mechanical',
    image: '/images/shockwave-comparison/focused.webp', imageAlt: 'Focused shockwave handheld applicator',
    technology: 'Focused Pressure Wave', technologyNote: 'Electrohydraulic / Piezoelectric',
    action: 'Precise, deep tissue stimulation and targeted mechanical effect',
    bestFor: ['Deep tendon disorders', 'Bone healing', 'Non-healing fractures', 'Calcific shoulder', 'Chronic soft tissue injuries', 'Erectile dysfunction'],
    how: 'High-energy waves are focused to a specific depth and area, creating a stronger mechanical effect at the target while sparing the tissue around it.',
    sensation: 'Moderate to strong. May feel deep pressure or tapping at the target.',
    thinkOf: 'A precisely aimed tool that goes deep.',
  },
  {
    id: 'regen', name: 'ReGen RCT®', sub: 'Regenerative Cellular Technology', kind: 'Biological',
    image: '/images/shockwave-comparison/regen.webp', imageAlt: 'ReGen RCT tabletop console with touchscreen',
    technology: 'Rapid Pressure Pulse', technologyNote: 'Non-Invasive Regenerative Technology',
    action: 'Cellular stimulation and biological activation for regeneration and healing',
    bestFor: ['Chronic inflammation', 'Joint degeneration / arthritis', 'Neuropathy', 'Soft tissue injuries', 'Wound healing', 'Post-surgical recovery', 'Bone & tissue repair support', 'Chronic pain'],
    how: 'Delivers very fast pressure pulses that stimulate cell signaling, increase circulation, activate growth factors, recruit stem cells, and promote tissue regeneration.',
    sensation: 'Gentle, comfortable pressure pulses. Most patients relax.',
    thinkOf: 'Sends a wake-up call to the body’s healing and regeneration systems.',
  },
];

export const togetherBenefits = [
  'Reduce pain and inflammation', 'Improve circulation', 'Break up scar tissue', 'Stimulate tissue repair',
  'Support cellular regeneration', 'Improve mobility and function', 'Enhance overall wellness', 'Encourage the body’s natural healing processes',
];

export const approachServices = [
  'Chiropractic Care', 'Kinas S-to-R-Z', 'Radial & Focused Shockwave', 'ReGen RCT®', 'Hyperbaric Oxygen', 'Red Light Therapy', 'TheraWellness Vibroacoustic Therapy',
];
