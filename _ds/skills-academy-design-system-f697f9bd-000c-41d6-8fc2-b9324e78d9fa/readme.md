# Skills Academy — Design System

Skills Academy is a planned children's/teen education brand in Szczecin, Poland — a "Centrum Kompetencji Przyszłości dla Dzieci" (competence center for kids' futures) combining English language, life skills, media literacy, and experiential learning. It runs two internal tracks under one brand: **Kids + Teens Junior** (5–15, a core-curriculum + electives model) and **Teens Senior** (16–19, a standalone matura/exam-prep offer, deliberately separate in tone and palette).

This system is built entirely from two uploaded documents — there is no attached codebase or Figma file:
- `uploads/skills-academy-identyfikacja-final.html` — a finished visual-identity spec ("Wariant B", v1.0): color system, type pairing, logo mark, and a homepage mockup. This is the ground truth for all hex values, type sizes, radii, and spacing used here.
- `uploads/wytyczne-marki-kids-skills-academy_1.docx` — the brand strategy guidelines (v1.3): archetype, personality, verbal identity/dictionary, and the *direction* for visual identity (the HTML above is the executed result of that direction). References a separate "biznesplan" (business plan) document, chapters of which are cited throughout but which was not itself provided.

No logo files, icon sets, product screenshots, or imagery were supplied — see Iconography below.

## Index
- `styles.css`, `tokens/` — color, type, spacing, effects, fonts. Link `styles.css` to use the system.
- `assets/` — the three logo lockups (color, reverse, mono) extracted from the source HTML.
- `guidelines/` — 18 specimen cards (see the Design System tab): Colors, Type, Spacing, Foundations, Brand.
- `components/` — 13 React primitives grouped as `core/` (Button, Badge, Tag, Card), `forms/` (Input, Select, Checkbox, Switch), `navigation/` (Tabs, Navbar), `feedback/` (Tooltip, Toast), `overlay/` (Dialog).
- `ui_kits/marketing-site/` — interactive homepage recreation (nav, hero, program, age-tone tabs, evidence strip, Teens Senior section, trial-signup dialog).
- `SKILL.md` — portable skill file for using this system in Claude Code.

## Content fundamentals
**Voice vs. tone.** One fixed voice (archetype + personality below), tone adapts per channel/audience. Teens Senior is the one deliberate exception — a narrower, standalone register.

**Archetype: Odkrywca (Explorer) + Mędrzec (Sage)**, both from the "independence" cluster (Pearson/Mark), so they pull the same direction rather than fighting each other. Explorer = freedom, adventure, movement ("Move & Speak Missions"). Sage = truth through evidence (OECD, UNESCO, UNICEF, WHO, EEF, TPR, PBL). Rule of thumb: **every brand message should be defensible as both adventure/curiosity and evidence/source** — a message with only one half is unfinished. Teens Senior is the sole exception: near-pure Sage, no Explorer.

**Personality (Aaker dimensions):** Competence high, Excitement high, Sincerity medium-high, Sophistication deliberately medium (elegant, not exclusive), Ruggedness low for Kids/Teens Junior, moderate for Teens Senior (reads as "seriousness of outcome" rather than physical toughness).

**Segmented tone** (same voice, five calibrations):
- Kids 1 (5–7): simplest sentences, imperative verbs, repetition, playful.
- Kids 2 (8–10): mission/game tone — "you're a detective" — challenges and achievement.
- Kids 3 (11–12): partner tone, less infantilizing, child as collaborator.
- Teens Junior (13–15): peer tone, no mascots, can speak partly direct-to-teen.
- Teens Senior (16–19): near-exclusively Sage — results, evidence, scores. Minimal "adventure" — this is the one place adventure words are actively avoided.

**Word dictionary (avoid → use):** szkoła językowa/kurs/lekcja → centrum kompetencji/misja/zajęcia/spotkanie · uczeń/klasa → odkrywca/drużyna/ekipa/grupa · nauka słówek/gramatyka → działanie po angielsku/misja językowa · fear framing ("dziecko zostanie w tyle") → positive framing ("dziecko gotowe na przyszłość") · pakiet/abonament → karnet · zajęcia fakultatywne → fakultet. **Teens Senior reverses part of this**: "zabawa/przygoda/misja" become words to avoid there — replaced by plan/strategia and concrete CKE score data.

**Example copy** (from the guidelines doc): to a parent — "Nie uczymy słówek na pamięć. Uczymy dzieci działać po angielsku." To a Kids-2 child — "Dziś jesteś detektywem. Masz jedną wskazówkę po angielsku i 20 minut." Same personality, different register.

**Language:** all source material and copy is Polish, written for Polish parents and children/teens — keep new copy in Polish unless told otherwise, and always check Polish diacritics (ą ć ę ł ń ó ś ź ż) render correctly, especially in print.

**Emoji:** none observed anywhere in either source; don't introduce them.

## Visual foundations
**Color.** Five functional colors, each doing exactly one job (no color is decorative): Kobalt `#1E5FCC` (leader — hero, logo, section headers), Coral `#E8654A` (spark — the single main CTA per view, never body-text background; text on coral is ALWAYS Graphite `#1A2230`, never white — white scores 3.29:1 and fails AA, graphite scores 4.86:1; the hover state lightens the fill to `#F0785F` rather than darkening it), Slate `#5B6B7A` (label — exclusively for Teens Senior badging, a calmer register), Cloud Dancer `#FBF8F3` (warm base background), Graphite `#1A2230` (text — not pure black, softer, kin to Kobalt). The guidelines doc frames this as a 60% base / 30% cognitive-accent / 30%→10% motivational-spark proportion rule, and recommends Teens Senior materials drop to base + one single muted accent with no "mission spark" color at all.

**Type.** A two-typeface pair mapped straight onto the two archetypes: **Lexend** ("Mędrzec/Sage") carries all body copy, documents, grant applications, and the entire Teens Senior track — chosen for reading-fluency, working for a 6-year-old sounding out letters and a matura student alike. **Quicksand** ("Odkrywca/Explorer") is accent-only: headlines, mission names, Kids/Teens Junior classroom materials — never long text, never Teens Senior. Weights 600 and 700 only; the family stops at 700, so headings are set at the top of its range. (Fredoka held this role until August 2026 and was retired: it does not contain the Polish characters ą ć ę ń ś ź ż, so iOS silently substituted a system face in every heading.)

**Spacing.** An additive, unusually granular scale drawn straight from the mockup's real values (6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 32, 44, 52, 60, 66, 80, 100px) rather than a rounded 4/8 grid — see `tokens/spacing.css`. Section rhythm: big vertical breathing room (66px margin + 32px padding-top per section) separated by a hairline, not a card.

**Backgrounds.** Flat solid fills only — Cloud Dancer base page, Kobalt hero/band blocks. No photography, no illustration, no gradients, no repeating patterns/textures observed anywhere in the source.

**Animation / hover / press.** Defined in the brand guidelines, section 5.4. Cards and links: 160 ms `ease`. Coral CTA hover: fill lightens to `#F0785F` plus a 1 px lift. Mobile CTA bar: 340 ms `cubic-bezier(.2,.7,.3,1)` slide-up, once, with a single `scale(1.03)` pulse after 380 ms. All motion is suppressed under `prefers-reduced-motion`.

**Borders & shadows.** The system is deliberately flat: every surface separation is a 1px hairline border (`rgba(26,34,48,.13)`), and **no box-shadow appears anywhere** in the source. Keep new surfaces shadow-free.

**Corner radii.** 9–10px on buttons/inputs, 14px on cards, 16px on larger frames, 24px on the hero band (bottom corners only), full pill on badges/tags.

**Cards.** White surface, 1px hairline border, 14px radius, no shadow, no colored left-border accent.

**Transparency/blur.** Only translucent white overlays on the Kobalt hero (pill backgrounds at `rgba(255,255,255,.22)`, ghost-button border at `rgba(255,255,255,.5)`) — no backdrop-blur usage observed.

**Imagery.** None supplied — see Iconography.

## Iconography
No icon system, icon font, SVG set, or imagery of any kind was supplied in either source document. The only graphic asset is the logo mark itself (two koi forming the letter "S" — upper koi graphite, lower koi coral, eyes in Cloud Dancer; see Brand cards). No emoji or Unicode-glyph icon usage observed. **If a screen needs icons, this system has no house style to match** — pick a neutral, rounded-stroke CDN set (e.g. Phosphor or Lucide, regular weight) as a placeholder and flag the substitution; do not hand-draw icons.

## Logo
**The mark is closed and production-ready** (package v1.1, August 2026) — two koi forming the letter "S", the signet replacing the initial "S" of the wordmark. The full package lives in `/logo/`: horizontal, vertical, signet-only, reverse, graphite and white monochrome, favicons (SVG/ICO/PNG), social avatars, and PNG rasters. The wordmark is converted to curves in every SVG, so files carry no font dependency. Clear space = one signet-height on all sides. Minimum size: full logo 90px / 30mm wide, signet 24px / 10mm; below 32px use the eyeless favicon version. Never rotate, mirror, distort, swap the koi colours (the upper koi is always graphite), add shadows, outlines or gradients. Outstanding: CMYK/Pantone version with an approved proof before the first print run — see `/logo/README.txt` and the graphic-designer brief (v2.1).

## Fonts
Lexend and Quicksand are loaded via a Google Fonts CDN `@import` in `tokens/fonts.css` (both are real, freely-licensed Google Fonts already used in the source mockup — no substitution needed). This sandbox could not fetch and vendor the actual `.woff2`/`.ttf` binaries, so fonts currently load over the network rather than being self-hosted. **If you want self-hosted font files for production**, download Lexend and Quicksand from Google Fonts and drop the files into `assets/fonts/`, and I'll switch `tokens/fonts.css` to local `@font-face` rules.

## Intentional additions
- **Navbar** (`components/navigation/`) — no source component, but every marketing-site mockup needs a header; built directly from the source HTML's own `.nav` block (logo + links + single coral CTA).
- The full form/feedback/overlay component set (Input, Select, Checkbox, Switch, Tabs, Tooltip, Toast, Dialog) — neither source enumerates a component library, so per design-system convention a standard set was authored, sized down to what a marketing site + lead-capture flow actually needs (no Avatar, no multi-step Wizard, etc.).

## Components
Button, Badge, Tag, Card (`core/`) · Input, Select, Checkbox, Switch (`forms/`) · Tabs, Navbar (`navigation/`) · Tooltip, Toast (`feedback/`) · Dialog (`overlay/`).
