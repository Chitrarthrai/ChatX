# Color system

Muted, desaturated palette for the platform's web and mobile apps — sized for light and dark themes, and formatted as shadcn/ui-compatible CSS variables (HSL triplets) for direct use with the Next.js + Tailwind + shadcn/ui stack. Every text/background and button-label pairing below is WCAG AA-validated: ≥4.5:1 for text, ≥3:1 for large text and UI components.

## Approach

- **Neutrals** — a cool, desaturated slate (hue ~222°) rather than a true gray or warm gray. Reads calmer next to video tiles and camera footage.
- **Primary** — a muted indigo / blue-violet, the same family as Slack, Teams, Discord, and Linear. Reads as "productivity software" without going anywhere near saturated/neon.
- **Semantic** (success, warning, error, info) — each has a light tint for badges, a solid for buttons, and a dark-mode-adjusted variant. Amber (warning) is the one color where white text fails contrast at any reasonably muted saturation, so it intentionally pairs with dark text instead — same convention most mature systems use.
- **Dark background isn't pure black** (`#0F121A`) — easier on the eyes through long meetings, and it leaves room for card/page elevation to actually read as elevation.

## Token reference

| Token | Light | Dark | Used for |
|---|---|---|---|
| `background` | `#FAFBFC` | `#0F121A` | App canvas |
| `foreground` | `#1D212D` | `#FAFBFC` | Body text |
| `card` | `#FFFFFF` | `#1D212D` | Cards, panels, message list |
| `primary` | `#3C419A` | `#7176C6` | Primary buttons, active nav, sent messages |
| `secondary` / `muted` | `#F3F4F7` | `#2D3443` | Secondary buttons, received messages |
| `muted-foreground` | `#667085` | `#A3AAB8` | Timestamps, captions, placeholders |
| `border` / `input` | `#E4E7EC` / `#CDD1DA` | `#2D3443` / `#424A5C` | Dividers / form control edges |
| `ring` | `#4C53B6` | `#7176C6` | Focus outline |
| `success` | `#347F5C` | `#6BB38F` | Online status, sent/delivered |
| `warning` | `#C0892A` | `#D6A351` | Away/idle, pending state |
| `destructive` | `#B93740` | `#D76A71` | Errors, delete, recording indicator |
| `info` | `#397CAC` | `#68A2CF` | Notices, "meeting starting soon" |

## `app/globals.css`

```css
:root {
  /* Primitives — neutral (slate), mode-stable */
  --neutral-50: 210.0 25.0% 98.4%;
  --neutral-100: 225.0 20.0% 96.1%;
  --neutral-200: 217.5 17.4% 91.0%;
  --neutral-300: 221.5 14.9% 82.9%;
  --neutral-400: 220.0 12.9% 68.0%;
  --neutral-500: 220.6 13.2% 46.1%;
  --neutral-600: 221.4 13.9% 41.0%;
  --neutral-700: 221.5 16.5% 31.0%;
  --neutral-800: 220.9 19.6% 22.0%;
  --neutral-900: 225.0 21.6% 14.5%;
  --neutral-950: 223.6 26.8% 8.0%;

  /* Primitives — primary (indigo), mode-stable */
  --primary-50: 232.5 44.4% 96.5%;
  --primary-100: 233.3 47.4% 92.5%;
  --primary-200: 233.5 46.8% 84.5%;
  --primary-300: 235.2 44.9% 72.9%;
  --primary-400: 236.5 42.7% 61.0%;
  --primary-500: 236.0 42.1% 50.6%;
  --primary-600: 236.8 43.9% 42.0%;
  --primary-700: 237.0 45.5% 34.5%;
  --primary-800: 238.0 42.9% 27.5%;
  --primary-900: 238.6 40.0% 21.6%;
  --primary-950: 240.0 42.4% 12.9%;

  /* Primitives — semantic scales, mode-stable */
  --success-100: 152.0 48.4% 93.9%; --success-400: 150.0 32.1% 56.1%;
  --success-500: 152.0 41.9% 35.1%; --success-900: 152.9 44.9% 13.5%;
  --warning-100: 39.4 80.0% 92.2%;  --warning-400: 37.0 61.9% 57.8%;
  --warning-500: 38.0 64.1% 45.9%;  --warning-900: 32.0 57.0% 15.5%;
  --error-100: 354.0 71.4% 94.5%;   --error-400: 356.1 57.7% 62.9%;
  --error-500: 355.8 54.2% 47.1%;   --error-900: 354.9 52.8% 17.5%;
  --info-100: 204.0 71.4% 94.5%;    --info-400: 206.2 51.8% 61.0%;
  --info-500: 205.0 50.2% 44.9%;    --info-900: 204.3 46.8% 15.5%;

  /* Semantic tokens — light theme */
  --background: var(--neutral-50);
  --foreground: var(--neutral-900);
  --card: 0 0% 100%;
  --card-foreground: var(--neutral-900);
  --popover: 0 0% 100%;
  --popover-foreground: var(--neutral-900);
  --primary: var(--primary-600);
  --primary-foreground: 0 0% 100%;
  --secondary: var(--neutral-100);
  --secondary-foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-500);
  --accent: var(--primary-50);
  --accent-foreground: var(--primary-700);
  --destructive: var(--error-500);
  --destructive-foreground: 0 0% 100%;
  --success: var(--success-500);
  --success-foreground: 0 0% 100%;
  --warning: var(--warning-500);
  --warning-foreground: var(--neutral-900);
  --info: var(--info-500);
  --info-foreground: 0 0% 100%;
  --border: var(--neutral-200);
  --input: var(--neutral-300);
  --ring: var(--primary-500);
  --radius: 0.625rem;
}

.dark {
  --background: var(--neutral-950);
  --foreground: var(--neutral-50);
  --card: var(--neutral-900);
  --card-foreground: var(--neutral-50);
  --popover: var(--neutral-900);
  --popover-foreground: var(--neutral-50);
  --primary: var(--primary-400);
  --primary-foreground: var(--neutral-950);
  --secondary: var(--neutral-800);
  --secondary-foreground: var(--neutral-50);
  --muted: var(--neutral-800);
  --muted-foreground: var(--neutral-400);
  --accent: var(--neutral-800);
  --accent-foreground: var(--primary-300);
  --destructive: var(--error-400);
  --destructive-foreground: var(--neutral-950);
  --success: var(--success-400);
  --success-foreground: var(--neutral-950);
  --warning: var(--warning-400);
  --warning-foreground: var(--neutral-950);
  --info: var(--info-400);
  --info-foreground: var(--neutral-950);
  --border: var(--neutral-800);
  --input: var(--neutral-700);
  --ring: var(--primary-400);
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

## `tailwind.config.ts` — extend `theme.colors`

```ts
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
  info: {
    DEFAULT: "hsl(var(--info))",
    foreground: "hsl(var(--info-foreground))",
  },
},
```

For React Native (NativeWind or a plain theme object), reuse the same hex values directly from the primitive tables above — RN doesn't read CSS variables, so export the resolved hex pairs as a `theme.ts` object shared between apps via `packages/config`.

## Implementation notes

- **Video/meeting stage background** — keep the meeting grid and video tile surround on the dark neutral steps (`neutral-900` / `950`) even when the rest of the app is in light theme. Camera footage needs a neutral dark surround for contrast and to stop skin tones/whites from looking blown out — Meet, Zoom, and Teams all do this regardless of the app's own theme.
- **Presence dots** reuse existing tokens rather than adding new ones: online = `success`, away/idle = `warning`, do-not-disturb = `destructive`, offline = `neutral-400`.
- **Recording indicator** = `destructive`, consistent with its use for errors/delete — recording is the one place a little alarm is appropriate.
- **Input borders are intentionally soft** (`neutral-300` / `neutral-700`, not a harder line). The accessible affordance for keyboard/interaction is the `ring` token on focus, which clears 3:1+ against both themes — the same pattern shadcn/ui ships with by default.
