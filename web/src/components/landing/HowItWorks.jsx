import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";

const STEPS = [
  {
    title: "Connect your accounts",
    body: "Sign in to each platform once. Cross-Post never sees your passwords, and you can disconnect any account at any time.",
  },
  {
    title: "Write your post",
    body: "Add your caption, photos or video, then let AI tailor the wording for each platform if you want it to.",
  },
  {
    title: "Publish or schedule",
    body: "Send it everywhere now or pick a time. You get a notification as each platform goes live.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-forest px-4 md:px-6 py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div>
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="How it works"
              title="From draft to every feed in three steps."
            />
          </Reveal>

          <ol className="mt-12 space-y-9">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 130} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className="font-display italic text-mint text-4xl leading-none">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-white text-lg font-semibold">{step.title}</h3>
                  <p className="text-white/65 leading-relaxed mt-1.5">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal variant="right" delay={150} className="rounded-[28px] overflow-hidden aspect-[4/3] bg-forest-soft">
          <img
            src="/images/planning-laptop.webp"
            alt="A man planning his posts on a laptop in a café"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Reveal>
      </div>
    </section>
  );
}
