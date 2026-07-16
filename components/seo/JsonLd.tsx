type JsonLdProps = {
  data: Record<string, unknown>;
};

export const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export const hairSalonSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": `${siteUrl}/#salon`,
  name: "Hair by Noella",
  description:
    "Luxury hair styling, colouring and treatments in London. Blow-dries, colour, Olaplex and Yuko straightening treatments.",
  url: siteUrl,
  email: "hairbynoella123@outlook.com",
  image: `${siteUrl}/assets/images/logo.png`,
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
  areaServed: {
    "@type": "City",
    name: "London",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "11:00",
      closes: "17:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/hairbynoella/",
    "https://www.facebook.com/hairbynoella/",
    "https://www.tiktok.com/@hairbynoella",
    "https://www.youtube.com/@hairbynoella",
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/book`,
      actionPlatform: [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "Reservation",
      name: "Hair appointment",
    },
  },
});
