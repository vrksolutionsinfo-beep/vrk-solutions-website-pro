import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText } from 'next-sanity';
import { query } from '@/sanity/lib';
import { guides } from '@/lib/seo/guides';
import { pageMetadata, canonicalUrl, orgId } from '@/lib/seo/site';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
type Post = {
  title: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  _updatedAt?: string;
  cover?: { url?: string; alt?: string };
  body: Parameters<typeof PortableText>[0]['value'];
};
const get = cache(async (slug: string) =>
  query<Post>(
    '*[_type=="article" && slug.current==$slug && ($preview || published==true)][0]{title,excerpt,seoTitle,seoDescription,publishedAt,_updatedAt,body,"cover":{"url":cover.asset->url,"alt":cover.alt}}',
    { slug },
  ),
);
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await get(slug);
  const guide = guides.find((g) => g.slug === slug);
  if (!p && !guide) notFound();
  return pageMetadata(
    p?.seoTitle || p?.title || guide!.title,
    p?.seoDescription || p?.excerpt || guide!.description,
    '/insights/' + slug,
    { article: true, ...(p?.cover?.url ? { image: p.cover.url } : {}) },
  );
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await get(slug);
  const guide = p ? undefined : guides.find((g) => g.slug === slug);
  if (!p && !guide) notFound();
  const title = p?.title || guide!.title;
  const description = p?.excerpt || guide!.description;
  const published = p?.publishedAt || guide?.publishedAt;
  const modified = p ? p._updatedAt : guide?.updatedAt;
  return (
    <main id="main">
      <section className="container page-intro">
        <Breadcrumbs
          items={[
            { name: 'Insights', path: '/insights' },
            { name: title, path: '/insights/' + slug },
          ]}
        />
        <span className="eyebrow">PRACTICAL PROJECT PLANNING</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="article-byline">
          By <Link href="/about">VRK Solutions</Link>
          {published && (
            <>
              {' '}
              · Published{' '}
              <time dateTime={published}>
                {new Date(published).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Asia/Kolkata',
                })}
              </time>
            </>
          )}
        </div>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          mainEntityOfPage: canonicalUrl('/insights/' + slug),
          url: canonicalUrl('/insights/' + slug),
          author: {
            '@type': 'Organization',
            name: 'VRK Solutions',
            url: canonicalUrl('/about'),
          },
          publisher: { '@id': orgId },
          image: p?.cover?.url || canonicalUrl('/brand/hero-background.jpg'),
          ...(published ? { datePublished: published } : {}),
          ...(modified ? { dateModified: modified } : {}),
        }}
      />
      <article className="container page-body prose">
        {guide ? (
          <>
            <aside className="answer-summary">
              <strong>The short answer</strong>
              <p>{guide.answer}</p>
            </aside>
            <nav className="article-contents" aria-label="In this guide">
              <strong>In this guide</strong>
              <ol>
                {guide.sections.map((s, i) => (
                  <li key={s.title}>
                    <a href={'#section-' + i}>{s.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            {guide.sections.map((s, i) => (
              <section id={'section-' + i} key={s.title}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                {s.items && (
                  <ul>
                    {s.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <div className="local-links">
              <Link href={'/services/' + guide.service}>
                Explore the relevant service ↗
              </Link>
              <Link href="/get-quote">Create your project enquiry ↗</Link>
            </div>
          </>
        ) : (
          <>
            {p?.cover?.url && (
              <Image
                className="case-cover"
                src={p.cover.url}
                alt={p.cover.alt || title}
                width={1200}
                height={750}
                unoptimized
              />
            )}
            <PortableText value={p!.body || []} />
          </>
        )}
        <aside className="related-guides">
          <h2>Continue planning</h2>
          <ul>
            {guides
              .filter((g) => g.slug !== slug)
              .map((g) => (
                <li key={g.slug}>
                  <Link href={'/insights/' + g.slug}>{g.title}</Link>
                </li>
              ))}
          </ul>
        </aside>
      </article>
    </main>
  );
}
