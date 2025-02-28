// app/api/taxeezy-sitemap/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { parseStringPromise } from "xml2js";

interface SitemapUrl {
  loc: string[];
  lastmod?: string[];
  changefreq?: string[];
  priority?: string[];
}

interface ParsedSitemap {
  urlset?: {
    url: SitemapUrl[];
    $?: {
      xmlns?: string;
    };
  };
}

export async function GET() {
  try {
    const sitemapUrl =
      "https://taxeezy.co.uk/assets/sitemaps/sitemap-pages.xml";
    const response = await axios.get(sitemapUrl);
    const sitemapXml = response.data;

    // Parse the XML to JSON
    const parsedSitemap = (await parseStringPromise(
      sitemapXml
    )) as ParsedSitemap;

    // Format the data in a more user-friendly structure
    if (parsedSitemap.urlset && parsedSitemap.urlset.url) {
      const formattedUrls = parsedSitemap.urlset.url.map((urlEntry) => {
        return {
          url: urlEntry.loc[0],
          lastmod: urlEntry.lastmod ? urlEntry.lastmod[0] : null,
          changefreq: urlEntry.changefreq ? urlEntry.changefreq[0] : null,
          priority: urlEntry.priority ? urlEntry.priority[0] : null,
        };
      });

      return NextResponse.json({
        hostname: "taxeezy.co.uk",
        sitemapUrl: sitemapUrl,
        totalUrls: formattedUrls.length,
        urls: formattedUrls,
      });
    }

    // Return error if the sitemap structure is not as expected
    return NextResponse.json(
      { error: "Invalid sitemap structure" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching Taxeezy sitemap:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sitemap",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
