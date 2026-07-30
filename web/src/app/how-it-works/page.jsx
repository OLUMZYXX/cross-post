import PageShell from "@/components/marketing/PageShell";

export const metadata = {
  title: "How it works — Cross-Post",
  description:
    "A step by step guide to Cross-Post: create an account, connect your social platforms, compose a post, publish or schedule it, and review how it performed.",
};

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    body: "Sign up with an email and password, or continue with Google or Apple. Your account is what holds your connected platforms, drafts and posting history.",
  },
  {
    step: "02",
    title: "Connect your platforms",
    body: "Open Settings, then Connected Accounts, and authorize the networks you publish to. Each connection uses the platform's own secure sign-in, so Cross-Post never sees or stores your social passwords. You can disconnect any platform at any time.",
    detail: [
      "Twitter/X, LinkedIn, TikTok, YouTube and Reddit connect with a single authorization.",
      "Facebook lists the Pages you manage so you can pick which Page receives your posts.",
      "Instagram requires a Business or Creator account linked to a Facebook Page.",
      "Telegram connects by adding your bot as an admin of the channel you post to.",
    ],
  },
  {
    step: "03",
    title: "Write your post",
    body: "Type or paste your caption in the composer and attach photos or a video if you want them. Tap Rephrase to have the caption rewritten in the tone you choose, or tailor it so each platform gets a version that fits its own length limit.",
    detail: [
      "The character counter warns you before a caption is too long for a selected platform.",
      "A watermark is applied automatically to your media if you have one set up.",
      "Tap an attached image to preview exactly how it will look when published.",
    ],
  },
  {
    step: "04",
    title: "Choose where it goes",
    body: "Select any combination of your connected accounts. Cross-Post shows what each platform supports, so you know in advance if a network cannot take video or has a tight caption limit.",
  },
  {
    step: "05",
    title: "Publish now or schedule it",
    body: "Publish immediately, or pick a date and time and Cross-Post sends it for you. Before anything goes out you can run the copyright check, and Cross-Post warns you if the same story was already published recently.",
  },
  {
    step: "06",
    title: "See how it performed",
    body: "Every post records the outcome for each platform. Analytics shows your published and scheduled totals, success rate, weekly activity and which platforms you use most. If a platform failed, retry just that one.",
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell
      eyebrow="How it works"
      title="From one caption to every timeline"
      intro="Cross-Post replaces the copy, paste and repeat routine. Here is the full flow, from creating an account to reviewing your results."
    >
      <div className="space-y-10">
        {STEPS.map((item) => (
          <section key={item.step} className="flex gap-5">
            <div className="shrink-0">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-sm font-bold">{item.step}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold mb-2">{item.title}</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.body}</p>
              {item.detail ? (
                <ul className="mt-3 space-y-1.5">
                  {item.detail.map((line) => (
                    <li key={line} className="text-neutral-500 text-sm leading-relaxed flex gap-2">
                      <span className="text-green-400 mt-0.5">&bull;</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="text-white text-lg font-bold mb-2">Requirements</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Cross-Post runs on iOS and Android. You need an account on each social platform you want
          to publish to, and permission to post on any Page or channel you connect. Publishing
          depends on those platforms&apos; own APIs and rate limits, so a network can occasionally
          reject a post for reasons outside the app&apos;s control. When that happens Cross-Post
          shows the reason and lets you retry.
        </p>
      </section>
    </PageShell>
  );
}
