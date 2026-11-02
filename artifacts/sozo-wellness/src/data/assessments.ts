// Adapted from the clinic's supplied assessment pages, focusing on the session
// process without presenting wellness observations as medical diagnoses.
export const assessmentDetails = {
  eyebrow: 'Wellness assessments',
  title: 'Start with a better understanding of you.',
  intro: 'Find a more personal starting point for your wellness plan. Explore Vitalyzer’s bio-energetic report, NeuralChek’s heart rate variability readings or a close-up microscope view of a blood sample—with our team there to explain what you see.',
  heading: 'Choose an assessment for the question you have.',
  paragraphs: [
    'These assessments do different things: a software-generated energetic report is not the same as measuring heart rate variability or viewing blood cells under a microscope. The right starting point depends on what you want to learn.',
    'Bring your goals and questions. We walk you through your assessment, explain the report or readings and help you consider practical next steps for your wellness routine.',
  ],
  blocks: [
    {
      title: 'Vitalyzer',
      image: '/images/clinic/vitalyzer-assessment.webp',
      imageAlt: 'A seated visitor having a Vitalyzer assessment with a handheld device',
      imagePosition: '75% center',
      text: 'Get a visual, bio-energetic report you can explore with our team. This noninvasive assessment gives your appointment a personalized starting point for reviewing wellness priorities and planning your next steps.',
      details: [
        {
          title: 'Why you might choose Vitalyzer',
          text: 'Choose Vitalyzer for an individualized bio-energetic report you can review with our team. Explore the areas highlighted by the software, discuss your wellness priorities and compare recorded patterns over time.',
        },
        {
          title: 'What the report covers',
          text: 'The software produces a visual report with categories for energetic imbalances, possible stressors, energetic physiology, emotions and foods. Our team can walk you through what the report highlights and discuss the questions it raises for your wellness goals.',
        },
        {
          title: 'How it can inform your next steps',
          text: 'The report may include food suggestions and recommendations drawn from a database of vitamins, minerals and other wellness products. We help you explore those suggestions in the context of your goals. Follow-up reports let you compare changes in the system’s recorded energetic patterns.',
        },
      ],
    },
    {
      title: 'NeuralChek',
      image: '/images/clinic/neuralchek-assessment.webp',
      imageAlt: 'A visitor seated with a practitioner during a NeuralChek assessment',
      text: 'NeuralChek is a quick, noninvasive assessment that uses heart rate variability (HRV) analysis to explore patterns related to autonomic nervous system balance, stress and recovery.',
      details: [
        {
          title: 'Why you might choose NeuralChek',
          text: 'Choose NeuralChek to establish a baseline HRV reading and take a closer look at patterns related to stress and recovery. Follow-up readings give you a point of comparison as you review your habits and wellness routine.',
        },
        {
          title: 'Understanding heart rate variability',
          text: 'HRV looks at the variation in time between heartbeats—not just how fast your heart is beating. These patterns offer a starting point for discussing how your body responds to everyday demands and the balance between activity and recovery.',
        },
        {
          title: 'What happens during the assessment',
          text: 'Sensors are placed on your body to collect readings, which the software organizes into a report. Our team explains the measurements and discusses how they may inform a personalized wellness plan. Bring your questions about stress, rest and recovery so the conversation reflects what matters to you.',
        },
      ],
    },
    {
      title: 'Live blood analysis',
      image: '/images/clinic/live-blood-session.webp',
      imageAlt: 'A practitioner and visitor beside a microscope and live-blood image display',
      imageFit: 'contain' as const,
      text: 'This assessment allows real-time visualization of your blood cells. With high-resolution imaging, you can explore what you see with our team as part of a personalized wellness conversation. Live blood viewing cannot reliably diagnose nutritional deficiencies or other medical conditions and does not replace validated laboratory testing or evaluation by a qualified healthcare professional.',
      details: [
        {
          title: 'Who guides your session',
          text: 'Your session is guided by Carole Bernard, our Certified Microscopist and Certified Natural Health Coach. She’ll walk you through the observation and wellness conversation.',
        },
      ],
    },
  ],
};
