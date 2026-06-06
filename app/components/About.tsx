const workTags = [
  "AI Systems",
  "Machine Learning",
  "NLP",
  "Product",
  "Human-AI Interaction",
  "Python",
  "Research",
];

const lifeTags = [
  "🥏 National Silver Medalist",
  "🚴 Santa Cruz mountains",
  "📚 Supernatural reader",
  "🎭 Proud Grinch",
];

export default function About() {
  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Text */}
          <div>
            <p className="text-teal-600 font-medium tracking-[0.2em] uppercase text-xs mb-4">
              About me
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-8">
              Builder. Athlete.
              <br />
              <span className="italic">Curious person.</span>
            </h2>

            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                Hi, I&apos;m Piper! I&apos;m a senior at Stanford studying computer
                science, and I&apos;ll be returning in the fall to pursue my
                master&apos;s in AI. Most of my work revolves around one core
                question:{" "}
                <span className="font-medium text-stone-800">
                  how do we make AI actually work for humans?
                </span>
              </p>
              <p>
                I&apos;m especially interested in the messy space between capability
                and usability- where strong models meet real-world constraints,
                product decisions, and human behavior.
              </p>
              <p>
                I&apos;ve explored this from several angles: in big tech, working in
                Product at{" "}
                <span className="font-medium text-stone-800">Oracle</span>; in
                the classroom, TAing a groundbreaking course at the{" "}
                <span className="font-medium text-stone-800">
                  Stanford Graduate School of Business
                </span>{" "}
                focused on applied AI systems; and this summer, building and
                evaluating AI tooling at{" "}
                <span className="font-medium text-stone-800">Core VC</span>.
              </p>
              <p>
                Across these experiences, I&apos;ve found that the most interesting
                problems aren&apos;t just technical- they&apos;re about judgment,
                communication, and designing systems people actually trust and
                use.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {workTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-stone-200">
              <img
                src="/headshot.jpg"
                alt="Piper Fleming"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-600 rounded-2xl -z-10 opacity-10" />
          </div>
        </div>

        {/* Outside of work — horizontal 3-col */}
        <div className="mt-16 pt-10 border-t border-stone-200">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-6">
            Outside of work
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-stone-600 text-sm leading-relaxed">
            <p>
              I&apos;m an avid athlete and dancer, and I&apos;ve won a{" "}
              <span className="font-medium text-stone-800">silver medal on the national stage</span>{" "}
              with my ultimate frisbee team. On Saturday mornings, you can
              usually find me riding up and racing down the Santa Cruz
              mountains, drinking large milkshakes, getting bike grease all
              over me, and eating pastries (in that order).
            </p>
            <p>
              The celebrity I relate most closely to is The Grinch, who I best
              like to channel by hiding in my room, reading novels at a
              supernaturally fast pace, and stealing Christmas- though the
              only thing I reliably &lsquo;steal&rsquo; is control of the snack menu. At
              my core, I&apos;m energized by being both an athlete and a builder-
              thriving on momentum, challenge, and the people I get to grow
              alongside.
            </p>
            <div className="flex flex-wrap gap-2 content-start">
              {lifeTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-stone-50 text-stone-600 text-xs font-medium rounded-full border border-stone-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
