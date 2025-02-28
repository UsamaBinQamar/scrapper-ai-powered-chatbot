// app/taxeezy-sitemap/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SitemapUrl {
  url: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

interface SitemapData {
  hostname: string;
  sitemapUrl: string;
  totalUrls: number;
  urls: SitemapUrl[];
}

export default function TaxeezySitemapPage() {
  const [data, setData] = useState<SitemapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch("/api/taxeezy-sitemap");

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const sitemapData = await response.json();
        setData(sitemapData);
      } catch (err) {
        console.error("Error fetching sitemap:", err);
        setError(
          `Failed to load sitemap: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  const downloadJSON = () => {
    if (!data) return;

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(dataBlob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `taxeezy-sitemap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const downloadCSV = () => {
    if (!data) return;

    const headers = ["URL", "Last Modified", "Change Frequency", "Priority"];
    const csvRows = [
      headers.join(","),
      ...data.urls.map((item) => {
        return [
          `"${item.url}"`,
          `"${item.lastmod || ""}"`,
          `"${item.changefreq || ""}"`,
          `"${item.priority || ""}"`,
        ].join(",");
      }),
    ];

    const csvString = csvRows.join("\n");
    const dataBlob = new Blob([csvString], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(dataBlob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `taxeezy-sitemap.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Taxeezy.co.uk Sitemap</h1>
        <p className="text-gray-600">
          View all pages from the Taxeezy website sitemap.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading sitemap...</span>
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

      {data && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Sitemap for {data.hostname}
              </h2>
              <p className="text-sm text-gray-500 break-all">
                Source:{" "}
                <a
                  href={data.sitemapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.sitemapUrl}
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadJSON}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Download JSON
              </button>
              <button
                onClick={downloadCSV}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2 text-gray-700">
              Total URLs: <span className="font-medium">{data.totalUrls}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      URL
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Last Modified
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Change Frequency
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.urls.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td
                        className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: "300px" }}
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title={item.url}
                        >
                          {item.url.replace("https://taxeezy.co.uk", "")}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lastmod || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.changefreq || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.priority || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
