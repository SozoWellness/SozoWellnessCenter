export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  profileHref?: string;
  practiceNote?: string;
};

// Names, roles and portraits from SOZO's Team page; repeated carousel entries omitted.
// Linked providers retain their own role and practice relationship.
export const teamMembers: TeamMember[] = [
  { id: 'darcelle-burandt', name: 'Darcelle Burandt', role: 'Certified Whole Life Health Coach', image: '/images/team/darcelle-burandt.jpg' },
  { id: 'gary-cupo', name: 'Gary Cupo', role: 'Wellness Practitioner', image: '/images/team/gary-cupo.jpg' },
  { id: 'leisa-bodway', name: 'Leisa Bodway', role: 'SOZO Ambassador', image: '/images/team/leisa-bodway.jpg' },
  { id: 'lynne-barta', name: 'Lynne Barta', role: 'SOZO Ambassador', image: '/images/team/lynne-barta.jpg' },
  { id: 'lisa-springer', name: 'Lisa Springer', role: 'Client Services', image: '/images/team/lisa-springer.jpg' },
  { id: 'jt-anderson', name: 'JT Anderson, DC', role: 'Chiropractor', image: '/images/team/jt-anderson.jpg', profileHref: '/chiropractic-care#jt-anderson', practiceNote: 'Independent practitioner with an office inside SOZO Wellness Center.' },
  { id: 'lauren-alvarez-schmitz', name: 'Lauren Alvarez Schmitz, DC', role: 'Chiropractor', image: '/images/team/lauren-alvarez-schmitz.jpg', profileHref: '/chiropractic-care#lauren-alvarez-schmitz' },
  { id: 'kevin-stasney', name: 'Kevin Stasney, MD', role: 'Independent Physician', image: '/images/kevin-stasney-md.jpg', profileHref: '/independent-physicians', practiceNote: 'Years Younger MD is a separate medical practice operating independently of SOZO Wellness Center.' },
  { id: 'cindy-greenberg', name: 'Cindy Greenberg', role: 'Registered Nurse', image: '/images/team/cindy-greenberg.jpg' },
  { id: 'marty-fields', name: 'Marty Fields', role: 'Wellness Practitioner', image: '/images/team/marty-fields.jpg' },
];

export const teamIntroduction = 'Our team of dedicated professionals combines advanced alternative therapies with a compassionate, patient-centered approach, creating a healing environment that nurtures and empowers.';
