import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export type TocItem = { id: string; label: string };

/**
 * Long-form legal pages: a quiet header band, a sticky contents list and the
 * policy text itself, which is passed through unchanged as children.
 */
export function LegalLayout({
  title,
  updated,
  toc,
  children,
}: {
  title: string;
  updated: string;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="border-b border-hairline bg-paper">
        <div className="site-container py-12 md:py-16">
          <h1 className="title-1">{title}</h1>
          <p className="mt-4 text-[1.02rem] text-mute">{updated}</p>
        </div>
      </div>

      <div className="site-container grid gap-10 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16 lg:py-16">
        <nav aria-label="Contents" className="lg:sticky lg:top-24 lg:self-start">
          <details className="rounded-2xl border border-hairline bg-white lg:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold text-ink">On this page</summary>
            <ol className="space-y-0.5 px-2 pb-3 text-[0.92rem]">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block rounded-lg px-2 py-2 leading-snug text-mute hover:bg-paper hover:text-ink">
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-ink">On this page</p>
            <ol className="mt-3 max-h-[calc(100vh-10rem)] space-y-0.5 overflow-y-auto text-[0.9rem]">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block rounded-lg px-2 py-1.5 leading-snug text-mute transition-colors hover:bg-paper hover:text-ink">
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="prose-lc min-w-0">{children}</article>
      </div>
      <Footer />
    </>
  );
}
