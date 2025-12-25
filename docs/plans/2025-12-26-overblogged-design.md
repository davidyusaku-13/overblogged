# overblogged - Design Document

A minimal, typography-focused technical blog for David Yusaku.

## Overview

**Site name:** overblogged
**Author:** David Yusaku
**Purpose:** Technical/dev blog for code tutorials, project write-ups, and technical learnings
**Aesthetic:** Minimal and clean, whitespace-focused, distraction-free reading

## Visual Identity

### Color Palette

**Light mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#ffffff` | Page background |
| `--text` | `#1a1a1a` | Primary text |
| `--text-muted` | `#6b7280` | Secondary text, dates |
| `--accent` | `#3b82f6` | Links, highlights |
| `--code-bg` | `#f5f5f5` | Code block background |
| `--border` | `#e5e7eb` | Subtle borders |

**Dark mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0a0a0a` | Page background |
| `--text` | `#ededed` | Primary text |
| `--text-muted` | `#9ca3af` | Secondary text, dates |
| `--accent` | `#60a5fa` | Links, highlights |
| `--code-bg` | `#1a1a1a` | Code block background |
| `--border` | `#27272a` | Subtle borders |

### Typography

- **Font stack:** System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Code font:** `'JetBrains Mono', 'Fira Code', Consolas, monospace`
- **Body size:** 18-20px
- **Line height:** 1.7
- **Max content width:** 680-720px

### Layout

- Centered single-column layout
- Generous whitespace (2-3rem padding)
- No sidebar
- Sticky header with logo, nav, and dark mode toggle

## Pages

### Header (all pages)
- Left: "overblogged" text logo (links to home)
- Right: Blog | Projects | About + theme toggle (sun/moon icon)

### Homepage (`/`)
- Brief intro: "Hi, I'm David Yusaku. I write about code."
- Recent posts section (latest 5)
- Each post: title, date, description
- "View all posts →" link

### Blog Index (`/blog`)
- Title: "Blog"
- All posts sorted by date (newest first)
- Each post: title, date, description, tags
- Clickable tag pills for filtering

### Blog Post (`/blog/[slug]`)
- Post title (large)
- Meta: date + reading time + tags
- Article content
- Code blocks with syntax highlighting + copy button
- "Back to blog" link at bottom

### Tag Page (`/blog/tags/[tag]`)
- Title: "Posts tagged: [tag]"
- Filtered list of posts with that tag

### Projects (`/projects`)
- Grid/list of projects
- Each project: name, description, tech stack tags, GitHub link, live demo link

### About (`/about`)
- Bio paragraph
- Social links (GitHub, Twitter/X, LinkedIn)
- Contact/email link

## Data Structures

### Blog Post Frontmatter
```yaml
---
title: "Post Title"
description: "Brief description for SEO and previews"
pubDate: 2025-01-15
updatedDate: 2025-01-20  # optional
tags: ["react", "typescript"]
draft: false  # optional
---
```

### Project Data (`src/data/projects.ts`)
```typescript
export interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  // ...
];
```

## Components

| Component | Purpose |
|-----------|---------|
| `ThemeToggle.astro` | Sun/moon toggle, saves to localStorage, respects system preference |
| `Header.astro` | Site header with nav and theme toggle |
| `Footer.astro` | Simple footer with copyright |
| `PostCard.astro` | Blog post preview card |
| `TagPill.astro` | Clickable tag badge |
| `ProjectCard.astro` | Project showcase card |
| `CopyButton.astro` | Copy button for code blocks |
| `ReadingTime.astro` | Calculates and displays reading time |

## File Structure

```
src/
├── components/
│   ├── BaseHead.astro      # update
│   ├── Header.astro        # update
│   ├── Footer.astro        # update
│   ├── ThemeToggle.astro   # new
│   ├── PostCard.astro      # new
│   ├── TagPill.astro       # new
│   ├── ProjectCard.astro   # new
│   └── CopyButton.astro    # new
├── content/
│   └── blog/               # update schema
├── data/
│   └── projects.ts         # new
├── layouts/
│   └── BlogPost.astro      # update
├── pages/
│   ├── index.astro         # rewrite
│   ├── about.astro         # rewrite
│   ├── blog/
│   │   ├── index.astro     # update
│   │   ├── [...slug].astro # update
│   │   └── tags/
│   │       └── [tag].astro # new
│   └── projects.astro      # new
└── styles/
    └── global.css          # rewrite
```

## Dark Mode Implementation

1. CSS custom properties for all colors
2. `data-theme="dark"` attribute on `<html>` element
3. Script on page load:
   - Check localStorage for saved preference
   - Fall back to `prefers-color-scheme` media query
   - Apply theme attribute
4. Toggle button updates localStorage and attribute
5. No flash of wrong theme (inline script in `<head>`)

## Features

- **Reading time:** Calculate from word count (~200 words/min)
- **Code highlighting:** Astro's built-in Shiki
- **Copy button:** Appears on code blocks
- **RSS feed:** Keep existing `/rss.xml` with full content
- **Tags:** Lowercase, hyphenated (e.g., "react", "web-dev")

## Out of Scope

- Comments system
- Newsletter signup
- Search functionality
- Analytics (can add later)
- Interactive code sandboxes
