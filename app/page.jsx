import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import site from '@/content/site.json';
import flagship from '@/content/flagship.json';
import projects from '@/content/projects.json';
import experience from '@/content/experience.json';
import skills from '@/content/skills.json';
import archive from '@/content/archive.json';

const MARQUEE = [
  'Fund due diligence', 'Valuation', 'LP analytics', 'Equity research',
  'LLM automation', 'Founder', 'Excel modelling', 'Python', 'Agentic systems',
];

function splitStat(value) {
  const m = value.match(/^([\d,.]+)(.*)$/);
  return m ? { num: m[1], suffix: m[2] } : { num: value, suffix: '' };
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero wrap">
          <div className="kicker-row">
            <p className="kicker">Portfolio — 2026</p>
            <p className="kicker" style={{ color: 'var(--mute)' }}>
              {site.location} · SMU Finance &amp; Strategy &rsquo;27
            </p>
          </div>
          <h1 className="display">
            <span className="line"><span>Analyst by training,</span></span>
            <span className="line"><span><em>builder by instinct.</em></span></span>
          </h1>
          <div className="hero-below">
            <div>
              <p className="intro">{site.intro}</p>
              <div className="hero-ctas">
                <Link href="/#work" className="btn primary">
                  View the work ↓
                </Link>
                <a href="/resume.pdf" className="link-plain">
                  Download résumé
                </a>
              </div>
            </div>
            <dl className="hero-meta">
              <div>
                <dt>Currently</dt>
                <dd>{site.availability}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={site.contact.linkedin} target="_blank" rel="noopener noreferrer">
                    /in/wangchongyu
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((rep) => (
              <span key={rep}>
                {MARQUEE.map((w) => (
                  <span className="marquee-item" key={w + rep}>
                    {w} <i>✦</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="stats" data-reveal>
          <div className="wrap stats-grid">
            {site.stats.map((s) => {
              const { num, suffix } = splitStat(s.value);
              return (
                <div className="stat" key={s.label}>
                  <div className="num" data-count={num} data-suffix={suffix}>
                    {s.value}
                  </div>
                  <div className="cap">{s.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flagship-band" id="work">
          <div className="wrap" data-reveal>
            <div className="section-head">
              <div>
                <p className="kicker">{flagship.kicker} — 01</p>
              </div>
              <p className="kicker dim">{flagship.tags.join(' · ')}</p>
            </div>
            <h2 className="display flagship-title">{flagship.title}</h2>
            <p className="flagship-sub">{flagship.subtitle}</p>
            <div className="flagship-grid">
              {flagship.sections.map((sec) => (
                <div className="flagship-cell" key={sec.heading}>
                  <h3>{sec.heading}</h3>
                  <p>{sec.body}</p>
                </div>
              ))}
            </div>
            <div className="flagship-foot">
              <ul className="flagship-highlights">
                {flagship.highlights.slice(0, 3).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="stack-row">
                {flagship.stack.map((t) => (
                  <span className="tag on-dark" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Case studies — 02–0{projects.length + 1}</p>
              <h2>Selected work</h2>
            </div>
            <p className="kicker dim">Hover to open</p>
          </div>
          <div className="case-index">
            {projects.map((p, i) => (
              <Link href={`/projects/${p.slug}/`} className="case-row" key={p.slug} data-reveal>
                <span className="case-num">0{i + 2}</span>
                <div className="case-main">
                  <h3 className="display">{p.title}</h3>
                  <p className="case-context">{p.context}</p>
                  <div className="case-more">
                    <div>
                      <p className="case-summary">{p.summary}</p>
                      <p className="case-focus">{p.tags.join(' · ')}</p>
                    </div>
                  </div>
                </div>
                <span className="case-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Also built</p>
              <h2>The wider workshop</h2>
            </div>
          </div>
          <div className="archive-grid" data-reveal>
            {archive.map((a) => (
              <div className="archive-item" key={a.title}>
                <strong>{a.title}</strong>
                <span>{a.note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap" id="about">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">{site.about.kicker}</p>
              <h2>{site.about.heading}</h2>
            </div>
          </div>
          <div className="about-body" data-reveal>
            {site.about.body.map((p, i) => (
              <p key={p.slice(0, 24)} className={i === 0 ? 'about-lead' : ''}>
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="section wrap" id="experience">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Experience</p>
              <h2>Where I&rsquo;ve worked</h2>
            </div>
          </div>
          <div>
            {experience.experience.map((x) => (
              <div className="xp-item" key={x.org} data-reveal>
                <div>
                  <h3>{x.org}</h3>
                  <p className="xp-role">{x.role}</p>
                  <p className="xp-period">{x.period}</p>
                </div>
                <ul>
                  {x.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Toolbox</p>
              <h2>What I work with</h2>
            </div>
          </div>
          <div className="skills-grid" data-reveal>
            {skills.groups.map((g) => (
              <div className="skills-col" key={g.label}>
                <h3>{g.label}</h3>
                <ul>
                  {g.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section wrap">
          <div className="section-head" data-reveal>
            <div>
              <p className="kicker">Education &amp; community</p>
              <h2>Background</h2>
            </div>
          </div>
          <div className="edu-grid" data-reveal>
            <div>
              {experience.education.map((e) => (
                <div className="xp-item" key={e.org} style={{ gridTemplateColumns: '1fr' }}>
                  <div>
                    <h3>{e.org}</h3>
                    <p className="xp-role">
                      {e.credential}
                      {e.note ? ` · ${e.note}` : ''}
                    </p>
                    <p className="xp-period">{e.period}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              {experience.community.map((c) => (
                <div className="xp-item" key={c.org} style={{ gridTemplateColumns: '1fr' }}>
                  <div>
                    <h3>{c.org}</h3>
                    <p className="xp-role">{c.role}</p>
                    <p className="xp-period">{c.period}</p>
                    <ul style={{ marginTop: 12 }}>
                      {c.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap" data-reveal>
            <p className="kicker">Contact</p>
            <h2 className="display">
              Let&rsquo;s talk<em>.</em>
            </h2>
            <p className="contact-sub">
              Hiring for asset management, fund distribution, or strategy? I bring the analyst
              toolkit and the AI leverage to go with it.
            </p>
            <a href={`mailto:${site.contact.email}`} className="contact-mail">
              {site.contact.email}
            </a>
            <div className="contact-ctas">
              <a href={site.contact.linkedin} className="btn" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="/resume.pdf" className="btn">
                Résumé (PDF)
              </a>
            </div>
            <div className="footer-line">
              <span>© 2026 Wang Chongyu</span>
              <span>Designed &amp; built with my own AI toolchain</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
