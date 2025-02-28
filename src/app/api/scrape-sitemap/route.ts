// app/api/get-taxeezy-sitemap/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function GET() {
  try {
    const sitemapUrl =
      "https://taxeezy.co.uk/assets/sitemaps/sitemap-pages.xml";
    const response = await axios.get(sitemapUrl);
    const sitemapXml = response.data;

    // Parse the XML to JSON
    const parsedSitemap = await parseStringPromise(sitemapXml);

    return NextResponse.json(parsedSitemap);
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return NextResponse.json(
      { error: "Failed to fetch sitemap" },
      { status: 500 }
    );
  }
}
