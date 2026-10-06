import Image from 'next/image';

export function Story() {
  return (
    <section id="story" className="section bg-white">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <figure className="lg:order-1">
          <Image
            src="/client-walking-into-court-building.jpeg"
            alt="A man walks along a glowing path toward a columned courthouse at sunset. Connected attorney profile photos and icons for documents, security, people and messages float beside him."
            width={1672}
            height={941}
            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, calc(100vw - 2.5rem)"
            className="h-auto w-full rounded-[22px] shadow-[0_30px_70px_-30px_rgb(16_24_40/0.5)]"
          />
        </figure>

        <div className="lg:order-2">
          <p className="eyebrow">Why we started</p>
          <h2 className="title-1 mt-4">We needed a lawyer, and the system was no help.</h2>
          <div className="measure mt-6 space-y-4 text-[1.05rem] leading-relaxed text-slate-600">
            <p>
              We did what many people do. We paid a bar association a $25 referral fee for three names of attorneys. They
              were not taking new clients, or they had a conflict. We got nothing for our money.
            </p>
            <p>
              Calling a hundred firms and repeating the same intake each time is not a real option when time matters.
            </p>
            <p className="font-semibold text-ink">
              So we built Legal Connect to do the slow part for you: intake, conflict screening and finding available
              attorneys, in minutes instead of weeks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
