// app/taxeezy-scraper/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface Image {
  alt: string;
  src: string;
}

interface LinkData {
  text: string;
  href: string;
}

interface Heading {
  level: string;
  text: string;
}

interface PageData {
  url: string;
  title: string;
  description: string | null;
  h1: string | null;
  headings: Heading[];
  paragraphs: string[];
  links: LinkData[];
  images: Image[];
}

interface ScraperResults {
  totalPages: number;
  pages: PageData[];
}

export default function TaxeezyScraperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScraperResults | null>(null);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const startScraping = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/scrape-taxeezy-pages");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("##", data);

      setResults(data);
    } catch (err) {
      console.error("Error scraping pages:", err);
      setError(
        `Failed to scrape pages: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(dataBlob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `taxeezy-pages-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const togglePageExpansion = (url: string) => {
    if (expandedPage === url) {
      setExpandedPage(null);
    } else {
      setExpandedPage(url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Taxeezy.co.uk Page Scraper</h1>
        <p className="text-gray-600 mb-4">
          Extract content from all pages in the Taxeezy sitemap
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={startScraping}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? "Scraping Pages..." : "Start Scraping"}
          </button>

          {results && (
            <button
              onClick={downloadJSON}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded transition-colors"
            >
              Download Results
            </button>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-blue-700 font-medium">
              Scraping pages from Taxeezy.co.uk...
            </p>
            <p className="text-blue-600 text-sm mt-2">
              This may take a minute or two
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">
              Scraped {results.totalPages} Pages
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              {results.pages.map((page) => (
                <div
                  key={page.url}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => togglePageExpansion(page.url)}
                  >
                    <div>
                      <h3 className="font-medium">{page.title}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {page.url}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      {expandedPage === page.url ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {expandedPage === page.url && (
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column */}
                        <div>
                          {page.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Description
                              </h4>
                              <p className="text-sm">{page.description}</p>
                            </div>
                          )}

                          {page.h1 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                H1 Heading
                              </h4>
                              <p className="font-medium">{page.h1}</p>
                            </div>
                          )}

                          {page.headings.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Heading Structure
                              </h4>
                              <ul className="list-disc pl-5 text-sm">
                                {page.headings.map((heading, idx) => (
                                  <li
                                    key={idx}
                                    className={`mb-1 ${
                                      heading.level === "h1"
                                        ? "font-medium"
                                        : ""
                                    }`}
                                  >
                                    <span className="text-gray-500">
                                      [{heading.level}]
                                    </span>{" "}
                                    {heading.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {page.images.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Images ({page.images.length})
                              </h4>
                              <ul className="list-disc pl-5 text-sm">
                                {page.images.map((image, idx) => (
                                  <li key={idx} className="mb-1 truncate">
                                    <span className="text-gray-500">Alt:</span>{" "}
                                    {image.alt || "[No alt text]"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Right column */}
                        <div>
                          {page.paragraphs.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Paragraphs (First {page.paragraphs.length})
                              </h4>
                              <div className="text-sm">
                                {page.paragraphs.map((paragraph, idx) => (
                                  <p key={idx} className="mb-2">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {page.links.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Links ({page.links.length})
                              </h4>
                              <ul className="list-disc pl-5 text-sm">
                                {page.links.slice(0, 10).map((link, idx) => (
                                  <li key={idx} className="mb-1 truncate">
                                    <span className="font-medium">
                                      {link.text || "[No text]"}
                                    </span>
                                    :
                                    <span className="text-blue-600">
                                      {" "}
                                      {link.href}
                                    </span>
                                  </li>
                                ))}
                                {page.links.length > 10 && (
                                  <li className="text-gray-500">
                                    ...and {page.links.length - 10} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t text-right">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm inline-flex items-center"
                        >
                          Visit Page
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
