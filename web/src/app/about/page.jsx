import PageShell from "@/components/marketing/PageShell";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

export const metadata = {
  title: "About — Cross-Post",
  description:
    "What Cross-Post is, who builds it, who it is for, and how to get in touch.",
};

const PLATFORMS = [
  "Twitter/X",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Reddit",
  "Telegram",
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="About Cross-Post"
      intro="Cross-Post is a social media management app for people who publish the same content in more than one place."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-white text-lg font-bold mb-3">What it does</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Anyone running several social accounts ends up doing the same job over and over: write
            something, post it, then open the next app and post it again, reformatting as you go.
            Cross-Post removes that repetition. You compose once, choose the accounts you want, and
            the app delivers to each platform in the format that platform expects. It also handles
            the work around the post itself, including scheduling, watermarking your media, adapting
            captions to different length limits, and recording what happened on every destination.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-bold mb-3">Who it is for</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-4">
            Cross-Post is built for people who publish frequently and cannot afford to spend their
            day reposting:
          </p>
          <ul className="space-y-2">
            {[
              "News and sports pages that need the same story live everywhere within minutes.",
              "Creators and small brands maintaining a presence on several networks at once.",
              "Social media managers publishing on behalf of someone else, with a record of who posted what.",
              "Small teams that share one set of connected accounts and need to see how each person is performing.",
            ].map((line) => (
              <li key={line} className="text-neutral-400 text-sm leading-relaxed flex gap-2">
                <span className="text-green-400 mt-0.5">&bull;</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-bold mb-3">Platforms we support</h2>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-neutral-300 text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white text-lg font-bold mb-3">How we handle your data</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Connecting a platform uses that platform&apos;s own sign-in. Cross-Post receives an
            access token scoped to the permissions you approve and never sees your social media
            passwords. Those tokens are used for one purpose: publishing the content you explicitly
            choose to publish, and reporting back whether it worked. We do not sell your data or use
            it to build advertising profiles, and you can disconnect any platform or delete your
            account and its data from inside the app at any time. The full detail is in our{" "}
            <a href="/privacy" className="text-green-400 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-bold mb-3">Who builds it</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Cross-Post is built and maintained by an independent developer, Olumide Akinwumi. It is
            an actively developed product rather than a finished one, and feedback from the people
            using it drives what gets built next.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-bold mb-3">Contact</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            For support, questions, bug reports, partnership or press enquiries, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-green-400 hover:underline">
              {SUPPORT_EMAIL}
            </a>
            . You can also browse common questions on our{" "}
            <a href="/support" className="text-green-400 hover:underline">
              support page
            </a>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
