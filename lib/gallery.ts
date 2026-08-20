/** Categories offered in the admin uploader and used as filters on /gallery. */
export const GALLERY_CATEGORIES = ["Styling", "Colour", "Treatments"] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** "bouncy-curls-final.jpg" -> "Bouncy Curls Final" — a sensible default title. */
export function titleFromFileName(fileName: string): string {
    const withoutExtension = fileName.replace(/\.[^.]+$/, "");
    const words = withoutExtension
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!words) return "Untitled";

    return words
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
