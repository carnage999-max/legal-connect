import Image from 'next/image';
import type { ComponentType } from 'react';
import { SiFacebook, SiInstagram, SiRumble, SiThreads, SiTiktok, SiX, SiYelp, SiYoutube } from 'react-icons/si';
import { SOCIALS } from '@/lib/site';

/** Truth Social (Arcticons via Iconify), stroke weighted to match the filled marks. */
function TruthSocialIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18.84 29.646c0 2.778 2.253 4.013 5.031 4.013s5.03-1.235 5.03-4.013V18.648l-10.06-.01z" />
      <path d="m38.067 38.088l4.237 3.662V5.5h-13.52v5.35h-9.848V5.5H5.792l-.096 22.399C5.696 38.008 13.89 42.5 24 42.5c5.654 0 10.71-1.405 14.067-4.412" />
    </svg>
  );
}

/** Liberty Social has no icon-font mark; it ships as a bitmap. */
function LibertySocialIcon({ className }: { className?: string }) {
  return <Image src="/LS.png" alt="" width={40} height={40} aria-hidden className={className} />;
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  youtube: SiYoutube,
  rumble: SiRumble,
  liberty: LibertySocialIcon,
  facebook: SiFacebook,
  x: SiX,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  yelp: SiYelp,
  truth: TruthSocialIcon,
  threads: SiThreads,
};

export function SocialRow({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {SOCIALS.map(({ key, name, href }) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#d2d2d7] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black"
            >
              <Icon className="h-[17px] w-[17px] object-contain" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
