import React from 'react';
import Image from 'next/image';

export function AboutStory() {
  return (
    <section
      aria-labelledby="about-story-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full"
      data-purpose="about-story"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Narrative Copy */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#f97316] mb-2 sm:mb-2.5">
            OUR STORY
          </p>

          <h2
            id="about-story-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C3323] tracking-tight leading-tight font-sans mb-4 sm:mb-5"
          >
            Purposeful gear for the places that call us.
          </h2>

          <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            <p>
              ALTITUDE began with a straightforward ambition: to create outdoor equipment that respects the simplicity of the wild. When you are miles beyond the trailhead, the gear you carry should never demand your attention—it should simply do its job, so your focus stays on the landscape around you.
            </p>
            <p>
              From intuitive dome tents that pitch smoothly in fading daylight to ergonomic backpacks that balance weight across rocky traverses, every design reflects a commitment to functional utility. We believe good equipment removes barriers between people and the outdoors, inspiring confidence whether you are pitching camp for the first time or embarking on a familiar backcountry route.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" aria-hidden="true" />
            <span>Demonstration concept for the ALTITUDE outdoor e-commerce storefront</span>
          </div>
        </div>

        {/* Right Column: Visual Presentation */}
        <div className="lg:col-span-6 w-full">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-100">
            <Image
              src="/images/lifestyleBanner.png"
              alt="Alpine lake shoreline with tent and campfire against a mountain sunrise"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
