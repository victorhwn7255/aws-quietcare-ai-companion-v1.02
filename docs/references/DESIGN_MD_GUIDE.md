# DESIGN.md — Agent Context Primer

> **Purpose of this file.** Drop this at the root of any project (alongside `CLAUDE.md` or `AGENTS.md`) so that any AI coding agent — Claude, Cursor, Copilot, Gemini, or anything else — has full working context on what DESIGN.md is, how to read one, how to author one, and how the surrounding tooling fits together. Read this once before touching any `DESIGN.md` file in the repo.
>
> **Status warning.** DESIGN.md is an **alpha** specification (v0.1.0, released April 21, 2026) from Google Labs. The format, CLI flags, and linting rules are still moving. Treat this guide as current-as-of-April-2026 and verify against [`github.com/google-labs-code/design.md`](https://github.com/google-labs-code/design.md) when breaking changes are suspected.

---

## 1. What DESIGN.md Is (and Isn't)

**DESIGN.md is a file format specification**, not a skill, not a library, not a framework. It's a plain-text representation of a design system — a single file that captures the visual identity of a brand or product in a form both humans and AI agents can read and refine.

A DESIGN.md file has two layers stitched together:

1. **YAML front matter** (machine-readable) — design tokens with exact values: hex codes, font sizes, spacing scales, component recipes. Parsed deterministically. This is the *normative* layer.
2. **Markdown body** (human-readable) — prose sections explaining *why* those values exist, what feeling the UI should evoke, when to apply which component. This is the *rationale* layer.

Tokens tell an agent **what**. Prose tells it **why**. Both matter — an agent with only tokens will technically conform to the spec but produce soulless UIs; an agent with only prose will improvise values and drift across sessions.

### What DESIGN.md is *not*

- **Not a skill.** Skills teach procedural knowledge (*how to do* a task). DESIGN.md is declarative data (*what the design looks like*). The two are complementary.
- **Not a replacement for `CLAUDE.md` / `AGENTS.md`.** Those govern project-wide agent behavior. DESIGN.md governs only visual identity. Both should coexist at the repo root.
- **Not a runtime CSS format.** Browsers don't read Markdown. DESIGN.md must be exported (via the CLI) to `tailwind.config.js` or `tokens.json` if your build needs runtime styles.
- **Not a settled industry standard.** It's Google's proposal, currently alpha. Adoption across other tools (Cursor, Copilot, v0, etc.) is not guaranteed.

### Who publishes it

Released by Google Labs and dogfooded in their AI design tool **Stitch** (`stitch.withgoogle.com`). Open-source under Apache 2.0. Inspired by the W3C Design Token Community Group (DTCG) spec, so tokens round-trip with Figma variables, Style Dictionary, and `tokens.json` pipelines.

---

## 2. File Anatomy

### 2.1 Top-level structure

```yaml
---
version: alpha
name: Heritage
description: Architectural minimalism meets journalistic gravitas.
colors:
  primary: "#1A1C1E"
  # ...
typography:
  # ...
rounded:
  # ...
spacing:
  # ...
components:
  # ...
---

## Overview
...prose...

## Colors
...prose...

## Typography
...prose...
```

The `---` fences are **required and literal**. YAML front matter must start and end on lines containing exactly `---` with no leading whitespace.

### 2.2 YAML schema

```yaml
version: <string>          # optional; current value: "alpha"
name: <string>             # required
description: <string>      # optional
colors:
  <token-name>: <Color>    # hex string, sRGB, e.g., "#1A1C1E"
typography:
  <token-name>:
    fontFamily: <string>
    fontSize: <Dimension>
    fontWeight: <number>          # e.g., 400, 600, 700 (bare or quoted)
    lineHeight: <Dimension | number>  # "24px" or unitless multiplier like 1.5
    letterSpacing: <Dimension>     # optional
    fontFeature: <string>          # optional; CSS font-feature-settings
    fontVariation: <string>        # optional; CSS font-variation-settings
rounded:
  <scale>: <Dimension>             # e.g., sm: 4px, md: 8px, full: 9999px
spacing:
  <scale>: <Dimension | number>
components:
  <component-name>:
    backgroundColor: <Color | reference>
    textColor: <Color | reference>
    typography: <reference>        # references allowed for composite values
    rounded: <Dimension | reference>
    padding: <Dimension>
    size | height | width: <Dimension>
```

**Types:**

| Type | Format | Example |
|---|---|---|
| Color | `#` + hex (sRGB) | `"#1A1C1E"` |
| Dimension | number + unit (`px`, `em`, `rem`) | `48px`, `-0.02em`, `1.5rem` |
| Token Reference | `{path.to.token}` (curly braces) | `{colors.primary}`, `{rounded.md}` |
| Typography | object with font properties | see schema above |

**Reference rules:**
- Most token groups require references to **primitive** values (e.g., `{colors.primary}`), not groups (`{colors}` is invalid).
- Inside `components`, references to **composite** values are permitted (e.g., `typography: "{typography.label-md}"`).

### 2.3 Markdown body — canonical section order

Sections can be omitted, but **those present must appear in this order** (linter warns otherwise):

| # | Section | Aliases |
|---|---|---|
| 1 | Overview | "Brand & Style" |
| 2 | Colors | — |
| 3 | Typography | — |
| 4 | Layout | "Layout & Spacing" |
| 5 | Elevation & Depth | "Elevation" |
| 6 | Shapes | — |
| 7 | Components | — |
| 8 | Do's and Don'ts | — |

All sections use `##` (h2). An optional `#` (h1) may appear for document titling but is not parsed.

**Duplicate section headings are a hard error** — the linter rejects the file if it finds two `## Colors` headings, for example.

---

## 3. How to Read a DESIGN.md (Agent Guidance)

When an agent is asked to build or modify UI in a project containing a DESIGN.md:

### 3.1 Mandatory reading order

1. **Read the YAML front matter first.** Extract every token. These are the exact values to use in generated code — no improvisation on color, type, spacing, or radius.
2. **Read the prose sections.** Especially `## Overview`, `## Elevation & Depth`, and `## Do's and Don'ts`. These contain rules the YAML cannot express (e.g., *"bump font weight one tier on blurred backgrounds,"* *"1px white border on glass surfaces to simulate refraction"*).
3. **Respect the `## Components` section as the default implementation.** If `button-primary` is defined, use those exact values. Don't reinvent a button.
4. **Apply rationale to unspecified cases.** When the prose describes a principle (e.g., *"depth is achieved through physics of light, not darkness"*), extend that principle to components not explicitly listed.

### 3.2 Resolving token references

When code needs a value and the DESIGN.md uses references, resolve them transitively:

```yaml
colors:
  primary: "#FFFFFF"
components:
  button-primary:
    backgroundColor: "{colors.primary}"   # resolves to "#FFFFFF"
```

Agent output should emit the **resolved literal** in generated code (`background: #FFFFFF`), not the reference syntax (unless the build system itself consumes references, e.g., Tailwind).

### 3.3 Handling conflicts between DESIGN.md and user requests

If a user asks for something that contradicts DESIGN.md (e.g., *"make this button blue"* when the system defines it as white), the agent should:

1. Note the conflict explicitly.
2. Ask whether the user wants a one-off override or a design system change.
3. If it's a system change, suggest editing DESIGN.md and regenerating downstream artifacts rather than hand-editing components.

### 3.4 Prose is load-bearing

Agents sometimes treat the prose as decorative and skip it. This is a failure mode. Example: a DESIGN.md may define `button-primary` with only `backgroundColor` and `textColor`, but the prose specifies *"buttons use a 1px border at rgba(255,255,255,0.2) for edge definition."* An agent that ignored the prose would generate borderless buttons that break the aesthetic.

**Rule of thumb:** if the generated output doesn't feel like the system, reread the prose.

---

## 4. How to Author a DESIGN.md

### 4.1 From scratch

Minimum viable DESIGN.md (valid, lints clean):

```yaml
---
version: alpha
name: My System
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  neutral: "#F7F5F2"
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
rounded:
  sm: 4px
  md: 8px
  lg: 16px
---

## Overview

One paragraph describing brand personality, target audience, emotional response.

## Colors

Prose describing what each palette means semantically.

## Typography

Prose describing hierarchy, when to use each level.
```

### 4.2 From an existing site (reverse-engineering)

Full workflow — budget ~2 hours:

1. **Capture 6–10 screenshots** covering: landing page, content-dense page, form, modal, navigation, both light and dark modes if available.
2. **Extract ground-truth values via DevTools.** Colors, font families/sizes/weights, border radii, spacing base. Vision models estimate these but round — always verify against actual CSS.
3. **Load the spec into context.** Run `npx @google/design.md spec --rules` and paste into the agent's prompt.
4. **Hand everything to the agent** — screenshots + extracted values + spec + a clear instruction to not reference the source site's brand name.
5. **Lint and iterate** with `npx @google/design.md lint DESIGN.md`. Feed errors back to the agent.
6. **Side-by-side verify.** Generate one reference component from the DESIGN.md and compare against a screenshot of the same element. Tune until it matches.

**Extract principles, not identity.** Copy color palettes, spacing, and typography scales. Never copy logos, wordmarks, licensed fonts (record the name, but you need your own license), custom icons, or proprietary imagery. Trade dress can still be an issue even without copying individual elements — keep your own brand name and prose voice.

### 4.3 Prose-writing guidance

The prose sections are what separate a good DESIGN.md from a token dump. Write them for a reader (human or agent) who has never seen your product:

- **`## Overview`** — 2–4 sentences answering: *Who is this for? What should it feel like? What's the one-word vibe?*
- **`## Colors`** — for each palette, explain its semantic role and where it's used. *"Tertiary is used exclusively for primary actions and critical highlights — never decoratively."*
- **`## Typography`** — explain the hierarchy and when to use each level, especially any contextual rules (*"Increase weight one tier on blurred backgrounds"*).
- **`## Layout`** — the rhythm (8px grid? 4px? container-based?), how elements group.
- **`## Elevation & Depth`** — the philosophy (shadows? tonal layers? glass? borders?), with concrete values if applicable.
- **`## Shapes`** — corner radius philosophy and where each scale applies.
- **`## Components`** — describe variants and interaction states that the YAML alone can't fully capture.
- **`## Do's and Don'ts`** — hard rules that prevent common mistakes (*"Don't use more than two font weights on a single screen"*).

---

## 5. The CLI: `@google/design.md`

Four commands. All accept a file path or `-` for stdin. Default output is JSON.

### 5.1 `lint` — validate a file

```bash
npx @google/design.md lint DESIGN.md
```

Runs seven rules:

| Rule | Severity | Check |
|---|---|---|
| `broken-ref` | error | Token references that don't resolve |
| `missing-primary` | warning | No `primary` color defined |
| `contrast-ratio` | warning | Component color pairs below WCAG AA (4.5:1) |
| `orphaned-tokens` | warning | Color tokens never referenced |
| `missing-typography` | warning | Colors defined but no typography |
| `section-order` | warning | Sections out of canonical order |
| `token-summary` | info | Summary of token counts |
| `missing-sections` | info | Optional sections absent |

Exit code `1` on errors, `0` otherwise. Use in pre-commit hooks and CI.

### 5.2 `diff` — compare two versions

```bash
npx @google/design.md diff DESIGN-v1.md DESIGN-v2.md
```

Reports added/removed/modified tokens and flags **regressions** — new errors or warnings introduced by the "after" file. Exit code `1` on regression.

**Regression ≠ change.** A regression is specifically a change that makes the file *worse* (broken reference introduced, contrast dropped below AA, token orphaned, sections reordered). Benign changes — adding tokens, tweaking values that still pass contrast, rewriting prose — are reported but don't fail.

### 5.3 `export` — convert to other formats

```bash
npx @google/design.md export --format tailwind DESIGN.md > tailwind.config.js
npx @google/design.md export --format dtcg DESIGN.md > tokens.json
```

Supported formats: `tailwind`, `dtcg` (W3C Design Token Community Group).

The export is **lossy** — prose and component recipes beyond primitive tokens don't survive the conversion. DESIGN.md is the source of truth; exports are generated artifacts.

### 5.4 `spec` — dump the format specification

```bash
npx @google/design.md spec                  # Full spec as markdown
npx @google/design.md spec --rules          # Spec + linting rules table
npx @google/design.md spec --rules-only     # Just the rules
npx @google/design.md spec --format json    # Programmatic form
```

**Use this when an agent needs to *author* a DESIGN.md**, not when it's just reading one. Pipe the output into the agent's system prompt so it knows the exact schema.

### 5.5 Programmatic API

```javascript
import { lint } from '@google/design.md/linter';

const report = lint(markdownString);
console.log(report.findings);       // Finding[]
console.log(report.summary);        // { errors, warnings, info }
console.log(report.designSystem);   // Parsed DesignSystemState
```

---

## 6. Project Integration

### 6.1 File layout (recommended)

```
project-root/
├── CLAUDE.md                      # Agent behavior & project conventions
├── DESIGN.md                      # Design system source of truth
├── DESIGN_MD_GUIDE.md             # This file
├── tailwind.config.js             # Generated from DESIGN.md (gitignore or build-time)
├── tokens.json                    # Generated (optional, for Figma sync)
├── package.json                   # Wires CLI into scripts
├── .github/workflows/
│   └── design-lint.yml            # CI gate
└── src/
```

### 6.2 `package.json` integration

```json
{
  "scripts": {
    "design:lint": "design.md lint DESIGN.md",
    "design:build": "design.md export --format tailwind DESIGN.md > tailwind.config.js",
    "design:watch": "chokidar 'DESIGN.md' -c 'npm run design:build'",
    "predev": "npm run design:build",
    "prebuild": "npm run design:build"
  },
  "devDependencies": {
    "@google/design.md": "0.1.0"
  }
}
```

**Pin the version** (`0.1.0`, not `^0.1.0`) — the format is alpha and unpinned versions will eventually break.

### 6.3 CI gate (GitHub Actions example)

```yaml
- name: Lint DESIGN.md
  run: npx @google/design.md lint DESIGN.md

- name: Detect design regressions
  run: npx @google/design.md diff origin/main:DESIGN.md DESIGN.md
```

### 6.4 When CLI is optional

The CLI is not required to *start* using DESIGN.md. If the agent is reading DESIGN.md to write components directly (e.g., plain HTML/CSS, or an artifact), no CLI is needed — the agent just reads the markdown file.

The CLI becomes necessary when:
- Your build pipeline needs `tailwind.config.js` or `tokens.json` (run `export`).
- You want CI to catch regressions (run `lint` and `diff`).
- You're building a tool where an agent authors DESIGN.md files (pipe `spec` into the prompt).

### 6.5 Generated files — never hand-edit

`tailwind.config.js` and `tokens.json` produced by `export` are **build artifacts**. Hand-editing them causes drift from DESIGN.md and defeats the single-source-of-truth property. Treat them the same way you treat compiled JavaScript from TypeScript.

---

## 7. Consumer Behavior for Unknown Content

How a conforming DESIGN.md consumer handles content outside the spec:

| Scenario | Behavior |
|---|---|
| Unknown section heading (e.g., `## Iconography`) | Preserve; do not error |
| Unknown color token name | Accept if value is valid |
| Unknown typography token name | Accept as valid typography |
| Unknown spacing value (non-dimension string) | Accept; store as string |
| Unknown component property (e.g., `borderColor`) | Accept with warning |
| **Duplicate section heading** | **Error; reject the file** |

Implication for agents authoring DESIGN.md files: it's safe to add custom sections and custom token names — the spec is deliberately permissive. The only hard constraint is no duplicate section headings.

---

## 8. Recommended Token Names (Non-Normative)

Not required, but consistent naming makes DESIGN.md files interchangeable across projects:

- **Colors:** `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error`
- **Typography:** `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`
- **Rounded:** `none`, `sm`, `md`, `lg`, `xl`, `full`

Material Design-style `on-*` tokens (e.g., `on-primary` for text on a primary-colored surface) are common and well-supported.

---

## 9. Common Failure Modes (and How to Avoid Them)

Observed patterns when agents generate or consume DESIGN.md files:

| Failure | Cause | Fix |
|---|---|---|
| Invented field names (`brandColor`, `fontHeading`) | Agent pattern-matching on Tailwind/Material, not DESIGN.md | Pipe the spec into the prompt (`spec --rules`) |
| Wrong reference syntax (`$colors.primary`, `var(--primary)`) | Agent improvising | Include at least one reference example in the prompt |
| Sections out of order | Agent writing top-down by convenience | Remind agent of canonical order; lint catches it |
| Duplicate `## Colors` headings | Agent adding a new section without checking | Hard error — lint rejects |
| Color values without `#` or with RGB tuples | Agent using different color spaces | Spec requires `#` + sRGB hex |
| Orphaned tokens piling up over time | Additive edits without cleanup | Run `lint` in CI; treat warnings as blocking |
| Prose that only restates token values | Agent not writing true rationale | Explicitly prompt for *why*, not *what* |
| Components with failing WCAG contrast | Agent picking aesthetic over legibility | `contrast-ratio` linter rule catches; fix before merge |
| Tailwind config drifts from DESIGN.md | Someone hand-edited the generated file | Gitignore the export output or regenerate in CI |

---

## 10. Design Philosophy Notes (for Agents Generating UIs)

A DESIGN.md captures an entire visual identity in a file, but it doesn't absolve the agent of design judgment. Hold these principles:

- **Tokens give precision, prose gives taste.** Read both. Emit generated code with resolved literal values, but let the prose shape choices the tokens don't cover.
- **When in doubt, match the system's energy.** If the prose describes the aesthetic as *"serene and crystalline,"* a dense, cluttered layout violates the system even if every individual token is correct.
- **Elevation & Depth is where systems diverge most.** Flat systems, shadow-based systems, tonal systems, and glassmorphism systems all use different mechanics to convey hierarchy. The `## Elevation & Depth` prose is the clearest signal of which philosophy is in play.
- **Component variants matter.** A DESIGN.md that defines `button-primary` and `button-primary-hover` is telling you interaction states are part of the system, not an afterthought. Always generate the full state matrix.
- **Accessibility is normative.** WCAG AA contrast (4.5:1 for normal text) is enforced by the linter. Don't generate components that fail it, even if the user asks for a "softer" look.

---

## 11. Relationship to `CLAUDE.md` / `AGENTS.md`

These files are siblings, not substitutes.

| Concern | File |
|---|---|
| Project-wide conventions, build commands, test setup, what not to touch | `CLAUDE.md` / `AGENTS.md` |
| Coding style (TypeScript strictness, functional preferences) | `CLAUDE.md` / `AGENTS.md` |
| Visual tokens, typography, spacing, component recipes | `DESIGN.md` |
| The *why* behind visual decisions | `DESIGN.md` prose |
| How to run the design CLI in this project | `CLAUDE.md` (referencing DESIGN.md) |

A well-configured `CLAUDE.md` should explicitly reference DESIGN.md:

> *"All visual decisions follow `DESIGN.md`. Use tokens from its YAML front matter and respect the guidance in the prose sections. Do not hand-edit `tailwind.config.js` — it is generated from DESIGN.md via `npm run design:build`."*

---

## 12. Quick Reference Card

For agents in a hurry:

```
WHEN READING DESIGN.md:
  1. Parse YAML front matter → exact values for all design decisions
  2. Read prose sections → rules not expressible in YAML
  3. Resolve {path.to.token} references transitively
  4. Respect ## Elevation & Depth and ## Do's and Don'ts strictly

WHEN AUTHORING DESIGN.md:
  1. Load the spec first (npx @google/design.md spec --rules)
  2. YAML front matter between exactly --- fences
  3. Sections in canonical order (Overview → Colors → Typography → Layout
     → Elevation & Depth → Shapes → Components → Do's and Don'ts)
  4. Use {path.to.token} for references, never $ or var() syntax
  5. Hex colors with #, sRGB only. Dimensions in px, em, or rem.
  6. Lint before finalizing

WHEN RUNNING THE CLI:
  lint    → validate a file (use in CI and pre-commit)
  diff    → detect regressions between versions
  export  → generate tailwind.config.js or tokens.json
  spec    → dump the format for agent prompts

CANONICAL URLS:
  https://github.com/google-labs-code/design.md
  https://stitch.withgoogle.com/docs/design-md/overview
```

---

## 13. Version History & Breaking Change Watch

- **v0.1.0** (April 21, 2026) — Initial public release. Spec marked `alpha`.

If you're reading this guide and the current `@google/design.md` version is ahead of v0.1.0, verify that:

- Section order hasn't changed
- Component property list hasn't expanded (current: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`)
- Linting rule names haven't changed
- Reference syntax is still `{path.to.token}` (not `$`, `@`, or `var()`)

When in doubt, run `npx @google/design.md spec` and compare against Section 2 of this guide.

---

*End of primer. If an agent has read this file in full and still produces invalid DESIGN.md output, the failure is the agent's, not the spec's.*
