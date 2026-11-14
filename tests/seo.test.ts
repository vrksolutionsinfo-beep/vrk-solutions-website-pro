import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  canonicalUrl,
  indexingEnabled,
  pageMetadata,
  organizationGraph,
  serializeJsonLd,
  site,
} from '../lib/seo/site';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { staticPages } from '../lib/seo/routes';
afterEach(() => vi.unstubAllEnvs());
describe('search indexing and canonical boundaries', () => {
  it('strips quotation data and fragments from canonical URLs', () => {
    expect(canonicalUrl('/get-quote/?brief=private#form')).toBe(
      site.url + '/get-quote',
    );
    expect(canonicalUrl('https://other.invalid/services?x=1')).toBe(
      site.url + '/services',
    );
  });
  it('keeps staging pages noindex even when page metadata is explicit', () => {
    vi.stubEnv('SITE_INDEXING_ENABLED', 'false');
    const meta = pageMetadata('A page', 'A description', '/contact');
    expect(meta.robots).toMatchObject({ index: false, follow: true });
    expect(meta.openGraph).toMatchObject({ url: canonicalUrl('/contact') });
  });
  it('uses the supplied artwork for social previews with its actual dimensions', () => {
    const meta = pageMetadata('Home', 'Description', '/');
    expect(meta.openGraph).toMatchObject({ images: [{
      url: site.url + '/brand/hero-background.jpg', width: 1448, height: 1086,
      type: 'image/jpeg',
    }] });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', images: [site.url + '/brand/hero-background.jpg'] });
  });
  it('prevents Vercel preview indexing', () => {
    vi.stubEnv('SITE_INDEXING_ENABLED', 'true');
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(indexingEnabled()).toBe(false);
  });
  it('enables public production content and omits noindex collections from sitemap', async () => {
    vi.stubEnv('SITE_INDEXING_ENABLED', 'true');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', '');
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(25);
    expect(entries.some((e) => e.url.endsWith('/work'))).toBe(false);
    expect(
      entries.some((e) => e.url.endsWith('/website-development-kakinada')),
    ).toBe(true);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
    expect(entries.every((e) => !/[?#]/.test(e.url))).toBe(true);
    expect(pageMetadata('Page', 'Description', '/').robots).toMatchObject({
      index: true,
    });
  });
  it('allows crawlers to read noindex previews and omits preview sitemaps', async () => {
    vi.stubEnv('SITE_INDEXING_ENABLED', 'false');
    expect(await sitemap()).toEqual([]);
    expect(robots().sitemap).toBeUndefined();
    expect(robots().rules).toMatchObject({ allow: '/' });
  });
  it('does not invent a walk-in office, ratings or geographic coordinates', () => {
    const org = organizationGraph['@graph'][0];
    expect(org['@type']).toBe('Organization');
    expect(org).not.toHaveProperty('geo');
    expect(org).not.toHaveProperty('aggregateRating');
    expect(org.address).toMatchObject({
      addressLocality: 'Kakinada',
      addressRegion: 'Andhra Pradesh',
    });
    expect(org.address).not.toHaveProperty('streetAddress');
  });
  it('safely serializes CMS text in JSON-LD script elements', () => {
    const payload = { text: '</script><script>alert(1)</script>' };
    const result = serializeJsonLd(payload);
    expect(result).not.toContain('<');
    expect(JSON.parse(result)).toEqual(payload);
  });
  it('includes distinct local pages and original buyer guides in navigation inventory', () => {
    const paths = staticPages.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('/app-development-kakinada');
    expect(paths).toContain('/insights/website-vs-mobile-app-for-business');
  });
});
