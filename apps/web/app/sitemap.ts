import type { MetadataRoute } from "next";
import { unstable_noStore } from "next/cache";
import { sanityFetch } from "@/sanity/lib/fetch";
import { postSlugsQuery } from "@/sanity/lib/queries";

async function getBlogPosts() {
  const posts = await sanityFetch<{ slug: string; date: string }[]>({
    query: postSlugsQuery,
  });
  return posts.map((post) => ({
    url: `https://www.inboxai.live/blog/post/${post.slug}`,
    lastModified: new Date(post.date),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // to try fix caching issue: https://github.com/vercel/next.js/discussions/56708#discussioncomment-10127496
  unstable_noStore();

  const blogPosts = await getBlogPosts();

  const staticUrls = [
    {
      url: "https://www.inboxai.live/",
      priority: 1,
    },
    {
      url: "https://www.inboxai.live/bulk-email-unsubscriber",
    },
    {
      url: "https://www.inboxai.live/ai-automation",
    },
    {
      url: "https://www.inboxai.live/email-analytics",
    },
    {
      url: "https://www.inboxai.live/block-cold-emails",
    },
    {
      url: "https://www.inboxai.live/new-email-senders",
    },
    {
      url: "https://www.inboxai.live/privacy",
    },
    {
      url: "https://www.inboxai.live/terms",
    },
    {
      url: "https://www.inboxai.live/blog",
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://www.inboxai.live/blog/post/alternatives-to-skiff-mail",
    },
    {
      url: "https://www.inboxai.live/blog/post/best-email-unsubscribe-app",
    },
    {
      url: "https://www.inboxai.live/blog/post/bulk-unsubscribe-from-emails",
    },
    {
      url: "https://www.inboxai.live/blog/post/escape-email-trap-unsubscribe-for-good",
    },
    {
      url: "https://docs.inboxai.live/",
    },
    {
      url: "https://docs.inboxai.live/introduction",
    },
    {
      url: "https://docs.inboxai.live/essentials/email-ai-automation",
    },
    {
      url: "https://docs.inboxai.live/essentials/bulk-email-unsubscriber",
    },
    {
      url: "https://docs.inboxai.live/essentials/cold-email-blocker",
    },
  ];

  return [...staticUrls, ...blogPosts];
}
