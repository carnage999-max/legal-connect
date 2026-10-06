import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';

export function Story() {
  return (
    <section id="story" className="section bg-paper">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <Reveal>
          <h2 className="title-1">We needed a lawyer, and the system was no help.</h2>
          <div className="mt-8 max-w-xl space-y-5 text-[1.1rem] leading-relaxed text-mute">
            <p>
              We did what many people do. We paid a bar association a $25 referral fee for three names of attorneys. They were
              not taking new clients, or they had a conflict. We got nothing for our money.
            </p>
            <p>Calling a hundred firms and repeating the same intake each time is not a real option when time matters.</p>
            <p className="font-medium text-ink">
              So we built Legal Connect to do the slow part for you: intake, conflict screening and finding available attorneys,
              in minutes instead of weeks.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Image
            src="/client-walking-into-court-building.jpeg"
            alt="A man walks along a glowing path toward a columned courthouse at sunset, with attorney profile photos and icons for documents, security, people and messages floating beside him."
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 420px, calc(100vw - 2.5rem)"
            className="h-auto w-full max-w-md rounded-3xl lg:ml-auto"
          />
        </Reveal>
      </div>
    </section>
  );
}
