export const siteConfig = {
  name: "Hair by Noella",
  url:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000",
  title: "Hair by Noella | Luxury Hair Salon in London",
  description:
    "Luxury hair styling, colouring and treatments in London. Book blow-dries, colour, Olaplex and Yuko straightening treatments online with Hair by Noella.",
  email: "hairbynoella123@outlook.com",
  locality: "London",
  country: "GB",
  ogImage:
    "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8Y4dDny7H2aWuSYnITrEVQymcpiNZl1oKzk",
  socials: [
    "https://www.instagram.com/hairbynoella/",
    "https://www.facebook.com/hairbynoella/",
    "https://www.tiktok.com/@hairbynoella",
    "https://www.youtube.com/@hairbynoella",
  ],
} as const;
