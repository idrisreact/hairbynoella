import type { Metadata } from "next";
import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";
import { ServicesPageClient } from "./ServicesPageClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services & Pricing — Hair Styling, Colouring & Treatments",
  description:
    "Browse Hair by Noella's full service menu and prices: blow-dries, hair styling, colouring, Olaplex and Yuko straightening treatments in London. Book online.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services & Pricing | Hair by Noella",
    description:
      "Full service menu and prices for hair styling, colouring and treatments in London.",
    url: "/services",
  },
};

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: string;
}

const offerCatalogSchema = (items: ServiceItem[]) => ({
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": `${siteConfig.url}/#salon`,
  name: siteConfig.name,
  url: siteConfig.url,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Hair services",
    itemListElement: items.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        serviceType: service.category,
        provider: { "@id": `${siteConfig.url}/#salon` },
      },
    })),
  },
});

export default async function ServicesPage() {
  let allServices: ServiceItem[] = [];
  try {
    allServices = await db
      .select({
        id: services.id,
        name: services.name,
        category: services.category,
        price: services.price,
      })
      .from(services);
  } catch (error) {
    console.error("Error loading services for /services page:", error);
  }

  return (
    <>
      {allServices.length > 0 && <JsonLd data={offerCatalogSchema(allServices)} />}
      <ServicesPageClient services={allServices} />
    </>
  );
}
