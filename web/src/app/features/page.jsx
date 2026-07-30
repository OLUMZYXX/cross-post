import PageShell from "@/components/marketing/PageShell";

export const metadata = {
  title: "Features — Cross-Post",
  description:
    "Everything Cross-Post does: publish to eight platforms at once, schedule posts, tailor captions per platform with AI, add watermarks, and track performance.",
};

const GROUPS = [
  {
    title: "Publish everywhere at once",
    items: [
      {
        name: "Eight platforms, one composer",
        body: "Write your post once and send it to Twitter/X, Instagram, Facebook, LinkedIn, TikTok, YouTube, Reddit and Telegram. Select any combination of connected accounts before publishing.",
      },
      {
        name: "Multiple accounts per platform",
        body: "Connect more than one account on the same platform and choose which ones receive each post. Facebook Pages you manage are listed individually so you can target a specific Page.",
      },
      {
        name: "Photos and video",
        body: "Attach up to ten images or a single video. Media is optimised for delivery and each platform receives the format it expects, including Instagram Reels for video.",
      },
      {
        name: "Delivery status per platform",
        body: "Every post records whether it succeeded on each destination, with the reason when a platform rejects it, plus a one-tap retry for the platforms that failed.",
      },
    ],
  },
  {
    title: "Write faster with AI",
    items: [
      {
        name: "Rephrase in any tone",
        body: "Rewrite a caption as professional, casual, witty, bold, inspirational and more. The rewrite keeps your facts intact and is original, so reposted news does not read as a copy of the source.",
      },
      {
        name: "Tailored captions per platform",
        body: "One caption becomes the right caption for every network. Short and punchy where limits are tight, fuller where the platform allows more, all from the same source text and always finishing on a complete sentence.",
      },
      {
        name: "Copyright checker",
        body: "Before a post goes out, Cross-Post can scan your caption and images for song lyrics, trademarked slogans, stock watermarks and other material that puts an account at risk, and offer a safe rewrite.",
      },
      {
        name: "Duplicate detection",
        body: "If the same story has already gone out recently, Cross-Post warns you and shows who posted it and when, even if the wording has changed. You can still publish anyway when the update is intentional.",
      },
    ],
  },
  {
    title: "Plan and schedule",
    items: [
      {
        name: "Schedule for later",
        body: "Pick any date and time and Cross-Post publishes for you. Scheduled posts are listed separately so you always know what is queued.",
      },
      {
        name: "Drafts",
        body: "Save a post and come back to it. Drafts keep your caption, media and platform selection exactly as you left them.",
      },
      {
        name: "Share into the app",
        body: "Share a link or text from any other app straight into Cross-Post and it lands in the composer, ready to publish.",
      },
    ],
  },
  {
    title: "Brand and measure",
    items: [
      {
        name: "Automatic watermarks",
        body: "Upload your logo once and Cross-Post applies it to the images and videos you publish, with control over corner, size and opacity.",
      },
      {
        name: "Analytics",
        body: "See how much you publish, your success rate across platforms, weekly activity and which networks you post to most.",
      },
      {
        name: "Team workspaces",
        body: "Invite people to your workspace so they publish through your connected accounts. Every post stays attributed to whoever wrote it, and the owner sees monthly performance and a ranking for each member.",
      },
      {
        name: "Notifications",
        body: "Get told when a post publishes, when one fails, and when a scheduled post is about to go live.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <PageShell
      eyebrow="Features"
      title="Everything Cross-Post can do"
      intro="Cross-Post is a social media management tool for people who publish the same content to several places. Here is what it handles for you."
    >
      <div className="space-y-14">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-white text-xl font-bold mb-6">{group.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <h3 className="text-white text-[15px] font-semibold mb-2">{item.name}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
