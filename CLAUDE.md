# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based blog deployed to Cloudflare Workers as a static website. The project uses:
- **Astro 5.16.2** with MDX support for blog content
- **Cloudflare Workers** adapter for deployment
- **TypeScript** with strict null checks enabled
- **Content Collections** for type-safe blog post management

## Development Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start local dev server at `localhost:4321` |
| `bun run build` | Build production site to `./dist/` |
| `bun run preview` | Build and preview locally with Wrangler |
| `bun run check` | Run full validation: build, TypeScript check, and dry-run deploy |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run cf-typegen` | Generate Cloudflare Worker types |
| `bun wrangler tail` | View real-time logs for deployed Workers |

## Architecture

### Content Management
- **Content Collections** (`src/content.config.ts`): Defines the `blog` collection with a schema for frontmatter validation
  - Uses Astro's glob loader to load `.md` and `.mdx` files from `src/content/blog/`
  - Schema enforces: `title`, `description`, `pubDate`, optional `updatedDate`, optional `heroImage`
  - Access posts via `getCollection('blog')` from `astro:content`

### Routing Structure
- **Static pages**: `src/pages/index.astro` (homepage), `src/pages/about.astro`
- **Blog index**: `src/pages/blog/index.astro` lists all blog posts
- **Dynamic blog posts**: `src/pages/blog/[...slug].astro` uses `getStaticPaths()` to generate routes for each post
  - Post ID becomes the slug (e.g., `first-post.md` → `/blog/first-post/`)
  - Uses `render()` from `astro:content` to render post content
- **RSS feed**: `src/pages/rss.xml.js` generates RSS feed from blog collection

### Layouts and Components
- **BlogPost layout** (`src/layouts/BlogPost.astro`): Main blog post template with hero image support, formatted dates, and scoped styles
- **Reusable components** in `src/components/`:
  - `BaseHead.astro`: SEO meta tags, canonical URLs, OpenGraph data
  - `Header.astro` / `Footer.astro`: Site navigation and footer
  - `FormattedDate.astro`: Consistent date formatting
  - `HeaderLink.astro`: Navigation links

### Configuration
- **Site URL**: Set in `astro.config.mjs` (`site: "https://example.com"`) - update this for your domain
- **Site metadata**: Defined in `src/consts.ts` (`SITE_TITLE`, `SITE_DESCRIPTION`)
- **Cloudflare settings**: `wrangler.json` configures Worker deployment with observability enabled and source maps

### Deployment
- Built files go to `./dist/` with the Worker entry point at `./dist/_worker.js/index.js`
- Cloudflare adapter uses `platformProxy` for local development
- Observability and source maps are enabled for production debugging

## Key Patterns

**Adding a new blog post**: Create a `.md` or `.mdx` file in `src/content/blog/` with required frontmatter (title, description, pubDate). The file name becomes the URL slug.

**Modifying blog schema**: Edit `src/content.config.ts` to add/change frontmatter fields. TypeScript will enforce the schema across the codebase.

**Styling**: Global styles in `src/styles/global.css`. Component-specific styles use Astro's scoped `<style>` tags.

## Commit Message Convention

This project follows [Conventional Commits](https://conventionalcommits.org/en/v1.0.0/) specification for commit messages.

**Format**: `<type>(<scope>): <description>`

**Common types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples**:
- `feat(blog): add dark mode toggle`
- `fix(rss): correct feed generation for updated posts`
- `docs: update deployment instructions`
- `chore: migrate from npm to bun`
