import type { Metadata } from 'next';
export const site = {
  name: 'VRK Solutions',
  url: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vrksolutions.in',
  ).origin,
  email: 'info@vrksolutions.in',
  phone: '+919398845947',
  displayPhone: '+91 9398845947',
  location: 'Kakinada, Andhra Pradesh, India',
  description:
    'VRK Solutions is a digital agency based in Kakinada, Andhra Pradesh, providing website development, mobile apps, SaaS, design and automation through remote collaboration.',
};
export function indexingEnabled() {
  return (
    process.env.SITE_INDEXING_ENABLED !== 'false' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')
  );
}
export function canonicalUrl(path = '/') {
  const pathname = new URL(path, site.url).pathname;
  return site.url + (pathname === '/' ? '/' : pathname.replace(/\/+$/, ''));
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  {
    noindex = false,
    image = '/brand/hero-background.jpg',
    article = false,
  }: { noindex?: boolean; image?: string; article?: boolean } = {},
): Metadata {
  const url = canonicalUrl(path);
  const fullTitle = title.includes('VRK Solutions')
    ? title
    : `${title} | VRK Solutions`;
  const index = indexingEnabled() && !noindex;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: article ? 'article' : 'website',
      locale: 'en_IN',
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      images: [
        {
          url: new URL(image, site.url).href,
          ...(image === '/brand/hero-background.jpg'
            ? { width: 1448, height: 1086, type: 'image/jpeg' }
            : {}),
          alt: 'VRK Solutions logo on cream architectural curves with an orange ribbon',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [new URL(image, site.url).href],
    },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}
export const orgId = site.url + '/#organization';
export const websiteId = site.url + '/#website';
export const organizationGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: site.name,
      url: site.url + '/',
      description: site.description,
      email: site.email,
      telephone: site.phone,
      logo: { '@type': 'ImageObject', url: site.url + '/brand/logo.svg' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kakinada',
        addressRegion: 'Andhra Pradesh',
        addressCountry: 'IN',
      },
      areaServed: [
        { '@type': 'City', name: 'Kakinada' },
        { '@type': 'AdministrativeArea', name: 'Andhra Pradesh' },
        { '@type': 'Country', name: 'India' },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: site.phone,
        email: site.email,
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: site.url + '/',
      name: site.name,
      inLanguage: 'en-IN',
      publisher: { '@id': orgId },
    },
  ],
};
export function serviceGraph(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': canonicalUrl(path) + '#service',
    name,
    description,
    url: canonicalUrl(path),
    serviceType: name,
    provider: { '@id': orgId },
    areaServed: { '@type': 'City', name: 'Kakinada' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonicalUrl('/contact'),
      servicePhone: { '@type': 'ContactPoint', telephone: site.phone },
    },
  };
}
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
