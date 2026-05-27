import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FeedSource = {
  category: string;
  query: string;
  lane: "personal" | "industry";
};

type GoogleNewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
  lane: "personal" | "industry";
  url: string;
  query: string;
};

const segmentQuery: Record<string, string> = {
  outsourcing: "BPO outsourcing shared services AI automation layoffs jobs",
  fresher: "freshers entry level jobs AI hiring decline automation",
  manager: "middle management AI flattening layoffs restructuring",
  robotics: "warehouse logistics robotics automation jobs layoffs",
};

function cleanQueryPart(value: string | null) {
  return (value ?? "").replace(/[^\w\s&.-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

function buildFeedSources(requestUrl: string): FeedSource[] {
  const url = new URL(requestUrl);
  const company = cleanQueryPart(url.searchParams.get("company"));
  const segment = cleanQueryPart(url.searchParams.get("segment"));
  const role = cleanQueryPart(url.searchParams.get("role"));
  const industryBase = segmentQuery[segment] ?? "AI layoffs OR automation job cuts OR AI replacing jobs";
  const roleQuery = role ? `${role} AI automation layoffs job risk` : industryBase;

  const feeds: FeedSource[] = [
    { category: "Industry", lane: "industry", query: industryBase },
    { category: "Function", lane: "industry", query: roleQuery },
    { category: "Tech", lane: "industry", query: "AI tools automation workforce layoffs jobs" },
    { category: "Managers", lane: "industry", query: "middle management AI layoffs flattening managers" },
  ];

  if (company) {
    feeds.unshift(
      { category: "Company", lane: "personal", query: `"${company}" AI OR automation OR restructuring OR layoffs OR hiring freeze` },
      { category: "Company", lane: "personal", query: `"${company}" latest news workforce OR jobs OR strategy` },
    );
  } else {
    feeds.unshift({ category: "Personal", lane: "personal", query: roleQuery });
  }

  return feeds;
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : "";
}

function readSource(xml: string) {
  const match = xml.match(/<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i);
  return match ? decodeHtml(match[1].trim()) : "Google News";
}

function parseFeed(xml: string, feed: FeedSource) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8);
  return items.map((item): GoogleNewsItem => {
    const body = item[1];
    const title = readTag(body, "title");
    const url = readTag(body, "link");
    const publishedAt = readTag(body, "pubDate");
    const source = readSource(body);
    return {
      id: `${feed.category}-${url || title}`,
      title,
      source,
      publishedAt,
      category: feed.category,
      lane: feed.lane,
      url,
      query: feed.query,
    };
  });
}

async function fetchFeed(feed: FeedSource) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", feed.query);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent": "KarmaMarketPulse/1.0",
      Accept: "application/rss+xml,text/xml",
    },
  });

  if (!response.ok) return [];
  return parseFeed(await response.text(), feed);
}

export async function GET(request: Request) {
  try {
    const feedSources = buildFeedSources(request.url);
    const results = await Promise.all(feedSources.map(fetchFeed));
    const seen = new Set<string>();
    const items = results
      .flat()
      .filter((item) => item.title && item.url)
      .filter((item) => {
        const key = item.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 30);
    const personalItems = items.filter((item) => item.lane === "personal").slice(0, 10);
    const industryItems = items.filter((item) => item.lane === "industry").slice(0, 20);

    return NextResponse.json({
      source: "Google News RSS",
      fetchedAt: new Date().toISOString(),
      items,
      personalItems,
      industryItems,
      disclaimer: "Headlines are publisher-reported items surfaced via Google News RSS. Karma adds no editorial claim to these live items.",
    });
  } catch {
    return NextResponse.json(
      {
        source: "Google News RSS",
        fetchedAt: new Date().toISOString(),
        items: [],
        disclaimer: "Live source feed unavailable. Karma adds no editorial claim to live news items.",
      },
      { status: 503 },
    );
  }
}
