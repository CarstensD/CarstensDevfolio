export const site = {
  name: "Davin Carstens",
  initials: "DC",
  location: "Cape Town, ZA",
  phone: "+27 71 617 2619",
  email: "davincarstens@gmail.com",
  github: "https://github.com/CarstensD",
  linkedin: "https://www.linkedin.com/in/davin-carstens-2ab2b71a8",
  hero: {
    headline: ["Engineering", "with intent."],
    description: "Backend development. Thoughtful systems.",
    artwork: "/images/ribbon-poster.webp",
  },
} as const;

export const navigation = [
  { label: "Work", href: "/projects", external: false },
  { label: "Experience", href: site.linkedin, external: true },
  { label: "Contact", href: "/contact", external: false },
] as const;
