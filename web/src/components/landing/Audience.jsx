import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";

const AUDIENCES = [
  {
    title: "Creators",
    body: "Drop a video or a thought and have it on every channel you grow, not just the one you opened.",
    image: "/images/audience-reviewer.webp",
    alt: "A tech reviewer filming a phone review in his studio",
  },
  {
    title: "Small businesses",
    body: "Post today's stock, offers and opening hours to all your pages between customers.",
    image: "/images/audience-florist.webp",
    alt: "A florist checking her tablet outside her flower shop",
  },
  {
    title: "Fashion and retail",
    body: "Shoot the new collection once and schedule the launch across every platform at the same time.",
    image: "/images/audience-fashion.webp",
    alt: "A fashion designer photographing fabric samples with her phone",
  },
  {
    title: "Beauty and services",
    body: "Share before-and-afters the moment the client leaves the chair, with your logo already on them.",
    image: "/images/audience-beauty.webp",
    alt: "A makeup artist photographing her client's finished look",
  },
];

export default function Audience() {
  return (
    <section className="px-4 md:px-6 py-24 md:py-32 border-t border-line">
      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <SectionHeading
            eyebrow="Who it's for"
            title="For people who post for a living, or for their business."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {AUDIENCES.map((audience, index) => (
            <Reveal as="article" key={audience.title} delay={index * 110}>
              <div className="rounded-2xl overflow-hidden bg-sand aspect-[4/5]">
                <img
                  src={audience.image}
                  alt={audience.alt}
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="font-display text-ink text-2xl mt-5">
                {audience.title}
              </h3>
              <p className="text-ink-soft text-[15px] leading-relaxed mt-2">{audience.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
