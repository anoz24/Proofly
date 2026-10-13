# Proofly: Brand Guide

Cool, minimal, blue. Calm enough to trust with payments, friendly enough that a buyer on their phone isn't intimidated.

- **Name:** Proofly (wordmark is always lowercase: `proofly`)
- **Tagline:** Payments, proven.
- **Personality:** calm, clear, quietly confident. Short sentences, no hype.

---

## 1. Logo

**Mark:** a rounded square tile holding a two-tone tick. The short stroke is Sky, the long stroke is white.
**Wordmark:** `proofly`, Sora SemiBold (600), tracking `-0.03em`. "proof" takes the main text color, "ly" takes a tonal blue chosen for the background.

### Mark SVG (use for `components/logo.tsx`, `app/icon.svg`, favicon)

```svg
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Proofly">
  <rect width="48" height="48" rx="13" fill="#1F4FE0"/>
  <path d="M14 25.5 L21 32.5" stroke="#9CC7FF" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M21 32.5 L34 16.5" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" fill="none"/>
</svg>
```

### Inverted mark (for use on Proof Blue backgrounds)

```svg
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Proofly">
  <rect width="48" height="48" rx="13" fill="#FFFFFF"/>
  <path d="M14 25.5 L21 32.5" stroke="#4F8CFF" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M21 32.5 L34 16.5" stroke="#1F4FE0" stroke-width="4.5" stroke-linecap="round" fill="none"/>
</svg>
```

### Lockup variants

| Background | Mark | "proof" | "ly" |
|---|---|---|---|
| Light (Frost / white) | standard | Midnight `#0A1633` | Proof Blue `#1F4FE0` |
| Proof Blue `#1F4FE0` | inverted | White | Mist `#DCEBFF` |
| Midnight `#0A1633` | standard | White | Sky `#9CC7FF` |

### Rules
- Mark and wordmark sit side by side. Gap is about 28% of the mark's height. Mark height is roughly the wordmark's cap height plus ascender.
- **Clear space:** half the mark's width on every side.
- **Minimum size:** mark alone 24 px. Lockup at least 96 px wide.
- Never stretch, rotate, outline or recolor outside the variants above. Never capitalize the wordmark.

---

## 2. Color

Seven blues from deep to pale. Deep tones carry text and structure, bright tones carry action, pale tones carry space.

| Token | Name | Hex | Use |
|---|---|---|---|
| `midnight` | Midnight | `#0A1633` | Body text, dark surfaces |
| `navy` | Navy | `#14307A` | Headings on pale, labels |
| `proof` | Proof Blue | `#1F4FE0` | Primary buttons, links, active states |
| `azure` | Azure | `#4F8CFF` | Focus rings, accents, graphic highlights |
| `sky` | Sky | `#9CC7FF` | Dashed borders, highlights, chart fills |
| `mist` | Mist | `#DCEBFF` | Badges, subtle fills, focus halo |
| `frost` | Frost | `#F4F8FF` | Page background |

Supporting neutrals (derived from the blue ramp):

| Token | Hex | Use |
|---|---|---|
| `ink-muted` | `#3C4A6B` | Secondary text, captions |
| `line` | `#C9DDF8` | Input borders |
| `line-soft` | `#DCEBFF` | Card borders, table dividers (same as Mist) |
| `white` | `#FFFFFF` | Cards, inputs |

### Status colors (the only non-blue colors)
Reserved strictly for payment state. Never use them for decoration.

| State | Text | Background |
|---|---|---|
| Pending | `#8A4B08` | `#FEF3C7` |
| Verified | `#0B6B43` | `#DDF5E8` |
| Rejected | `#A3231A` | `#FDE7E5` |
| Activation: Sent | `#14307A` | `#DCEBFF` |
| Activation: Not sent | `#3C4A6B` | `#F4F8FF` with `1.5px solid #C9DDF8` border |

### Contrast notes (must follow)
- White text on **Proof Blue**: 6.4:1, fine for any size.
- **Do not put white text on Azure** (about 3.2:1). Use Midnight text on Azure, or keep Azure to non-text accents.
- On **Sky, Mist and Frost** always use Midnight or Navy text.
- Secondary text is `ink-muted` on Frost or white, about 8:1.

---

## 3. Typography

Two typefaces, both free on Google Fonts.

| Role | Font | Weights |
|---|---|---|
| Display, headings, wordmark, numbers in stat tiles | **Sora** | 500, 600, 700 |
| Interface, body, forms, tables | **Manrope** | 400, 500, 600, 700 |

Scale (px, desktop / mobile):

| Style | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| H1 | Sora | 32 / 28 | 600 | 1.2 | -0.02em |
| H2 | Sora | 24 / 22 | 600 | 1.2 | -0.02em |
| Stat number | Sora | 28 | 600 | 1.1 | 0 |
| Body | Manrope | 16 | 400 | 1.55 | 0 |
| Label / field label | Manrope | 14 | 600 | 1.4 | 0 |
| Small / caption | Manrope | 13 | 500 | 1.4 | 0 |
| Eyebrow (caps) | Manrope | 12–13 | 700 | 1.2 | 0.08–0.12em, uppercase |

Sentence case everywhere in the UI. Only the wordmark is lowercase by design.

---

## 4. Shape and spacing

| Element | Radius |
|---|---|
| Inputs, buttons | 14 px |
| Dropzone, stat tiles | 16–18 px |
| Cards | 24 px (large panels 28 px) |
| Badges | pill (999 px) |

- Borders are `1.5px` in Mist or `line`. No heavy shadows. The only shadow is the focus halo.
- Spacing steps: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72.
- Touch targets at least 44 px tall. Inputs and buttons are 52 px.
- Page background is Frost. Cards are white on Frost with a Mist border.

---

## 5. Components

**Primary button:** 52 px tall, radius 14, background Proof Blue, white text, Manrope 700 16 px. Hover: slightly darker (`#1A44C4`). Disabled: Proof Blue at 50% opacity.

**Input:** 52 px tall, radius 14, 1.5 px `line` border, white fill, 16 px text (16 px prevents iOS zoom). **Focus:** border Azure `#4F8CFF` plus a `0 0 0 4px #DCEBFF` halo. **Error:** border `#A3231A`, small message below in the same color.

**Label:** above the field, Manrope 600 14 px, Navy.

**Dropzone (screenshot upload):** 128 px tall, `2px dashed #9CC7FF`, radius 18, background Frost. Title "Tap to upload screenshot" in Proof Blue bold, helper "PNG, JPG or WebP · up to 5 MB" in `ink-muted`. After a file is chosen: show the preview thumbnail with a "Replace" link.

**Stat tile:** radius 16, Frost fill, 1.5 px Mist border, label 13 px `ink-muted`, number Sora 28. One tile may be highlighted in Proof Blue with white text (use it for "Needs activation").

**Table row:** 14 px vertical padding, 1.5 px Mist top border, email in 15 px semibold, phone below in 13 px `ink-muted`, badges right-aligned.

**Badge:** pill, 13 px bold, padding `5px 12px`, colors from the status table.

---

## 6. Voice and copy

Short, plain, reassuring. Say what happens next.

- Page title: **Send your payment proof**
- Subtitle: Upload a screenshot of your transfer. We'll verify it and email your activation link.
- Button: **Submit proof**
- Success: **Received. We'll verify your payment and email your activation link soon.**
- Error (file too large): That file is over 5 MB. Try a smaller screenshot.
- Error (wrong type): Please upload a PNG, JPG or WebP image.
- Privacy line (under the form): Your screenshot is only used to verify your payment.
- Admin empty state: No submissions yet. They'll show up here as soon as someone sends proof.

---

## 7. Design tokens (copy into the project)

### Tailwind v4 (`app/globals.css`)

```css
@import "tailwindcss";

@theme inline {
  --color-midnight: #0A1633;
  --color-navy: #14307A;
  --color-proof: #1F4FE0;
  --color-azure: #4F8CFF;
  --color-sky: #9CC7FF;
  --color-mist: #DCEBFF;
  --color-frost: #F4F8FF;
  --color-ink-muted: #3C4A6B;
  --color-line: #C9DDF8;

  --color-status-pending-fg: #8A4B08;
  --color-status-pending-bg: #FEF3C7;
  --color-status-verified-fg: #0B6B43;
  --color-status-verified-bg: #DDF5E8;
  --color-status-rejected-fg: #A3231A;
  --color-status-rejected-bg: #FDE7E5;

  --font-display: var(--font-sora), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;

  --radius-control: 14px;
  --radius-tile: 18px;
  --radius-card: 24px;
}

body {
  background: var(--color-frost);
  color: var(--color-midnight);
  font-family: var(--font-sans);
}
```

This gives you utilities like `bg-proof`, `text-navy`, `border-mist`, `font-display`, `rounded-card`. If the project is on Tailwind v3, move the same values into `theme.extend.colors`, `fontFamily` and `borderRadius` in `tailwind.config.ts`.

### Fonts (`app/layout.tsx`)

```tsx
import { Sora, Manrope } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope" });

// <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
```

### Logo component (`components/logo.tsx`)

```tsx
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Proofly">
      <rect width="48" height="48" rx="13" fill="#1F4FE0" />
      <path d="M14 25.5 L21 32.5" stroke="#9CC7FF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M21 32.5 L34 16.5" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ size = 36, tone = "light" }: { size?: number; tone?: "light" | "dark" }) {
  const proof = tone === "dark" ? "text-white" : "text-midnight";
  const ly = tone === "dark" ? "text-sky" : "text-proof";
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={size} />
      <span className={`font-display font-semibold leading-none tracking-[-0.03em] ${proof}`} style={{ fontSize: size * 0.78 }}>
        proof<span className={ly}>ly</span>
      </span>
    </span>
  );
}
```

Save the standard mark SVG as `app/icon.svg` so Next.js uses it as the favicon automatically.

---

## 8. Do and don't

**Do**
- Keep screens mostly Frost and white, with Proof Blue only on the one primary action.
- Use Mist for fills and dividers instead of grey.
- Let Sora carry the personality (headings, numbers) and Manrope stay quiet.

**Don't**
- Don't use white text on Azure.
- Don't use red, green or amber outside payment status.
- Don't add gradients, heavy shadows, emoji or stock illustrations.
- Don't capitalize the wordmark or recolor the tick.