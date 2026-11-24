export const SITE_URL = 'https://sozorootedwellness.com';

export const serviceSearchNames: Record<string, string> = {
  '/services/assessments': 'Wellness Assessments',
  '/services/hyperbaric-oxygen': 'Hyperbaric Oxygen Therapy',
  '/services/shockwave': 'Shockwave Therapy',
  '/services/rife': 'Rife Frequency Therapy',
  '/services/therawellness': 'TheraWellness',
  '/services/cardio-medbed': 'Cardio MedBed EECP',
  '/services/red-light-therapy': 'Pulse / Red Light Therapy',
  '/services/foot-detox': 'Foot Detox',
  '/services/wolfe-non-surgical-bodywork': 'Wolfe Non-Surgical Bodywork',
  '/services/whole-life-coaching': 'Whole Life Wellness Coaching',
  '/services/core-restore': 'Core Restore Pelvic Floor Support',
  '/services/ozone-therapy': 'Ozone Therapy',
};

export function canonicalUrl(path: string): string {
  let clean = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (clean === '/hyperbaric-giveaway') clean = '/enter-to-win';
  return `${SITE_URL}${clean === '/' ? '/' : `${clean}/`}`;
}

type PageSchemaInput = { path: string; title: string; description: string; indexable: boolean };

export function pageStructuredData({ path, title, description, indexable }: PageSchemaInput) {
  const url = canonicalUrl(path);
  const businessId = `${SITE_URL}/#business`;
  const websiteId = `${SITE_URL}/#website`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'HealthAndBeautyBusiness', '@id': businessId,
      name: 'SOZO Wellness Center', url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/sozo-logo.png`,
      image: `${SITE_URL}/images/hyperbaric-chamber.png`,
      description: 'Whole-person wellness coaching, assessments and complementary therapies in Wildwood, serving The Villages, Florida.',
      telephone: '+1-352-802-2248', email: 'info@sozorootedwellness.com',
      address: { '@type': 'PostalAddress', streetAddress: '5029 Co Rd 159', addressLocality: 'Wildwood', addressRegion: 'FL', postalCode: '34785', addressCountry: 'US' },
      areaServed: [{ '@type': 'Place', name: 'The Villages, Florida' }, { '@type': 'Place', name: 'Wildwood, Florida' }],
    },
    { '@type': 'WebSite', '@id': websiteId, url: `${SITE_URL}/`, name: 'SOZO Wellness Center', publisher: { '@id': businessId }, inLanguage: 'en-US' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, isPartOf: { '@id': websiteId }, inLanguage: 'en-US' },
  ];
  if (indexable && path !== '/') {
    const label = serviceSearchNames[path] || title.split(' | ')[0];
    const crumbs = [{ name: 'Home', item: `${SITE_URL}/` }];
    if (path.startsWith('/research/')) crumbs.push({ name: 'Articles & Resources', item: canonicalUrl('/blog') });
    crumbs.push({ name: label, item: url });
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
    });
    graph[2].breadcrumb = { '@id': `${url}#breadcrumb` };
  }
  // Do not attribute the independent physician's practice or chiropractors'
  // services to SOZO. No invented medical credentials, reviews, prices or hours.
  if (indexable && serviceSearchNames[path]) {
    graph.push({
      '@type': 'Service', '@id': `${url}#service`, name: serviceSearchNames[path],
      url, description, provider: { '@id': businessId },
      areaServed: [{ '@type': 'Place', name: 'The Villages, Florida' }, { '@type': 'Place', name: 'Wildwood, Florida' }],
      mainEntityOfPage: { '@id': `${url}#webpage` },
    });
    graph[2].mainEntity = { '@id': `${url}#service` };
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeStructuredData(data: ReturnType<typeof pageStructuredData>) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
