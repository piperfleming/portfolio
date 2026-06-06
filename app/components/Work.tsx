"use client";
import { useState, useRef, useEffect } from "react";

type Tab = "cs" | "oracle" | "teaching" | "corevc";

/* ── Data ─────────────────────────────────────────────────────────── */

const csProjects = [
  {
    id: "senior-project",
    title: "Neural News (N²)",
    field: "Full-Stack · AI",
    course: "CS 194W: Software Project, Stanford University",
    collaborators: ["Eva Geierstanger", "Kenny Lam", "Jack Zhang"],
    description:
      "Built an AI-powered news aggregation platform that delivers exponential news in constant reading time. A FastAPI backend scrapes and ingests articles, generates LLM summaries and tags, and serves a personalized feed with like, save, and search features. Deployed with Docker Compose and backed by PostgreSQL, with a lightweight HTML/CSS/JS frontend.",
    tags: ["FastAPI", "Python", "PostgreSQL", "Docker", "OpenAI", "Full-Stack"],
    links: [
      { label: "Live Site", href: "https://diplomatic-contentment-production-1daa.up.railway.app" },
      { label: "GitHub", href: "https://github.com/piperfleming/neural-news" },
    ],
    image: "/images/projects/neural-news-hero.png",
  },
  {
    id: "llm-bias",
    title: "How Large Language Models Encode Demographic Identity",
    field: "Computer Science · Machine Learning",
    course: "CS 281- Advanced Machine Learning, Stanford",
    description:
      "Investigated whether LLMs systematically shift Big Five personality representations when conditioned on demographic attributes. Used the PANDORA Reddit dataset with 500 users across 4 prompt conditions (baseline, demographic hint, explicit, and combined). Found evidence of consistent demographic encoding that raises questions about fairness and identity in AI systems.",
    tags: ["Python", "LLMs", "NLP", "Experimental Design", "Statistics"],
    links: [{ label: "Paper", href: "/papers/llm-bias.pdf" }],
  },
  {
    id: "quantum-chem",
    title: "Quantum Coherence in Rare Earth Metal Complexes: A Computational Study",
    field: "Chemistry · Physics",
    course: "CHEM 161: Computational Chemistry, Stanford University",
    description:
      "Used DFT simulations (B3LYP/6-31G basis set in Gaussian) to investigate five chemical properties governing quantum coherence in rare earth metal hydration complexes: electron shielding, electron-phonon interaction, hyperfine interactions, spin-orbit coupling, and optical coherence. Explored rare earth metals as candidate qubit materials for quantum computing, finding that coordination number influences both system size and resulting electron shielding magnitude.",
    tags: ["Quantum Chemistry", "DFT", "Gaussian", "Computational Chemistry", "Physics"],
    links: [{ label: "Paper", href: "/papers/161-writeup.pdf" }],
    image: "/images/projects/chem161-molecules.png",
  },
  {
    id: "assumption-mirror",
    title: "Assumption Mirror",
    field: "Human-AI Interaction · Product",
    course: "AI & Business, Stanford University",
    collaborators: ["Meghna Vasudeva", "Delila Kidanu"],
    description:
      "Built an interactive tool that surfaces the invisible mental model an AI builds about its user — making hidden assumptions visible through a 5-step process: asking the AI to reveal its working theory, structuring its assumptions, generating a visual representation of how it imagines you look, iterating corrections until it's accurate, then analyzing the gap between assumption and reality. Uses Claude for assumption extraction and OpenAI for image generation.",
    tags: ["Next.js", "TypeScript", "Claude API", "OpenAI", "Human-AI Interaction", "Product"],
    links: [{ label: "GitHub", href: "https://github.com/piperfleming/ai_and_power" }],
    video: "/videos/assumption-mirror-demo.mp4",
  },
  {
    id: "obesity-vis",
    title: "The Obesity Myth: Why Our Assumptions About Obesity Deserve a Closer Look",
    field: "Data Visualization · Public Health",
    course: "CS 448: Data Visualization, Stanford University",
    collaborators: ["Elsa Bosemark", "Finn Staeblein"],
    description:
      "A scrollytelling data visualization that challenges common assumptions about obesity by putting them against the data. Built with D3.js, the piece walks through global obesity prevalence trends, the rise of GLP-1 medications, and the gap between public narrative and empirical evidence- guiding readers through interactive maps and charts that reframe how we think about the obesity epidemic.",
    tags: ["D3.js", "JavaScript", "Data Visualization", "Scrollytelling", "Public Health"],
    links: [
      { label: "Live Site", href: "https://piper-obesity-myth.netlify.app" },
      { label: "GitHub", href: "https://github.com/elsa-bosemark/CS448_Final_Project" },
    ],
    image: "/images/projects/obesity-vis-hero.png",
  },
  {
    id: "classy",
    title: "Classy",
    field: "Mobile Development · HCI",
    course: "CS 278: Social Computing, Stanford University",
    collaborators: ["Amanda Foess", "Evy Shen", "Caeley Woo"],
    description:
      "A social mobile app that turns course selection into a community activity. Users rank their classes on quantitative and qualitative dimensions (difficulty, enjoyment, overall score), follow friends to see their rankings, recommend courses, and send friend requests — all backed by Firebase for real-time sync and authentication. Built with React Native and Expo.",
    tags: ["React Native", "Expo", "Firebase", "Mobile", "Social", "HCI"],
    links: [{ label: "GitHub", href: "https://github.com/AmandaFoess/Classy/tree/07c3523cff36003ee3307bbc228dc7effed726dd" }],
    image: "/images/projects/classy-ranking.png",
  },
  {
    id: "cs-project",
    title: "Learning 3D Structure in Irradiated Lithium Fluoride via Masked Autoencoders",
    field: "Computer Science · Particle Physics",
    course: "CS 231N: Deep Learning for Computer Vision, Stanford University",
    collaborators: ["Carolyn Hellerqvist Smith"],
    description:
      "Built a self-supervised learning framework using masked autoencoders (MAE) to detect nuclear recoil-induced defect tracks in LiF crystals imaged with light-sheet fluorescence microscopy, in collaboration with the PALEOCCENE particle physics collaboration. The system tokenizes 3D microscopy volumes and trains a transformer encoder to learn spatial representations of rare particle interaction signatures- supporting automated detection of dark matter and neutrino events at scale. Initial results showed strong background reconstruction, with masking ratio sensitivity exposing the core challenge of sparse signal recovery.",
    tags: ["Computer Vision", "Deep Learning", "Transformers", "Self-supervised Learning", "Particle Physics", "3D Imaging"],
    links: [{ label: "Paper", href: "/papers/cs231n-lif-mae.pdf" }],
    image: "/images/projects/cs231n-architecture.png",
  },
];

const oracleMedia = [
  { id: 1, caption: "Add caption here" },
  { id: 2, caption: "Add caption here" },
  { id: 3, caption: "Add caption here" },
  { id: 4, caption: "Add caption here" },
  { id: 5, caption: "Add caption here" },
  { id: 6, caption: "Add caption here" },
];

const taRoles = [
  {
    course: "BUSGEN 116: FREE SYSTEMS — Preserving Liberty in an Algorithmic Era",
    description:
      "Served as Technical Coordinator for a Stanford GSB course exploring how AI is remaking how societies inform themselves, make decisions, and govern. Students built AI agents, stress-tested them for political bias, traded on live prediction markets, and ran governance simulations — each equipped with a Claude Code subscription and funded API key. Co-taught with Professor Andy Hall; ran weekly debugging drop-ins and supported students through vibe-coding prototypes on democracy, news bias, and decentralized rule-making.",
    quarters: ["Spring 2026"],
    students: "~30 students",
    topics: ["AI Governance", "Political Bias", "Prediction Markets", "Agents", "Claude Code", "Democracy"],
    press: [
      {
        outlet: "Poets & Quants",
        title: "Training AI To Govern For Us: How This Stanford GSB Class Experiments With Building AI Agents",
        href: "https://poetsandquants.com/2026/04/30/training-ai-to-govern-for-us-how-this-stanford-gsb-class-experiments-with-building-ai-agents/",
        image: "/images/projects/pq-article.jpg",
        description: "Stanford GSB students trained personalized AI agents to represent their political preferences and tested whether those agents could deliberate together in a simulated legislature — with surprising results.",
      },
    ],
    demos: [
      { week: 2, src: "/videos/ta-demo-week2.mp4" },
      { week: 4, src: "/videos/ta-demo-week4.mp4" },
      { week: 5, src: "/videos/ta-demo-week5.mp4" },
    ],
  },
  {
    course: "EE 205: Product Management for Engineers in the AI Era",
    description: "Syllabus in progress — details coming soon.",
    quarters: ["Winter 2027"],
    students: "~30 students",
    topics: ["Product Management", "AI", "Engineering"],
  },
];

/* ── Tab content ──────────────────────────────────────────────────── */

function CSTab({ jumpToId }: { jumpToId: string | null }) {
  useEffect(() => {
    if (!jumpToId) return;
    const el = document.getElementById(jumpToId);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [jumpToId]);

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-3">
          CS & Beyond
        </h3>
        <p className="text-stone-500 leading-relaxed">
          My work spans a lot of territory. Here&apos;s a look at projects and
          research across computer science, economics, chemistry, and more- because
          the most interesting problems don&apos;t stay in one box.
        </p>
      </div>

      <div>
        {csProjects.map((project, i) => (
          <div key={project.id}>
            <div id={project.id} className="py-10 scroll-mt-24">
              <div className={("image" in project && project.image) || ("video" in project && project.video) ? "flex flex-col md:flex-row gap-8" : ""}>
                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">
                      {project.field}
                    </span>
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-stone-900 leading-snug mb-1">
                    {project.title}
                  </h4>
                  <p className="text-xs text-stone-400 italic mb-1">{project.course}</p>
                  {"collaborators" in project && Array.isArray(project.collaborators) && project.collaborators.length > 0
                    ? <p className="text-xs text-stone-400 mb-4">With {(project.collaborators as string[]).join(", ")}</p>
                    : <div className="mb-4" />
                  }
                  <p className="text-stone-500 leading-relaxed mb-6 max-w-3xl">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((t) => (
                        <span key={t} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.links.map((l) => (
                        <a
                          key={l.label}
                          href={l.href}
                          target={l.href.startsWith("http") ? "_blank" : undefined}
                          rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors underline underline-offset-2"
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Project image */}
                {"video" in project && project.video ? (
                  <div className="md:w-72 lg:w-80 flex-shrink-0">
                    <video
                      src={project.video as string}
                      className="w-full rounded-xl border border-stone-200 shadow-sm"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                ) : "image" in project && project.image ? (
                  <div className="md:w-72 lg:w-80 flex-shrink-0">
                    <img
                      src={project.image as string}
                      alt={project.title}
                      className="w-full rounded-xl border border-stone-200 shadow-sm object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
            {i < csProjects.length - 1 && (
              <hr className="border-stone-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OracleTab() {
  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-3">
          Oracle
        </h3>
        <p className="text-stone-500 leading-relaxed">
          A brief description of your time at Oracle- what you worked on, what
          you learned, and what made it meaningful.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {oracleMedia.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200"
          >
            <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
              <p className="text-white text-xs font-medium">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeachingTab() {
  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-3">
          Teaching
        </h3>
        <p className="text-stone-500 leading-relaxed">
          Teaching is one of the best ways to deepen your own understanding.
          Here&apos;s where I&apos;ve had the chance to do that at Stanford.
        </p>
      </div>
      <div className="space-y-6">
        {taRoles.map((role, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-teal-200 transition-colors"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <h4 className="font-semibold text-stone-900 text-lg">{role.course}</h4>
              <div className="flex flex-wrap gap-2">
                {role.quarters.map((q) => (
                  <span key={q} className="text-xs font-medium px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                    {q}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-3">{role.description}</p>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-xs text-stone-400 font-medium">{role.students}</span>
              <div className="flex flex-wrap gap-2">
                {role.topics.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {"demos" in role && Array.isArray(role.demos) && role.demos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Student demos</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(role.demos as { week: number; src: string }[]).map((d) => (
                    <div key={d.week} className="rounded-xl overflow-hidden border border-stone-200">
                      <video src={d.src} className="w-full" controls muted playsInline preload="metadata" />
                      <p className="text-xs text-stone-400 font-medium text-center py-2">Week {d.week}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {"press" in role && Array.isArray(role.press) && role.press.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-100">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Press</p>
                {(role.press as { outlet: string; title: string; href: string; image: string; description: string }[]).map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col md:flex-row gap-6 group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">{p.outlet}</span>
                      <h5 className="font-serif text-xl font-bold text-stone-900 leading-snug mb-2 group-hover:text-teal-700 transition-colors">{p.title}</h5>
                      <p className="text-stone-500 text-sm leading-relaxed">{p.description}</p>
                    </div>
                    <div className="md:w-72 lg:w-80 flex-shrink-0">
                      <img src={p.image} alt={p.title} className="w-full rounded-xl border border-stone-200 shadow-sm object-cover" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CoreVCTab() {
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <p className="text-stone-400 text-sm italic">This work is confidential and can&apos;t be shared publicly.</p>
    </div>
  );
}

/* ── Dropdown Tab Bar ─────────────────────────────────────────────── */

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  dropdown?: { id: string; title: string }[];
  onDropdownSelect?: (id: string) => void;
}

function TabButton({ label, active, onClick, dropdown, onDropdownSelect }: TabButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!dropdown) {
    return (
      <button
        onClick={onClick}
        className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative -mb-px ${
          active
            ? "text-teal-700 border-b-2 border-teal-600 bg-white"
            : "text-stone-500 hover:text-stone-800 border-b-2 border-transparent"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center rounded-t-lg transition-colors -mb-px border-b-2 ${
          active ? "border-teal-600 bg-white" : "border-transparent"
        }`}
      >
        {/* Tab label- clicking activates the tab */}
        <button
          onClick={onClick}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            active ? "text-teal-700" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {label}
        </button>

        {/* Chevron- clicking opens the dropdown */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className={`pr-3 py-2.5 transition-colors ${
            active ? "text-teal-400 hover:text-teal-700" : "text-stone-400 hover:text-stone-600"
          }`}
          aria-label="Browse projects"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-stone-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
          <p className="px-4 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
            Jump to
          </p>
          {dropdown.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onClick();
                onDropdownSelect?.(item.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Work Component ─────────────────────────────────────────── */

export default function Work() {
  const [active, setActive] = useState<Tab>("cs");
  const [jumpToId, setJumpToId] = useState<string | null>(null);

  const handleDropdownSelect = (id: string) => {
    setActive("cs");
    setJumpToId(id);
    setTimeout(() => setJumpToId(null), 500);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "cs", label: "CS & Beyond" },
    { id: "oracle", label: "Oracle" },
    { id: "teaching", label: "Teaching" },
  ];

  return (
    <section id="work" className="py-28 bg-[#F9F8F6]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs mb-4">
            Work & Projects
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
            What I&apos;ve built,
            <br />
            <span className="italic">taught, and explored.</span>
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 border-b border-stone-200 mb-10">
          {tabs.map((tab) =>
            tab.id === "cs" ? (
              <TabButton
                key={tab.id}
                label={tab.label}
                active={active === tab.id}
                onClick={() => setActive(tab.id)}
                dropdown={csProjects.map((p) => ({ id: p.id, title: p.title }))}
                onDropdownSelect={handleDropdownSelect}
              />
            ) : (
              <TabButton
                key={tab.id}
                label={tab.label}
                active={active === tab.id}
                onClick={() => setActive(tab.id)}
              />
            )
          )}
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {active === "cs" && <CSTab jumpToId={jumpToId} />}
          {active === "oracle" && <OracleTab />}
          {active === "teaching" && <TeachingTab />}
          {active === "corevc" && <CoreVCTab />}
        </div>
      </div>
    </section>
  );
}
