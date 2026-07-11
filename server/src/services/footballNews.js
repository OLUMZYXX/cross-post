const FEEDS = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports" },
  { url: "https://www.theguardian.com/football/rss", source: "The Guardian" },
];

const TTL = 90 * 1000;
let cache = { items: [], at: 0 };

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function stripHtml(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function firstImage(block) {
  const media = block.match(
    /<(?:media:content|media:thumbnail|enclosure)[^>]*\burl=["']([^"']+)["']/i,
  );
  if (media && /\.(jpg|jpeg|png|webp)/i.test(media[1])) return media[1];

  const img = block.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (img) return img[1];

  if (media) return media[1];
  return null;
}

function parseFeed(xml, source) {
  const items = [];
  const parts = xml.split(/<item[\s>]/i).slice(1);
  for (const part of parts) {
    const block = part.split(/<\/item>/i)[0];
    const title = stripHtml(tag(block, "title"));
    if (!title) continue;
    let link = tag(block, "link");
    if (!link) {
      const m = block.match(/<link[^>]*href="([^"]+)"/i);
      link = m ? m[1] : "";
    }
    const pub = tag(block, "pubDate") || tag(block, "dc:date");
    items.push({
      title,
      link,
      source,
      image: firstImage(block),
      summary: stripHtml(tag(block, "description")).slice(0, 240),
      publishedAt: pub ? new Date(pub).toISOString() : null,
    });
  }
  return items;
}

export async function getFootballNews() {
  if (cache.items.length && Date.now() - cache.at < TTL) return cache.items;

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "CrossPost/1.0 (+https://cross-post-web.vercel.app)" },
      });
      if (!res.ok) return [];
      return parseFeed(await res.text(), feed.source);
    }),
  );

  const seen = new Set();
  const items = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((i) => {
      const key = i.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 40);

  if (items.length) cache = { items, at: Date.now() };
  return items;
}
