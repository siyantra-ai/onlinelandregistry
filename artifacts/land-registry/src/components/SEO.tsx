import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: string;
  noindex?: boolean;
  schemaData?: Record<string, any> | Array<Record<string, any>>;
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  noindex = false,
  schemaData,
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to get or create a tag
    const getOrCreateMeta = (selector: string, attrName: string, attrValue: string) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Description
    const metaDesc = getOrCreateMeta('meta[name="description"]', "name", "description");
    metaDesc.setAttribute("content", description);

    // 3. Robots (Index/Follow)
    const metaRobots = getOrCreateMeta('meta[name="robots"]', "name", "robots");
    metaRobots.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");

    // 4. Open Graph Tags
    const ogTitle = getOrCreateMeta('meta[property="og:title"]', "property", "og:title");
    ogTitle.setAttribute("content", title);

    const ogDesc = getOrCreateMeta('meta[property="og:description"]', "property", "og:description");
    ogDesc.setAttribute("content", description);

    const ogUrl = getOrCreateMeta('meta[property="og:url"]', "property", "og:url");
    ogUrl.setAttribute("content", canonicalUrl || window.location.href);

    const ogTypeMeta = getOrCreateMeta('meta[property="og:type"]', "property", "og:type");
    ogTypeMeta.setAttribute("content", ogType);

    // 5. Twitter Card Tags
    const twitterTitle = getOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title");
    twitterTitle.setAttribute("content", title);

    const twitterDesc = getOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description");
    twitterDesc.setAttribute("content", description);

    const twitterCard = getOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card");
    twitterCard.setAttribute("content", "summary_large_image");

    // 6. Canonical Link
    let linkCanonical = document.head.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl || window.location.href);

    // 7. Schema JSON-LD
    let scriptSchema = document.getElementById("seo-schema") as HTMLScriptElement | null;
    if (schemaData) {
      if (!scriptSchema) {
        scriptSchema = document.createElement("script");
        scriptSchema.id = "seo-schema";
        scriptSchema.type = "application/ld+json";
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(schemaData);
    } else {
      scriptSchema?.remove();
    }
  }, [title, description, canonicalUrl, ogType, noindex, schemaData]);

  return null;
}
