// app/api/scrape-taxeezy-pages/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";

interface PageData {
  url: string;
  title: string;
  description: string | null;
  h1: string | null;
  headings: { level: string; text: string }[];
  paragraphs: string[];
  links: { text: string; href: string }[];
  images: { alt: string; src: string }[];
}

/**
 * API endpoint to scrape data from all Taxeezy pages in the sitemap
 */
export async function GET() {
  try {
    // First, fetch the sitemap data through our existing API
    const sitemapResponse = await axios.get(
      "http://localhost:3000/api/taxeezy-sitemap"
    );
    const sitemapData = sitemapResponse.data;
    const urls = sitemapData.urls.map((item: { url: string }) => item.url);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const results: PageData[] = [];

    try {
      // Process each URL with a concurrency limit
      const concurrencyLimit = 3; // Process this many pages at once

      // Create chunks of URLs to process in batches
      const urlChunks = [];
      for (let i = 0; i < urls.length; i += concurrencyLimit) {
        urlChunks.push(urls.slice(i, i + concurrencyLimit));
      }

      // Process each chunk
      for (const chunk of urlChunks) {
        const promises = chunk.map(async (url: string) => {
          const pageData = await scrapeUrl(browser, url);
          return pageData;
        });

        // Wait for all promises in this chunk to resolve
        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
      }
    } finally {
      await browser.close();
    }

    return NextResponse.json({
      totalPages: results.length,
      pages: results,
    });
  } catch (error) {
    console.error("Error scraping Taxeezy pages:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape pages",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Scrape a single URL using Puppeteer
 */
async function scrapeUrl(browser: Browser, url: string): Promise<PageData> {
  const page = await browser.newPage();

  // Set a reasonable timeout
  page.setDefaultNavigationTimeout(30000);

  // Set up page with user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const pageData: PageData = {
    url,
    title: "",
    description: null,
    h1: null,
    headings: [],
    paragraphs: [],
    links: [],
    images: [],
  };

  try {
    // Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract page title
    pageData.title = await page.title();

    // Extract meta description
    pageData.description = await page.evaluate(() => {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      return metaDescription ? metaDescription.getAttribute("content") : null;
    });

    // Extract H1
    pageData.h1 = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.textContent?.trim() ?? null : null;
    });

    // Extract all headings
    pageData.headings = await page.evaluate(() => {
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      );
      return headings.map((heading) => ({
        level: heading.tagName.toLowerCase(),
        text: heading.textContent?.trim() || "",
      }));
    });

    // Extract paragraphs (limit to first 10 for brevity)
    pageData.paragraphs = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll("p"));
      return paragraphs
        .filter((p) => p.textContent?.trim())
        .slice(0, 10)
        .map((p) => p.textContent?.trim() || "");
    });

    // Extract links (limit to first 20 for brevity)
    pageData.links = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      return links
        .filter(
          (link) =>
            link.getAttribute("href") &&
            !link.getAttribute("href")?.startsWith("#")
        )
        .slice(0, 20)
        .map((link) => ({
          text: link.textContent?.trim() || "",
          href: link.getAttribute("href") || "",
        }));
    });

    // Extract images (limit to first 10 for brevity)
    pageData.images = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      return images
        .filter((img) => img.getAttribute("src"))
        .slice(0, 10)
        .map((img) => ({
          alt: img.getAttribute("alt") || "",
          src: img.getAttribute("src") || "",
        }));
    });
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    // If there's an error, we still return the partial data with the URL
  } finally {
    await page.close();
  }

  return pageData;
}
