# Reading Experience Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three reading experience features to blog posts: Table of Contents, Progress Bar, and Code Copy Button.

**Architecture:**
- TOC: Extract headings from `post.render().headings`, render as sticky sidebar on desktop, inline on mobile
- Progress Bar: Client-side script in BlogPost layout, fixed at top of viewport
- Code Copy: Client-side script targeting `<pre>` blocks, clipboard API integration

**Tech Stack:** Astro 5, TypeScript, vanilla JavaScript (no external dependencies)

---

## Task 1: Create TableOfContents Component

**Files:**
- Create: `src/components/TableOfContents.astro`

**Step 1: Create component file**

```astro
---
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;

// Filter to h2 and h3 only, group by depth
const tocItems = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
---

{tocItems.length > 0 && (
  <nav class="table-of-contents">
    <h2 class="toc-title">On this page</h2>
    <ul class="toc-list">
      {tocItems.map((heading) => (
        <li class={`toc-item depth-${heading.depth}`}>
          <a href={`#${heading.slug}`} class="toc-link">
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)}

<style>
  .table-of-contents {
    display: none;
  }

  @media (min-width: 1024px) {
    .table-of-contents {
      display: block;
      position: sticky;
      top: 100px;
      width: 200px;
      flex-shrink: 0;
      margin-left: var(--spacing-xl);
    }
  }

  .toc-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: var(--spacing-sm);
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc-item {
    margin: 0;
  }

  .toc-item.depth-3 {
    padding-left: var(--spacing-md);
  }

  .toc-link {
    display: block;
    padding: 0.25rem 0;
    font-size: 0.875rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .toc-link:hover {
    color: var(--accent);
  }

  :global(.toc-active) {
    color: var(--accent);
    font-weight: 500;
  }
</style>
```

**Step 2: Test the component builds**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
cd .worktrees/reading-experience
git add src/components/TableOfContents.astro
git commit -m "feat(blog): create TableOfContents component"
```

---

## Task 2: Integrate TOC into BlogPost Layout

**Files:**
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/pages/blog/[...slug].astro`

**Step 1: Update blog/[...slug].astro to pass headings**

Modify `src/pages/blog/[...slug].astro`:

```astro
---
import { type CollectionEntry, getCollection } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';
import { render } from 'astro:content';

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: post,
	}));
}
type Props = CollectionEntry<'blog'>;

const post = Astro.props;
const { Content, headings } = await render(post);
---

<BlogPost {...post.data} headings={headings}>
	<Content />
</BlogPost>
```

**Step 2: Update BlogPost layout to accept and render TOC**

Modify frontmatter in `src/layouts/BlogPost.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import FormattedDate from '../components/FormattedDate.astro';
import TagPill from '../components/TagPill.astro';
import TableOfContents from '../components/TableOfContents.astro';

type Props = CollectionEntry<'blog'>['data'] & {
  headings?: { depth: number; slug: string; text: string }[];
};

const { title, description, pubDate, updatedDate, heroImage, tags = [], headings = [] } = Astro.props;
```

Update the layout HTML to wrap content in a flex container:

```astro
<main>
  <div class="post-container">
    <article class="prose">
      <!-- existing header code -->
      <div class="post-content">
        <slot />
      </div>
      <!-- existing footer code -->
    </article>
    <TableOfContents headings={headings} />
  </div>
</main>
```

Add flex container styles:

```astro
<style>
  .post-container {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xl);
  }

  .prose {
    flex: 1;
    max-width: var(--content-width);
    min-width: 0;
  }

  @media (max-width: 1023px) {
    .post-container {
      display: block;
    }
  }
</style>
```

**Step 3: Build and verify**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: Build succeeds, no errors

**Step 4: Commit**

```bash
git add src/layouts/BlogPost.astro src/pages/blog/\[...slug\].astro
git commit -m "feat(blog): integrate Table of Contents into blog posts"
```

---

## Task 3: Add TOC Active State Highlighting

**Files:**
- Modify: `src/layouts/BlogPost.astro`

**Step 1: Add IntersectionObserver script**

Add before closing `</body>`:

```astro
<script>
  function initTocObserver() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('.post-content :is(h2, h3)');

    if (tocLinks.length === 0 || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach((link) => {
              link.classList.toggle('toc-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach((h) => observer.observe(h));
  }

  initTocObserver();
  document.addEventListener('astro:page-load', initTocObserver);
</script>
```

Update TOC styles to show active state:

```css
:global(.toc-active) {
  color: var(--accent);
  font-weight: 500;
}
```

**Step 2: Build and verify**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat(blog): add TOC active state highlighting"
```

---

## Task 4: Create and Add Progress Bar

**Files:**
- Modify: `src/layouts/BlogPost.astro`

**Step 1: Add progress bar HTML**

Add before `<main>`:

```astro
<div class="progress-container">
  <div class="progress-bar" id="progressBar"></div>
</div>

<main>
```

**Step 2: Add progress bar styles**

```css
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 9999;
}

.progress-bar {
  height: 100%;
  background: var(--accent);
  width: 0%;
  transition: width 0.1s ease-out;
}
```

**Step 3: Add progress bar script**

Add to existing script section:

```javascript
function initProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

initProgressBar();
document.addEventListener('astro:page-load', initProgressBar);
```

**Step 4: Build and verify**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat(blog): add reading progress bar"
```

---

## Task 5: Add Code Copy Button

**Files:**
- Modify: `src/layouts/BlogPost.astro`

**Step 1: Add copy button script**

Add to existing script section:

```javascript
function initCopyButtons() {
  const preBlocks = document.querySelectorAll('.post-content pre');

  preBlocks.forEach((pre) => {
    // Check if button already exists
    if (pre.querySelector('.copy-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.ariaLabel = 'Copy code';
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.classList.add('copied');
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';

        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  });
}

initCopyButtons();
document.addEventListener('astro:page-load', initCopyButtons);
```

**Step 2: Add copy button styles**

```css
:global(.copy-button) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background-color 0.15s ease;
  color: var(--text-muted);
}

:global(.copy-button:hover) {
  background: var(--code-bg);
  color: var(--text);
}

:global(.post-content pre:hover .copy-button),
:global(.copy-button:focus),
:global(.copy-button.copied) {
  opacity: 1;
}

@media (hover: none) {
  :global(.copy-button) {
    opacity: 1;
  }
}
```

**Step 3: Build and verify**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat(blog): add code copy button"
```

---

## Task 6: Final Verification

**Step 1: Run full build**

Run: `cd .worktrees/reading-experience && bun run build`
Expected: All 9 pages build successfully

**Step 2: Check output HTML for features**

Verify the following are present in a blog post HTML file (`dist/blog/first-post/index.html`):
- Progress bar div: `<div class="progress-container">`
- TOC component: `<nav class="table-of-contents">`
- Copy buttons on code blocks: `<button class="copy-button">`

**Step 3: Commit final verification**

```bash
git add -A
git commit -m "chore: verify reading experience enhancements build correctly"
```

---

## Execution Summary

**Subagent-Driven (this session):** Fresh subagent per task, review between tasks, fast iteration

**Parallel Session (separate):** Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
