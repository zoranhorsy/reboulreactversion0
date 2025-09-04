export async function GET() {
  const baseUrl = "https://reboulstore.com";
  const now = new Date().toISOString();

  const urls = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/catalogue`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/reboul`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/sneakers`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/kids`, changefreq: "daily", priority: "0.7" },
    { loc: `${baseUrl}/the-corner`, changefreq: "daily", priority: "0.7" },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url><loc>${u.loc}</loc><lastmod>${now}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
      )
      .join("") +
    `</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}


