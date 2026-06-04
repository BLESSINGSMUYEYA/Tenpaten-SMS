---
name: EduCore Modern Identity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#425e91'
  primary: '#002452'
  on-primary: '#ffffff'
  primary-container: '#1b3a6b'
  on-primary-container: '#89a5dd'
  inverse-primary: '#acc7ff'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#6bfe9c'
  on-secondary-container: '#00743a'
  tertiary: '#3c1e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b3000'
  on-tertiary-container: '#d7985f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#294678'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#fcb87d'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#693c0a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  warning: '#F39C12'
  danger: '#E74C3C'
  surface-background: '#F8FAFC'
  surface-border: '#E2E8F0'
  text-ink: '#0F172A'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  touch-target-min: 48px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style

The design system is engineered to convey **stability, growth, and efficiency** for educational institutions across sub-Saharan Africa. The visual language balances high-stakes administrative reliability with a welcoming atmosphere for parents and students.

Drawing from the **Corporate / Modern** aesthetic with a lean toward **High-Contrast** functionalism, the system prioritizes clarity and speed. It avoids unnecessary decorative flourishes, favoring "information-first" layouts that perform exceptionally well under high-ambient light conditions (outdoor usage) and on diverse mobile hardware. The aesthetic is "utilitarian-premium"—feeling like a high-end tool that is nonetheless accessible to everyone in the school ecosystem.

## Colors

The color strategy is anchored by **Deep Royal Blue**, chosen to evoke the institutional trust associated with traditional education. This is punctuated by **Vibrant Green**, symbolizing growth, progress, and student success.

To ensure the high contrast required for outdoor readability, the system utilizes a "Slate" neutral palette. Pure black is avoided in favor of `#0F172A` to maintain a professional depth, while backgrounds use very light, cool-toned grays to reduce eye strain during prolonged administrative use. 

Color is used functionally:
- **Primary Blue:** For structural elements, navigation, and primary actions.
- **Accent Green:** For success states, financial credits, and "growth" metrics.
- **Warning/Danger:** Strictly reserved for attendance alerts, overdue fees, or system errors.

## Typography

The typography system uses **Plus Jakarta Sans** for headlines to provide a contemporary, open, and friendly feel. Its geometric nature ensures headings are legible at a glance. **DM Sans** is utilized for body text and data tables; its low contrast and stable letterforms make it highly readable in dense information environments like student gradebooks or financial ledgers.

For mobile-first optimization, large headlines scale down to prevent excessive line-breaking, while body text remains at a minimum of `16px` for standard roles to ensure accessibility. Letter spacing is slightly tightened on headlines for a more "designed" look and widened on small labels to maintain legibility.

## Layout & Spacing

The design system employs an **8px linear grid** to ensure mathematical harmony across all components. 

### Grid Philosophy
- **Mobile-First:** Layouts prioritize a single-column stack with 16px side margins. 
- **Fluid Grid:** Content uses a 12-column fluid system on desktop but switches to 4 columns on mobile.
- **Touch Readiness:** All interactive elements (buttons, inputs, list items) must adhere to a minimum 48px height/width touch target.

### Breakpoints
- **Mobile:** < 640px. 16px margins, tight vertical rhythm.
- **Tablet:** 640px – 1024px. 24px margins, sidebars collapse into a "bottom-bar" or "hamburger" menu.
- **Desktop:** > 1024px. 40px margins, fixed-width side navigation for administrative efficiency.

## Elevation & Depth

To maintain a "print-ready" and clean aesthetic, the design system avoids heavy, realistic shadows. Depth is communicated through **Tonal Layering** and **Crisp Outlines**.

- **Surface Levels:** The primary background is the lowest level (`#F8FAFC`). Cards and containers sit on a white (`#FFFFFF`) surface.
- **Outlines:** Instead of shadows, use 1px solid borders (`#E2E8F0`) to define containers. This ensures clarity when the UI is printed or viewed on low-brightness screens.
- **Interaction Depth:** Only "floating" elements like Modals or Dropdowns use a soft, neutral shadow (0px 4px 12px, 5% opacity black) to distinguish them from the base layout. 
- **Active States:** Pressed or focused states use a 2px Primary Blue ring to provide high-visibility feedback without changing the layout size.

## Shapes

The design system uses a **Rounded (0.5rem / 8px)** base to soften the "institutional" feel of a school system, making it appear more modern and approachable. 

- **Components:** Standard buttons, input fields, and cards use the base `0.5rem` radius.
- **Large Elements:** Featured containers or login cards use `1rem`.
- **Status Pills:** Badges and chips use a "Full Round" (Pill) shape to distinguish them from actionable buttons.
- **Data Tables:** These remain sharp or have very minimal rounding (`4px`) to maximize horizontal space for data columns.

## Components

### Buttons
Primary buttons are solid Deep Royal Blue with white text. Secondary buttons use the Primary Blue as an outline (Ghost style). The Vibrant Green is reserved exclusively for "Positive Actions" (e.g., Pay Fees, Approve Application). All buttons must have a minimum height of 48px on mobile.

### Inputs
Text fields feature a floating label or a high-contrast top-aligned label. The border-bottom is thickened when focused to provide a clear indicator for users on mobile devices. Error states use the Danger Red with a supporting icon for accessibility.

### Cards
Cards are the primary container for student profiles and module summaries. They use a white background and a 1px Slate border. Headers within cards should use the `label-sm` style for metadata and `headline-md` for titles.

### Lists & Tables
In the multi-tenant dashboard, lists are the core of the experience. List items must have generous vertical padding (12px - 16px) to allow for easy thumb-tapping. Alternating row colors (Zebra striping) using `#F8FAFC` are required for data-heavy tables to assist the eye.

### Chips & Badges
Small, rounded pills used for status indicators (e.g., "Paid", "Absent", "Pending"). These use low-opacity versions of the semantic colors (e.g., 10% Green background with 100% Green text) to ensure they don't compete with primary call-to-actions.