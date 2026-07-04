import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import site from '@/content/site.json';
import flagship from '@/content/flagship.json';
import projects from '@/content/projects.json';

const all = [
  {
    slug: flagship.slug,
    title: flagship.title,
    context: flagship.kicker,
    summary: flagship.subtitle,
    body: flagship.summary,
    sections: flagship.sections,
    highlights: flagship.highlights,
    impact: null,
    stack: flagship.stack,
    tags: flagship.tags,
  },
  ...projects,
];

export function generateStaticParams() {
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.title} — Wang Chongyu`,
    description: p.summary,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="detail-hero">
          <div className="wrap">
            <p className="kicker">{p.context}</p>
            <h1 className="display">{p.title}</h1>
            <p className="sub">{p.summary}</p>
          </div>
        </section>
        <div className="wrap detail-body">
          <article>
            {p.body && (
              <>
                <h2>Overview</h2>
                <p style={{ color: 'var(--ink-2)' }}>{p.body}</p>
              </>
            )}
            {p.sections &&
              p.sections.map((sec) => (
                <div key={sec.heading}>
                  <h2>{sec.heading}</h2>
                  <p style={{ color: 'var(--ink-2)' }}>{sec.body}</p>
                </div>
              ))}
            <h2>What it does</h2>
            <ul>
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {p.impact && (
              <>
                <h2>Why it matters</h2>
                <p className="impact-note">{p.impact}</p>
              </>
            )}
          </article>
          <aside className="detail-aside">
            <h3>Focus</h3>
            <div className="case-tags">
              {p.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <h3>Built with</h3>
            <div className="case-tags">
              {p.stack.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <h3>More</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-2)' }}>
              <Link href="/#work" className="link-arrow">
                ← All work
              </Link>
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', marginTop: 12 }}>
              <a href={`mailto:${site.contact.email}`} className="link-arrow">
                Ask me about this →
              </a>
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
