// app/page.tsx
import SitemapScraper from "@/components/SitemapScraper";

export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Website Sitemap Scraper
        </h1>
        <p className="text-center mb-8 max-w-2xl mx-auto text-gray-600">
          Enter any website URL to discover and extract its sitemap structure.
          The tool will attempt to find sitemaps through robots.txt, common
          locations, or by crawling the homepage.
        </p>
        <SitemapScraper />
      </div>
    </main>
  );
}
