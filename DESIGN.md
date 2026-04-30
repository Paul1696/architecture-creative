# Architecture Creative Design System

## Product Intent

Architecture Creative is a French-language architecture and urban design publication with project case studies, essays, resources, and local expertise around Douala. The interface should feel editorial, precise, architectural, and credible. It should balance magazine-like inspiration with practical access to articles, projects, and resources.

## Audience

- Architecture clients and project owners looking for trustworthy guidance.
- Architecture, engineering, and construction readers interested in case studies.
- Local Douala readers searching for references, resources, and professional insight.
- Editors or administrators publishing new articles and project pages.

## Brand Personality

- Clear, rigorous, architectural.
- Premium but not decorative.
- Calm, modern, readable, and content-first.
- More like a refined architecture review than a marketing landing page.

## Visual Direction

- Favor strong photographic project imagery, clear typography, and generous white space.
- Use quiet editorial layouts with crisp hierarchy.
- Avoid overly promotional hero sections, heavy gradients, floating decoration, and excessive card nesting.
- Preserve the architectural blue identity but introduce warmer material accents sparingly so the site does not feel monochrome.

## Palette

- Ink: `#0A1628`
- Ink mid: `#1E293B`
- Text muted: `#64748B`
- Architectural blue: `#1A3582`
- Action blue: `#2563EB`
- Paper: `#FFFFFF`
- Paper alt: `#F6F9FF`
- Border: `#E2E8F0`
- Suggested accent clay: `#A65332`
- Suggested accent moss: `#647A52`

Use blue for navigation, metadata, active states, and primary actions. Use clay or moss only as secondary editorial accents, category marks, or subtle tags.

## Typography

- Headings: Outfit, bold, crisp, no negative letter spacing.
- Body: Inter, readable, restrained.
- Editorial titles should be confident but not oversized inside cards or compact panels.
- Keep line length comfortable for article intros and long-form pages.

## Layout Rules

- Desktop pages should use a max-width content rhythm, not full-width text blocks.
- Home page should make the publication identity clear immediately, then reveal editorial content.
- Project and category pages should prioritize scanability: filters, strong image grid, metadata, and clear article titles.
- Mobile navigation should remain compact, but the most important paths should be obvious without opening a menu.
- Avoid nested cards. Use cards for repeated article/project items only.

## Components

### Header

- Sticky header with logo, primary navigation, search, newsletter/profile actions.
- Desktop navigation currently has many links; group or reduce visible items if the layout becomes crowded.
- Search should feel like a first-class editorial tool.

### Hero

- Use real project imagery or strong architectural photography.
- The hero should communicate what Architecture Creative is and what readers can do next.
- Prefer one primary action and one quiet secondary action.

### Article Cards

- Image-first, editorial card style.
- Include category, title, excerpt, reading time, and clear hover/focus states.
- Keep imagery ratios stable.

### Category/Project Filters

- Use segmented controls or compact filters.
- Active state must be visually clear.
- Labels should match reader intent rather than internal taxonomy.

### Newsletter

- Present as an editorial subscription, not aggressive marketing.
- One input, one clear action, concise value proposition.

## Accessibility

- Maintain visible focus states.
- Do not hide the native cursor globally.
- Ensure contrast on metadata, breadcrumbs, and muted text.
- Buttons and links must have clear labels and sufficient tap targets.
- Avoid relying on emoji as the only semantic indicator.

## Responsive Behavior

- Mobile first screen should show logo, search/menu, strong title, image, and a clear route into content.
- Card grids collapse cleanly to one column.
- Bottom mobile navigation should not cover content or form controls.
- Avoid text truncation unless the full title remains accessible.

## Stitch Redesign Goal

Generate a refined editorial homepage and project listing direction for Architecture Creative. Keep the existing content model and brand identity, but improve navigation clarity, editorial hierarchy, mobile ergonomics, accessibility, and visual depth.
