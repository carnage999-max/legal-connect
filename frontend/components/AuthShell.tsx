import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';

type Props = {
  variant?: 'client' | 'attorney';
  title: string;
  subtitle?: string;
  asideTitle: string;
  asidePoints?: { icon: LucideIcon; text: string }[];
  asideImage?: { src: string; alt: string };
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

/**
 * Split layout for every sign-in style screen. The left panel carries the
 * brand and the reason to continue, the right panel carries the form.
 * The attorney variant is dark, to match the attorney portal behind it.
 */
export function AuthShell({
  variant = 'client',
  title,
  subtitle,
  asideTitle,
  asidePoints,
  asideImage,
  children,
  footer,
  wide,
}: Props) {
  const attorney = variant === 'attorney';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="dark-surface black-surface hero-bg relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative p-10 xl:p-14">
          <Logo tone="dark" size={44} hideWordOnTiny={false} />
        </div>

        <div className="relative px-10 xl:px-14">
          <h2 className="title-2 max-w-md">{asideTitle}</h2>
          {asidePoints && (
            <ul className="mt-8 space-y-4">
              {asidePoints.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3.5 text-[1.05rem] text-[#d2d2d7]">
                  <Icon size={22} strokeWidth={1.75} className={`flex-none ${attorney ? 'text-[#6db3f4]' : 'text-[#5bd16e]'}`} />
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative p-10 xl:p-14">
          {asideImage && (
            <Image
              src={asideImage.src}
              alt={asideImage.alt}
              width={1672}
              height={941}
              sizes="(min-width: 1280px) 520px, 40vw"
              className="h-auto w-full max-w-sm rounded-3xl"
            />
          )}
        </div>
      </aside>

      <div className={`flex min-h-screen flex-col ${attorney ? 'dark-surface black-surface bg-black text-[#f5f5f7]' : 'bg-white'}`}>
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end lg:px-10">
          <div className="lg:hidden">
            <Logo tone={attorney ? 'dark' : 'light'} />
          </div>
          <Link
            href="/"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors ${
              attorney ? 'text-[#a1a1a6] hover:text-white' : 'text-mute hover:text-ink'
            }`}
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
          <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-[440px]'}`}>
            <h1 className="title-2">{title}</h1>
            {subtitle && <p className={`mt-3 text-[1.05rem] leading-relaxed ${attorney ? 'text-[#a1a1a6]' : 'text-mute'}`}>{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className={`mt-8 space-y-4 border-t pt-6 text-[0.95rem] ${attorney ? 'border-[#2c2c2e] text-[#a1a1a6]' : 'border-hairline text-mute'}`}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
