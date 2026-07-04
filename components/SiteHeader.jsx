import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark">
          Wang Chongyu
        </Link>
        <nav className="site-nav">
          <Link href="/#work">Work</Link>
          <Link href="/#experience" className="hide-mobile">
            Experience
          </Link>
          <Link href="/#contact">Contact</Link>
          <a href="/resume.pdf">Résumé</a>
        </nav>
      </div>
    </header>
  );
}
