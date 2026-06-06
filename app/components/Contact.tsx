const links = [
  {
    label: "Email",
    value: "piperf@stanford.edu",
    href: "mailto:piperf@stanford.edu",
    description: "Best way to reach me.",
  },
  {
    label: "GitHub",
    value: "SandPiper0314",
    href: "https://github.com/piperfleming",
    description: "Where the code lives.",
  },
  {
    label: "LinkedIn",
    value: "Piper Fleming",
    href: "https://www.linkedin.com/in/piper-fleming/",
    description: "Let's connect professionally.",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-28 bg-[#F9F8F6]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs mb-4">
            Contact
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-6">
            Let&apos;s talk.
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Whether you&apos;re thinking about a project, an opportunity, or just
            want to swap ideas- my inbox is open.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group bg-white rounded-2xl p-6 border border-stone-200 hover:border-teal-300 hover:shadow-sm transition-all text-center"
            >
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">
                {l.label}
              </p>
              <p className="font-medium text-stone-900 group-hover:text-teal-700 transition-colors text-sm mb-1">
                {l.value}
              </p>
              <p className="text-xs text-stone-400">{l.description}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="mailto:piperf@stanford.edu"
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full font-medium text-sm hover:bg-teal-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send me an email
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 mt-24 pt-8 border-t border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <p className="font-serif italic text-sm text-stone-500">Piper Fleming</p>
          <p>Built with Next.js · Stanford, CA</p>
        </div>
      </div>
    </section>
  );
}
