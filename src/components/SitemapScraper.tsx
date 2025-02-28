"use client";

import { useState, useEffect } from "react";

interface SitemapUrl {
  url: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

interface TaxeezySitemapData {
  hostname: string;
  sitemapUrl: string;
  totalUrls: number;
  urls: SitemapUrl[];
}

export default function TaxeezySitemapViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TaxeezySitemapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch("/api/scrape-sitemap");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const sitemapData = await response.json();
        setData(sitemapData);
      } catch (err) {
        console.error("Error fetching Taxeezy sitemap:", err);
        setError("Failed to fetch the Taxeezy sitemap. Please try again.");
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
    a.download = `sitemap-${data.hostname}.json`;
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
    a.download = `sitemap-${data.hostname}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Taxeezy Sitemap Viewer</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3">Loading Taxeezy sitemap, please wait...</p>
        </div>
      )}

      {data && (
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Results for {data.hostname}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={downloadJSON}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Download JSON
              </button>
              <button
                onClick={downloadCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Sitemap Source</h3>
            <p className="break-all text-blue-600">
              <a
                href={data.sitemapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {data.sitemapUrl}
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              URLs in Sitemap ({data.totalUrls})
            </h3>
            {data.urls?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">URL</th>
                      <th className="border p-2 text-left">Last Modified</th>
                      <th className="border p-2 text-left">Change Frequency</th>
                      <th className="border p-2 text-left">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.urls.slice(0, 100).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2 break-all">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.url}
                          </a>
                        </td>
                        <td className="border p-2">{item.lastmod || "-"}</td>
                        <td className="border p-2">{item.changefreq || "-"}</td>
                        <td className="border p-2">{item.priority || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.urls.length > 100 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Showing 100 of {data.totalUrls} URLs. Download the full list
                    using the buttons above.
                  </p>
                )}
              </div>
            ) : (
              <p>No URLs found in the sitemap.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
