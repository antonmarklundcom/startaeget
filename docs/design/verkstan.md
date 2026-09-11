# Design: "Verkstan" (direction 1b) — the visual contract

Anton picked direction **1b Verkstan** from `docs/design/tre-riktningar.dc.html`
(canvas section `id="1b"`, four artboards: home desktop 1280, home mobile 390,
comparison page desktop, tool-result desktop). This file is the extracted,
decided version. Phase D1 implements it; every later phase that touches
`src/**` follows it. When this file and the canvas disagree, this file wins —
it records the decisions the canvas left open.

The idea in one line: *nervous first-time founders need to feel it is fun and
doable*. Light, colourful, round like a consumer app: each hub is a "room" with
its own colour, the tools look like something you want to press, the result is a
card you want to share. Sources and Annonslänk are chips in the same colour
system, so honesty reads as part of the play, not as a warning sign.

## 1. Tokens (replace the whole O2 block in `src/styles/tokens.css`)

Colour — light theme only, no dark mode.

| token | value | use |
|---|---|---|
| `--color-surface` | `#fffdf8` | page paper |
| `--color-surface-alt` | `#f6f3ec` | sand panels (guides/comparisons boxes, sources box, "Meny" pill) |
| `--color-surface-sunk` | `#e9e5dc` | progress tracks, dividers inside panels |
| `--color-ink` | `#1c1b1a` | text, dark pills, dark cards |
| `--color-ink-soft` | `#3d3a35` | body copy in cards, ledes |
| `--color-ink-muted` | `#6b675f` | meta, labels, captions (4.9:1 on paper) |
| `--color-line` | `#e6e1d6` | 1 px card borders, option borders |
| `--color-accent` | `#0f6b4a` | primary pills, logo tile, progress fill, active states |
| `--color-accent-strong` | `#0b4a33` | green text on mint, source-chip text |
| `--color-accent-contrast` | `#ffffff` | text on accent |
| `--color-warning` | `#ffb020` | the amber dot on "uppskattning" / `<Verifiera />` chips |
| `--tint-mint` / `--tint-mint-ink` | `#c9f0dc` / `#0b4a33` | starta-foretag, verktyg, tool 1 |
| `--tint-sky` / `--tint-sky-ink` | `#cfe6ff` / `#0d3d6b` | ekonomi, tool 3 |
| `--tint-sun` / `--tint-sun-ink` | `#ffe58a` / `#5a4300` | affarside, tool 2, newsletter band, e-mail-my-result |
| `--tint-peach` / `--tint-peach-ink` | `#ffd3c2` / `#6b2a10` | e-handel, **every Annonslänk chip** |
| `--tint-lilac` / `--tint-lilac-ink` | `#e3dcff` / `#3b2a7a` | hemsida, jamfor |
| `--tint-rose` / `--tint-rose-ink` | `#ffdbe8` / `#6b1f47` | marknadsforing (sixth room; the canvas had five tints, this one is decided here) |
| `--tint-sand` / `--tint-sand-ink` | `#f6f3ec` / `#3d3a35` | blogg (B1), neutral fallback |
| `--gradient-hero` | `linear-gradient(135deg,#c9f0dc 0%,#e8f7ee 55%,#fff6d1 100%)` | home hero panel only |
| `--shadow-float` | `0 20px 50px rgb(15 107 74 / .14)` | the hero tool card only; nothing else has a shadow |

Per-page tint: the site layout sets `data-hub="<hub id | verktyg | jamfor | blogg>"`
on the page wrapper and CSS maps it to `--hub-tint` / `--hub-tint-ink`. Components
use `var(--hub-tint)`, never a tint name, so a hub changes colour in one place.
`content/hubs.ts` gets a `tint` field (enum of the seven tint names, schema default
`sand`) and `content/tools.ts` gets `tint` + `minutes` (the "3 minuter" line).

Type — two faces via `next/font/google`, `latin` + `latin-ext` subsets:

- **Outfit** (`--font-heading`), weights 700/800: every h1–h3, card titles, the
  wordmark, result numbers. Letter-spacing −0.02em, −0.03em at ≥ 48 px, line-height
  1.0–1.05 for display, 1.1–1.2 for card titles.
- **Figtree** (`--font-body`), 400/500/600/700: everything else. `font-variant-numeric:
  tabular-nums` on prices, scores, progress counters.
- Scale (desktop / mobile): hero h1 68/34 px · section h2 40/28 · panel h2 30/24 ·
  card title 22–28/21 · body 16–17/14–15 · meta 13/12 · chips 12 (never below 12,
  the canvas used 10–11 and that fails readability). Keep the `1.25` step tokens for
  in-prose headings.

Shape:

- Pills `999px`: all buttons, nav items, chips, input rows.
- Cards `24px` desktop / `16–20px` mobile. Hero and newsletter band `28px`. The tool
  result panel `32px`. Options and inputs `12px`. Icon/number tiles `10–14px`.
- No card shadows. Separation is tint fill or a 1 px `--color-line` border, never both.
- Buttons: primary = accent pill, white 700 text, 16 px, `padding: 16px 26px` (desktop) /
  `12px 18px`; dark = `--color-ink` pill (the "Starta", "Testa", "Häng med", "Skicka"
  actions inside tinted or white cards); ghost = white pill on tint. Min tap height 44 px.
- Chips: `padding: 4px 9px`, 12 px, weight 600–700. Source chip = white or mint bg with
  `● ` green dot prefix + "Uppdaterad YYYY-MM · Källa". Annonslänk chip = peach bg, peach
  ink, text exactly "Annonslänk" (or "Innehåller annonslänkar" on a page header, "Annonslänkar"
  on a list row). Warning chip = white bg with `--color-warning` dot.
- Motion: 150 ms colour/background transitions on hover only. No entrance animation, no
  parallax, no ticker (that was direction 1a).

Spacing stays on the 8 px grid; the container widens to `80rem` so the 1280 layout fits
with 40 px side padding; mobile gutter 16–18 px.

## 2. Surfaces

### Header (72 px desktop, no bottom border)
Left: a 30 px accent square with 10 px radius + wordmark "Starta Eget Företag" in Outfit
700 19 px. **Drop the tagline line under the wordmark.** Middle: nav from `content/nav.ts`
as pills (14 px 600, `padding 8px 12px`), the current section's pill filled with mint.
Right: dark pill "Nyhetsbrev" → `/nyhetsbrev/`. Mobile (< 64rem): 24 px square + 16 px
wordmark, sand pill "Meny" toggling the existing drawer (keep the one-boolean drawer,
restyle its list as stacked pills).

### Home
1. **Hero** — a gradient panel (`--gradient-hero`, radius 28, `margin: 8px 24px 0`,
   `padding 64px 48px`; mobile `margin 0 12px`, `padding 26px 20px`) in a 1fr / 420px
   grid. Left: a white chip **"Gratis verktyg · inga konton · källa på varje siffra"**
   with three small tinted dots in front (the canvas showed "3 412 startade med oss i
   augusti" with avatars — a made-up number; plan §4.16 forbids it, so ship the truthful
   chip and revisit when real usage counts exist), h1 = `home.heroHeading`, intro
   (20 px, ink-soft, max 44ch), two pills: primary `home.heroCta`, ghost "Se alla
   verktyg" → `/verktyg/`. Right: the **tool card** — white, radius 24, padding 26,
   `--shadow-float`: row "Bolagsformsväljaren" (13 px 700 accent) + "1 av 8" (muted),
   an 8-segment progress bar (6 px tall, 3 px radius, first segment accent, rest
   `--color-surface-sunk`), the first question in Outfit 700 23 px, the options as
   full-width bordered buttons (1.5 px line, radius 12, 14 px 600, min-height 44),
   foot line 12 px muted. Options stay plain links into the tool exactly as
   `HeroToolSlot` does today.
2. **Välj verktyg** — head row: h2 40 px + sub "Tre räknare. Samma siffror, samma
   källor, inga konton." left, underlined link "Alla verktyg" right. Three cards in the
   tool's tint (radius 24, padding 28, min-height 300): white 44 px tile with "01/02/03"
   in Outfit 700, title Outfit 800 28 px (`overflow-wrap: anywhere`), description 15 px
   ink-soft, footer row: "{minutes} minuter" left, dark pill "Starta" right. Whole card
   is the link. Mobile: stacked, radius 20, padding 20, title 21 px.
3. **Sex rum. Gå in där du står just nu.** — h2 40 px, six white bordered cards (radius
   24, padding 24): 14 px dot in the hub tint, title Outfit 700 22 px, description 14 px,
   "{n} guider" 13 px 600 muted where n is the real published-article count for the hub
   (hide the line when 0). Mobile: 2 columns, dot 10 px, title 14 px, no description.
4. **Nya guider / Jämförelser** — two sand panels side by side (radius 24,
   padding 32), h2 30 px. Guide rows: white, radius 16, `padding 16px 18px`, title 16 px
   700 + meta line in accent-strong 12 px 600 "● Uppdaterad {månad} · {first source
   label}", arrow "→" right. Comparison rows: title + description line (13 px muted) and
   a peach "Annonslänkar" chip. The heading is "Nya guider" (the four newest) until
   real read counts exist — a "Mest lästa" heading without a metric is a claim (§4.16).
5. **Newsletter band** — sun panel (radius 28, `margin 24px 24px 0`, padding 48), two
   columns: h2 36 px "Häng med. Ett mejl i månaden." + copy "Ett mejl i månaden om det
   som ändras för dig som driver eget. Inga nyhetsbrev om nyhetsbrev."; right: the
   `NewsletterForm` restyled as one white pill row (input flush left, dark pill "Häng
   med" inside). Same band, narrower, ends every article and hub.
6. **Footer** — the three `nav.footer` groups stay (they carry hub/legal links) but as
   a quiet 13 px 600 muted block, then the canvas line: "Källor vi citerar: Skatteverket
   · Bolagsverket · Verksamt.se" left, "© {år} Starta Eget Företag · Annonspolicy ·
   Integritet" right. No background, no border.

### Article (guide, list, template, post) and comparison
- **Head panel** in `--hub-tint` (radius 24, `margin 0 16px`, `padding 40px 32px`;
  mobile `margin 0 12px`, padding 24 20): breadcrumb as 13 px muted "Hub → Titel" in
  the header row above it; chips row: source chip "● Uppdaterad {YYYY-MM} · {n} källor"
  (or "priser kontrollerade {datum}" on comparisons), peach "Innehåller annonslänkar"
  when `partners` or comparison rows have a partner; h1 48/34 px; lede 17 px ink-soft
  max 58ch.
- **Body grid** `1fr 230px` (desktop), single column on mobile with the aside after
  the body. Aside is sticky: white bordered card "På sidan" (TOC, current item in accent);
  mint card "Vårt val" = the first `partners` entry rendered by `PartnerCta` (title,
  one line, dark pill CTA, small white Annonslänk chip); dark card "Få offert från en
  redovisningsbyrå" with copy "Tre byråer svarar inom två dagar. Gratis och utan
  bindning." and a sun pill "Få offert" that scrolls to the page's `LeadForm` (`#byra`)
  when the page has one, otherwise links to `/redovisningsbyra/`. (The canvas showed a
  postnummer field in the card; the real form has more fields, so the card is the
  door, not the form.)
- **Comparison rows replace the table**: one white bordered card per row (radius 20,
  padding 20), grid `140px 110px 1fr 90px` → stacked on mobile: name Outfit 800 21 px +
  tinted badge chip (`row.badge`, tint cycles mint/sky/sun/lilac by index); price 20 px
  800 tabular + `freeTier` as the 12 px note; verdict 14 px, then "**Bäst för** {bestFor}",
  then "Styrka {highlight} · Svaghet {drawback}" 13 px, then the source line "● Pris
  kontrollerat hos {name} {sourceDate}"; right column: dark pill "Testa" (the `/go/`
  link) over a peach Annonslänk chip when `partnerId` is set, else a ghost pill "Läs
  mer". Column header row above in 11 px uppercase 700 muted. The data shape in
  `content/comparisons/*.ts` does not change (S5 owns it).
- **Prose**: h2 Outfit 800 28 px with `scroll-margin-top`; links accent with 2 px
  underline offset 3 px; `Callout` = tinted panel (radius 20, sun for `warning`, sky
  default); `Checklist` items = 22 px rounded (7 px) 2 px accent-bordered boxes;
  `StatRow`/`Stat` = white bordered tiles with the value in Outfit 800 tabular and a
  source chip; `Verifiera` = warning chip "verifiera" with the amber dot.
- **Källor** = sand panel (radius 20, padding 24), 11 px uppercase label, one line
  per source "{label} · hämtad {updated}". **Vanliga frågor** = list with 1 px top
  borders, q 16 px 700, a 14 px ink-soft. **Relaterade guider** = pills in each related
  article's hub tint. Then the lead form (where the hub calls for it) as a white
  bordered card, then the sun newsletter strip (one row: 17 px Outfit 700 text + dark
  pill).

### Hub page
Head panel in the hub tint with a chip "{n} guider", h1, intro. "Börja här" = one wide
white card (radius 24) with the featured article's title (Outfit 800 28), description
and a dark pill "Läs guiden". Then the card grid as on home (dot, title, description,
"Uppdaterad {månad}" meta). Then a tool row: the three tool cards in their tints,
compact (title + pill). `/jamfor/` uses lilac and lists comparisons with the peach chip.
`/verktyg/` uses mint and shows the three full tool cards.

### Tools (all three share the shell)
- Header right side shows progress "{k} av {n}" with a 120 px 6 px bar; "· klart" when done.
- Layout `520px 1fr` (desktop; stacked on mobile, result first when done): **result
  panel** sticky in the tool's tint (radius 32, padding 40): row "Ditt svar · {n} frågor"
  + white chip "Dela ↗" (copies the shareable URL, existing behaviour); "För dig passar"
  16 px 600 tint-ink; the answer in Outfit 800 72/44 px; explanation 18 px; score bars
  (grid `130px 1fr 44px`, 12 px white track, accent fill, non-winners at 45 % opacity,
  tabular score); the assumption chip with the amber dot "Uppskattning, inte rådgivning ·
  Uppdaterad {YYYY-MM} · Källa Skatteverket, Bolagsverket". Tool 2's panel shows the two
  totals ("att betala vid start" / "per månad") in the same 72 px style; tool 3 shows the
  two nets side by side.
- **Right column**: questions/inputs as white bordered cards (radius 24, padding 32);
  options as the bordered 12 px-radius buttons, selected = mint fill + accent border.
  After completion: "Därför blev det …" numbered with 32 px tinted circles (lilac, peach,
  sky cycling); "Nästa steg" checklist with source chips; then a 2-column row: sand
  "Passar ditt svar" (white mini-cards per partner with Annonslänk chip + the dark byrå
  card) and sun "E-posta mitt resultat" (`EmailResult` restyled: white pill input, dark
  pill "Skicka", note "Inget nyhetsbrev om du inte kryssar i det.").
- Footer line of every tool page: "Källor: Skatteverket · Bolagsverket · Verksamt.se ·
  hämtade {verifiedOn}" — from the constants, not typed.

### Forms
`LeadForm` and `NewsletterForm` keep their fields, states and honeypot; inputs become
12 px-radius white fields with a 1.5 px line border, labels 13 px 600, submit = dark
pill (or sun pill inside a dark card). Errors in `--tint-peach-ink`.

### Admin (B1) 
The admin is a work surface, not a brand surface: same tokens and fonts, sand
background, white cards, dense 14 px type, no hero, no tints except state chips
(mint "publicerad", sun "väntar på bygge", peach "fel").

## 3. Quality bar (D1 exit criteria reference these)
- Lighthouse mobile on `/`, `/starta-aktiebolag/`, `/basta-bokforingsprogram/`,
  `/verktyg/bolagsform/`: performance ≥ 90, accessibility ≥ 95, SEO ≥ 95.
- No text under 12 px; every text/background pair ≥ 4.5:1 (the tint-ink pairs above
  are chosen for that — do not lighten them).
- No horizontal scroll at 375 px on any route `tests/screenshots.mjs` covers.
- Fonts: exactly two families loaded, `display: swap`, no third-party CSS.
- Nothing fabricated: no usage counters, no reader counts, no fake avatars.
