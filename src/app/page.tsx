export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2E4D36]/20 bg-[#EDE8DE] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C3323]">
          <span className="h-2 w-2 rounded-full bg-[#D97706] animate-pulse" />
          Phase 04 — Bootstrap Shell
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C3323]">
          Ridge &amp; River
        </h1>

        <p className="text-lg text-[#2E4D36] max-w-xl mx-auto leading-relaxed">
          Technical outdoor equipment and expedition apparel crafted for the backcountry. Built for endurance, engineered for the wild.
        </p>

        <div className="pt-6 flex flex-wrap justify-center gap-2">
          {['Next.js 16 (LTS)', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'PostgreSQL', 'Prisma 7'].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-[#2E4D36]/15 bg-white/70 px-3 py-1 text-xs font-medium text-[#1C3323] shadow-xs"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="text-xs text-[#4A6B53] pt-4">
          Foundation &amp; architecture boundaries established. Storefront catalog and features activate in Phase 05.
        </p>
      </div>
    </main>
  );
}
