export async function GET() {
  const baseUrl = "https://reboulstore.com";
  const apiBase = "https://reboul-store-api-production.up.railway.app/api";
  const now = new Date().toISOString();

  // URLs statiques de base
  const urls: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0", lastmod: now },
    { loc: `${baseUrl}/catalogue`, changefreq: "daily", priority: "0.9", lastmod: now },
    { loc: `${baseUrl}/reboul`, changefreq: "daily", priority: "0.8", lastmod: now },
    { loc: `${baseUrl}/sneakers`, changefreq: "daily", priority: "0.8", lastmod: now },
    { loc: `${baseUrl}/kids`, changefreq: "daily", priority: "0.7", lastmod: now },
    { loc: `${baseUrl}/the-corner`, changefreq: "daily", priority: "0.7", lastmod: now },
  ];

  // Récupérer un set de produits récents pour générer des URLs de pages produit
  try {
    const resp = await fetch(`${apiBase}/public/sitemap-products?limit=200`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Empêcher la mise en cache CDN trop longue côté Vercel
      cache: "no-store",
    });

    if (resp.ok) {
      const data = await resp.json();
      const rawProducts: any[] = Array.isArray(data?.data) ? data.data : [];

      // Garder uniquement les produits actifs et non supprimés
      const products = rawProducts.filter((p) => {
        if (!p) return false;
        if (p.active === false) return false;
        if (p.deleted === true) return false;
        if (p.store_type === "deleted") return false;
        const action = (p._actiontype || p._actionType || "").toString();
        if (["delete", "hardDelete", "permDelete"].includes(action)) return false;
        return Boolean(p.id);
      });

      for (const p of products) {
        const id = String(p?.id ?? "").trim();
        if (!id) continue;

        const storeType = (p?.store_type || "adult").toString();
        let path = `/reboul/${id}`;
        if (storeType === "sneakers") path = `/sneakers/${id}`;
        else if (storeType === "kids") path = `/kids/${id}`;
        else if (storeType === "cpcompany") path = `/the-corner/${id}`;

        const lastmod = (p?.updated_at || p?.created_at) ? new Date(p.updated_at || p.created_at).toISOString() : now;

        urls.push({
          loc: `${baseUrl}${path}`,
          changefreq: "weekly",
          priority: "0.6",
          lastmod,
        });
      }
    }
  } catch (e) {
    // En cas d'erreur API, on garde le sitemap statique
    console.error("Sitemap dynamic generation error:", e);
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((u) => {
        const lm = u.lastmod || now;
        return `<url><loc>${u.loc}</loc><lastmod>${lm}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`;
      })
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


