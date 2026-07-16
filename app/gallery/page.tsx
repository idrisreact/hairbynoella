import type { Metadata } from "next";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery — Hair Styling & Colour Portfolio",
  description:
    "See Hair by Noella's portfolio: blow-dry waves, glass hair straightening, highlights and more. Real client transformations from our London hair studio.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Hair by Noella",
    description:
      "Portfolio of hair styling, colour and treatment transformations from our London studio.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
