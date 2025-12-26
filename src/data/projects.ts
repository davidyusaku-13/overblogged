export interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "overblogged",
    description:
      "A minimal, typography-focused technical blog built with Astro and deployed to Cloudflare Workers.",
    tech: ["Astro", "TypeScript", "Cloudflare Workers"],
    github: "https://github.com/davidyusaku-13/overblogged",
    live: "https://blog.davidyusaku.my.id",
    featured: true,
  },
  {
    name: "PRIMA",
    description:
      "A reminder platform that simplifies patient communication for healthcare volunteers. Built with Next.js and deployed on Railway.",
    tech: ["Next.js", "TypeScript", "Railway"],
    github: "https://github.com/risetaid/prima",
    live: "https://prima-production.up.railway.app/",
    featured: true,
  },
  // Add more projects here
];
