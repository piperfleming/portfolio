const experiences = [
  {
    company: "Core VC",
    role: "Software Engineering Intern",
    period: "Summer 2026",
    description: "",
    tags: [],
    current: true,
    note: "This work is confidential and can't be shared publicly.",
  },
  {
    company: "Oracle",
    role: "Product Management Intern, Java Platform Group (AI Integration)",
    period: "Summer 2025",
    description:
      "Prototyped 0→1 AI-powered tools for Oracle's Java Platform Group- integrating AI into developer workflows and cutting team AI-related costs by 40%. Built RAG-enabled agents and GenAI tooling that accelerated internal data collection by 25%. Represented Stanford on the Oracle Student Advisory Group and spoke on Java community panels to 15K+ viewers.",
    tags: ["Product Management", "AI", "RAG", "GenAI", "Java"],
    current: false,
    note: "The exact work I did can't be shared publicly, but check out the panels I moderated and media coverage in the Oracle tab above.",
  },
  {
    company: "Max Planck Institute for Innovation & Competition",
    role: "AI, Data, and Economics Intern",
    period: "Summer 2024",
    description:
      "Built AI/NLP/ML systems and data pipelines for economic policy research at one of Europe's leading research institutes. Developed a chatbot integrated with a proprietary patent search tool (17% efficiency gain) and a Word2Vec sentiment-analysis pipeline improving accuracy by 40%. Conducted original research linking NYSE/LSE market data to green acquisitions.",
    tags: ["NLP", "Python", "Word2Vec", "Economic Research", "ML"],
    current: false,
    paper: {
      field: "Economics · Science Policy",
      title: "Who Uses AI in Research, and for What? Large-Scale Survey Evidence from Germany",
      description:
        "Published in Research Policy (2026). Surveyed 2,000+ scientists at the Max Planck and Fraunhofer Societies to map AI adoption patterns, identify barriers, and assess impact on scientific productivity. Found widespread use for primary and creative tasks, a persistent gender gap linked to familiarity, and legal uncertainty as a key organizational barrier.",
      href: "https://www.sciencedirect.com/science/article/pii/S0048733325002100",
      image: "/images/projects/econ-adoption-charts.png",
    },
  },
  {
    company: "Hopkins Marine Station of Stanford University",
    role: "Computational Ecology Intern",
    period: "Summer 2023",
    description:
      "Applied ML and statistical modeling to genomic and ecological datasets at Stanford's marine research station. Built viral-genome BLAST search algorithms increasing hit rates by 34%, and modeled White Shark migration in collaboration with the Monterey Bay Aquarium. Also investigated the safety profile of viral DNA as a sunscreen compound.",
    tags: ["Computational Biology", "R", "Bioinformatics", "ML", "Genomics"],
    current: false,
    paper: {
      field: "Microbiology · Computational Biology",
      title: "New Pseudomonas Infections Drive Pf Phage Transmission in CF Airways",
      description:
        "Published in JCI Insight (April 2025). Investigated the relationship between new Pseudomonas aeruginosa infections and Pf bacteriophage transmission in cystic fibrosis airways — combining viral genomic analysis with clinical respiratory data to map phage-host dynamics in CF lung disease.",
      href: "https://insight.jci.org/articles/view/188146",
      image: "/images/projects/jci-phage-figure.png",
    },
  },
  {
    company: "Lawrence Berkeley National Laboratory",
    role: "Materials Science and Engineering Intern",
    period: "Summers 2019–2021",
    description:
      "Built supervised learning algorithms and computational visualizations of treated nanoparticles for innovative water filtration research. Reconstructed nanoparticle structures from experimental data using Matlab and Tomviz.",
    tags: ["Matlab", "Supervised Learning", "Materials Science", "Visualization"],
    current: false,
  },
  {
    company: "Lindsay Wildlife Experience",
    role: "Nonprofit Board Member & Youth Program Manager",
    period: "2017–2022",
    description:
      "Volunteered at and later joined the board of a nonprofit wildlife rescue and rehabilitation center. Promoted early to shift lead, managing teams of 3-5 volunteers; served as youth program liaison and helped organize fundraising events.",
    tags: ["Leadership", "Nonprofit", "Volunteer Management"],
    current: false,
  },
];

type Paper = { field: string; title: string; description: string; href: string; image: string };

export default function Experience() {
  return (
    <section id="experience" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs mb-4">
            Experience
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
            Where I&apos;ve spent
            <br />
            <span className="italic">my summers.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 md:left-6 top-0 bottom-0 w-px bg-stone-200" />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <div key={i} className="relative flex gap-8 md:gap-12 pl-10 md:pl-16">
                {/* Dot */}
                <div
                  className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    exp.current
                      ? "bg-teal-600 border-teal-600"
                      : "bg-white border-stone-300"
                  }`}
                >
                  {exp.current && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl p-6 border border-stone-200 hover:border-teal-200 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-lg">{exp.company}</h3>
                      <p className="text-stone-500 text-sm">{exp.role}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        exp.current
                          ? "bg-teal-50 text-teal-700 border border-teal-100"
                          : "bg-stone-50 text-stone-500 border border-stone-200"
                      }`}
                    >
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                  {"note" in exp && exp.note && (
                    <p className="mt-4 text-xs text-stone-400 italic">{exp.note as string}</p>
                  )}
                  {"paper" in exp && exp.paper && (() => {
                    const p = exp.paper as Paper;
                    return (
                      <div className="mt-6 pt-5 border-t border-stone-100">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Published Research</p>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col md:flex-row gap-6 group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">{p.field}</span>
                            <h5 className="font-serif text-lg font-bold text-stone-900 leading-snug mb-2 group-hover:text-teal-700 transition-colors">{p.title}</h5>
                            <p className="text-stone-500 text-sm leading-relaxed">{p.description}</p>
                          </div>
                          <div className="md:w-56 lg:w-64 flex-shrink-0">
                            <img src={p.image} alt={p.title} className="w-full rounded-xl border border-stone-200 shadow-sm object-cover" />
                          </div>
                        </a>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
