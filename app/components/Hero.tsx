import Caterpillar from "./Caterpillar";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#111827 1px, transparent 1px), linear-gradient(to right, #111827 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="max-w-4xl">
          <div className="relative mb-6 inline-block">
            <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs">
              Stanford University · Computer Science
            </p>
            <Caterpillar />
          </div>

          <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] font-bold text-stone-900 leading-[0.95] tracking-tight mb-8">
            Piper
            <br />
            <span className="italic text-teal-600">Fleming.</span>
          </h1>

          <p className="text-xl md:text-2xl text-stone-500 font-light leading-relaxed max-w-2xl mb-12">
            I build things at the intersection of{" "}
            <span className="text-stone-800 font-normal">technology</span>,{" "}
            <span className="text-stone-800 font-normal">finance</span>, and{" "}
            <span className="text-stone-800 font-normal">AI</span>- from fintech
            intelligence tools to research on how language models shape human
            identity.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="#work"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-teal-700 transition-colors duration-200"
            >
              See my work
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm text-stone-600 border border-stone-300 hover:border-teal-400 hover:text-teal-700 transition-colors duration-200"
            >
              Get in touch
            </a>
          </div>

          {/* Quick links row */}
          <div className="mt-16 pt-8 border-t border-stone-200 flex flex-wrap gap-6">
            {[
              { label: "GitHub", href: "https://github.com/piperfleming" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/piper-fleming/" },
              { label: "piperf@stanford.edu", href: "mailto:piperf@stanford.edu" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-xs text-stone-400 hover:text-teal-600 transition-colors font-medium tracking-wide uppercase"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
