// Based on the three methods featured in SOZO's supplied ozone posters.
// The broader protocol reference is not a verified list of SOZO procedures.
// Do not reproduce dosing tables, self-treatment instructions, disease-treatment
// claims, or the supplied IV-session illustration on this three-method page.
export const ozoneTherapyDetails = {
  eyebrow: 'Ozone Therapy',
  title: 'Ozone Therapy. Start with an informed conversation.',
  intro: 'Explore Ozone Therapy at SOZO, including rectal insufflation, ear insufflation and ozonated water. Our team can explain the different approaches, answer your questions and discuss suitability before you decide whether to proceed.',
  availability: 'Contact SOZO to discuss the available options, practitioner oversight, appointment details and suitability before booking.',
  overview: {
    title: 'Understand the options. Ask the questions that matter.',
    text: 'Ozone Therapy describes several different approaches—not one standard session. Understanding the specific method, its risks, the evidence and who will provide it is an important part of an informed decision.',
  },
  heading: 'What is ozone—and how is it different from oxygen therapy?',
  paragraphs: [
    'Ozone (O₃) is a reactive gas made of three oxygen atoms. The oxygen we normally breathe is O₂. Ozone Therapy is not the same as breathing supplemental oxygen or taking part in a hyperbaric oxygen chamber session.',
    'SOZO’s materials describe three approaches: rectal insufflation, ear insufflation and ozonated water. The descriptions below explain what those names mean, rather than provide instructions for using ozone yourself.',
    'These alternative uses have limited clinical evidence and are not established treatments for cancer, infections or other diseases. Claims of detoxification, immune stimulation or tissue regeneration should not be treated as proven benefits. Ozone Therapy does not replace appropriate medical evaluation or evidence-based treatment.',
  ],
  information: [
    {
      title: 'Rectal insufflation',
      text: 'This method involves introducing an ozone-containing gas mixture into the rectum using a catheter. It is not an inhaled treatment. Ask the practitioner about the evidence, possible irritation or discomfort, risks and whether this approach is appropriate for you.',
    },
    {
      title: 'Ear insufflation',
      text: 'This approach uses an ear applicator to deliver an ozone-containing gas mixture near the ears. It should not be described as a proven treatment for ear infections, sinus conditions or neurological concerns. Discuss ear health, potential irritation and the risk of unintended inhalation with a qualified clinician.',
    },
    {
      title: 'Ozonated water',
      text: 'Ozonated water is water that has been treated with ozone. SOZO’s materials include it as an option to discuss with the team. This is not evidence that drinking it detoxifies the body, treats gut infections or improves systemic oxygen delivery. Ask about preparation, handling, risks and suitability before use.',
    },
    {
      title: 'Important safety information',
      text: 'Do not inhale ozone. Ozone exposure can irritate and damage the lungs. These approaches are not risk-free, and the risks differ by method. Review your health history, medications, pregnancy status and any ongoing symptoms with a qualified, licensed medical professional before considering ozone services. Do not stop prescribed treatment or delay medical care.',
    },
    {
      title: 'Before your visit',
      text: 'Call SOZO to ask which option is being considered, who provides it, what qualifications and oversight apply, what alternatives exist and what risks to expect. Our team can confirm pricing, session length and preparation requirements. These details are discussed individually rather than assumed from a general protocol chart.',
    },
  ],
  blocks: [
    { title: 'Know the method', text: 'Clarify exactly which approach is being discussed and how it differs from other ozone services.' },
    { title: 'Discuss evidence and risks', text: 'Ask what is known, what remains uncertain and how that applies to your personal health history.' },
    { title: 'Choose with professional guidance', text: 'Discuss suitability with a qualified clinician and continue the medical care you need.' },
  ],
  image: '/images/clinic/ozone-equipment.webp',
  imageAlt: 'SimplyO₃ ozone generator with tubing and a collection bag, from the equipment photo supplied by SOZO',
  imageFit: 'contain' as const,
  imageAspectRatio: '1 / 1',
};
