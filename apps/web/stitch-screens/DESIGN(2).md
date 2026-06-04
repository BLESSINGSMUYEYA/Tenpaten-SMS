---
name: Tenpaten School Management
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
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006d30'
  on-secondary: '#ffffff'
  secondary-container: '#92f5a4'
  on-secondary-container: '#007233'
  tertiary: '#5d0004'
  on-tertiary: '#ffffff'
  tertiary-container: '#870009'
  on-tertiary-container: '#ff8b7f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#95f8a7'
  secondary-fixed-dim: '#79db8d'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is anchored in the principles of **Stability, Accuracy, and Inclusion**. As a school management platform, it must project an aura of institutional trust while remaining approachable to users with varying levels of digital literacy. 

The visual style is **Corporate / Modern**, heavily influenced by functional utility. It prioritizes high-contrast ratios, clear information density, and an intuitive hierarchy that minimizes cognitive load. By avoiding decorative flourishes and focusing on structured layouts, the system ensures that critical data—such as student attendance and financial records—is always the primary focus. The aesthetic is "invisible," serving as a reliable vessel for the school's daily operations.

## Colors

The palette is functional and semantic, designed to provide immediate feedback to the user.

*   **Primary (#1e3a8a):** A deep, professional blue used for navigation, primary actions, and branding. It conveys authority and permanence.
*   **Success (#15803d):** A vibrant green dedicated to "Paid" statuses, "Present" attendance markers, and completed tasks.
*   **Destructive (#b91c1c):** A sharp red used sparingly for "Overdue" fees, "Absent" markers, and critical deletions.
*   **Neutral Palette:** A sophisticated range of grays (Slate) provides the structural scaffolding. Backgrounds utilize very light cool grays to reduce eye strain during long working hours.

Color contrast must always meet WCAG AA standards to ensure legibility for all staff members.

## Typography

This design system utilizes **Inter** for all roles. Inter’s high x-height and distinct letterforms make it exceptionally readable on standard-resolution monitors often found in school environments.

*   **Hierarchy:** Use `headline-lg` exclusively for dashboard overviews. `headline-sm` is the standard for card titles and section headers.
*   **Utility:** `label-md` is used for table headers and small captions to provide clear distinction from data.
*   **Data Entry:** All input text and table cell data should use `body-md` for optimal balance between density and readability.

## Layout & Spacing

The system follows a **Fixed-Fluid Hybrid** grid model. 
*   **Desktop:** A 12-column grid with a max-width of 1440px. Sidebars are fixed at 280px to ensure navigation is always accessible.
*   **Spacing Rhythm:** An 8px linear scale is used for all spatial relationships. 16px (`md`) is the standard padding for containers and cards.
*   **Information Density:** For power users (Bursars/Registrars), use "Compact" layouts in data tables with 8px vertical cell padding. For teachers on tablets, use "Relaxed" spacing with 16px padding to accommodate touch targets.

## Elevation & Depth

This design system uses a **layered surface** approach combined with **low-contrast outlines** to define hierarchy without the visual noise of heavy shadows.

1.  **Level 0 (Canvas):** The lowest layer, using a subtle off-white background (#f8fafc).
2.  **Level 1 (Cards/Sections):** White background with a 1px border (#e2e8f0). This is the primary surface for content.
3.  **Level 2 (Modals/Popovers):** White background with a soft, ambient shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to pull the element forward.

Avoid using shadows for static elements; use borders to define structure and shadows only for temporary or interactive overlays.

## Shapes

The shape language is **Soft and Professional**. 
*   **Standard Elements:** Buttons, Input fields, and Cards use a 0.25rem (4px) corner radius. This provides a clean, disciplined look that feels more "official" than fully rounded shapes.
*   **Status Tags:** Use a slightly higher radius (rounded-lg / 8px) to distinguish them from interactive buttons.
*   **Iconography:** Icons should feature capped ends and consistent stroke weights (2px) to match the professional weight of the Inter typeface.

## Components

### Status Indicators (Badges)
Crucial for SMS functionality. Use high-contrast pill shapes with a light background and dark text:
*   **Paid/Present:** Light green background, dark green text.
*   **Unpaid/Absent:** Light red background, dark red text.
*   **Pending/Draft:** Light amber background, dark amber text.

### Buttons
*   **Primary:** Solid Primary Blue with white text.
*   **Secondary:** White background with 1px Slate-200 border.
*   **Ghost:** No border or background, used for secondary dashboard actions.

### Input Fields
*   Labels must always be visible (never use placeholder-only labels).
*   Active state: 1px Primary Blue border with a subtle 2px blue outer glow.
*   Error state: 1px Red border with red helper text below.

### Cards
Cards are the primary container for student profiles and fee summaries. They must feature a consistent header row with a `label-sm` category and a `headline-sm` title.

### Tables
Tables must include "Zebra Striping" (alternating light gray rows) to help first-time users track data across wide screens. The header row should be sticky and use a distinct light-gray background.