import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Reveal from "@/components/ui/Reveal";

export default function PageShell({ eyebrow, title, intro, width = "max-w-4xl", children }) {
  return (
    <div className="site min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="px-4 md:px-6 pt-14 pb-24 md:pt-20 md:pb-32">
        <div className={`${width} mx-auto`}>
          <Reveal>
            {eyebrow ? <p className="text-leaf text-sm font-medium mb-4">{eyebrow}</p> : null}
            <h1 className="font-display text-ink text-4xl md:text-[3.75rem] leading-[1.02] font-medium tracking-[-0.025em]">
              {title}
            </h1>
            {intro ? (
              <p className="text-ink-soft text-lg md:text-xl leading-relaxed mt-6 max-w-2xl">{intro}</p>
            ) : null}
          </Reveal>
          <Reveal delay={120} className="mt-14">
            {children}
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
