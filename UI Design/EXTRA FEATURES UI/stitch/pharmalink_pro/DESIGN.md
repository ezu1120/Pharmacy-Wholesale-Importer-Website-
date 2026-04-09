# Design System Strategy: The Clinical Precision Framework

## 1. Overview & Creative North Star: "The Digital Curator"
In the high-stakes world of pharmaceutical wholesale, trust is not built through decorative flair, but through absolute clarity and organized authority. Our Creative North Star is **"The Digital Curator."** 

This design system rejects the "cluttered dashboard" aesthetic of legacy B2B software. Instead, it adopts an editorial, high-end medical journal approach. We break the "template" look by using **intentional asymmetry**—large headings offset against wide margins—and **tonal depth**. We are moving away from a flat web interface toward a multi-layered digital workspace that feels as sterile and precise as a laboratory, yet as premium as a private bank.

---

## 2. Colors: The Tonal Spectrum
Our palette is rooted in the reliability of `primary` (#003f87), but its sophistication comes from the surrounding neutrals and "air."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Traditional "boxes" make an interface feel rigid and dated. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sitting on a `surface` background provides all the definition needed without the visual "noise" of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the `surface-container` tiers to create "nested" depth:
- **Base Level:** `surface` (#f8f9fa) for the main application background.
- **Section Level:** `surface-container-low` for grouping related content blocks.
- **Action Level:** `surface-container-lowest` (#ffffff) for primary interactive cards or product details.
This creates a soft, natural lift where the most important information physically feels "closer" to the user.

### The "Glass & Gradient" Rule
To escape the "standard bootstrap" feel, utilize **Glassmorphism** for floating elements (like headers or floating RFQ summaries). Use `surface` colors at 80% opacity with a `backdrop-filter: blur(20px)`. 
- **Signature Texture:** For primary CTAs or Hero sections, apply a subtle linear gradient from `primary` (#003f87) to `primary-container` (#0056b3) at a 135-degree angle. This adds "soul" and a sense of light source that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (UI/Body) to balance clinical precision with corporate strength.

*   **Display & Headlines (Manrope):** These are our "Editorial" voices. Use `display-lg` for hero product launches and `headline-md` for category headers. The wider tracking and geometric builds of Manrope convey a modern, institutional trust.
*   **Body & Labels (Inter):** Inter is the workhorse. It is engineered for legibility in dense data environments (like drug specifications or SKU lists). 
*   **The Power of Scale:** We use a high-contrast scale. A `display-lg` (3.5rem) title may sit near a `label-md` (0.75rem) metadata tag. This gap creates a sophisticated, "designed" feel that signals intentionality.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to hide poor layout; we use them to mimic ambient light.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` section. The change in hex code provides a "soft lift" that is easier on the eyes than high-contrast shadows.
*   **Ambient Shadows:** When a element must float (e.g., a "Request Quotation" modal), use a `0px 20px 40px` blur with a 4% opacity of the `on-surface` color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-density data grid), use the `outline-variant` token at **10-20% opacity**. Never use a 100% opaque border.
*   **Glassmorphism:** Use semi-transparent layers for navigation bars to allow the product photography to "bleed" through as the user scrolls, maintaining a sense of place within the catalog.

---

## 5. Components: Clinical Primitives

### Buttons
- **Primary ("Request Quotation"):** Uses the signature gradient (`primary` to `primary-container`). 12px radius. High-end, bold, and authoritative.
- **Secondary ("Add to RFQ"):** No fill. Uses a `Ghost Border` with `primary` text. It feels lighter, encouraging secondary actions without competing with the main conversion.
- **Tertiary:** Text-only with a subtle `surface-container` background on hover.

### Product Cards
- **Construction:** No borders. Use `surface-container-lowest` on a `surface` background.
- **Spacing:** Minimum 24px internal padding to provide "medical-grade" breathing room.
- **Interaction:** On hover, the card should transition from a `surface-container-lowest` to a very subtle `Ambient Shadow` and a 2px upward shift (Y-axis).

### Input Fields & Search
- **Style:** Understated. Use `surface-container-high` backgrounds with no borders. Upon focus, the background shifts to `surface-container-lowest` with a 1px `primary` Ghost Border. 
- **Typography:** Placeholder text uses `on-surface-variant` at 60% opacity.

### Chips & Badges
- **Status Chips (e.g., "In Stock"):** Use `secondary-container` with `on-secondary-container` text. Keep corners "full" (9999px) for a softer, pill-like medical aesthetic.

### Pro-Context Components
- **The RFQ Floating Bar:** A glassmorphic bar at the bottom of the screen that tracks selected items, using `surface-blur` and a `primary` action button.
- **The Dosage/Purity Grid:** A specialized data display component using `body-sm` in a multi-column layout with alternating `surface-container-low` backgrounds instead of divider lines.

---

## 6. Do's and Don'ts

### Do:
- **Do** use whitespace as a functional element. If an interface feels "empty," it means the user can focus.
- **Do** use `surface-container` shifts to group related medical data.
- **Do** ensure all "Request Quotation" actions are the most visually weighted elements on the page.

### Don't:
- **Don't** use black (#000000) for text. Use `on-surface` (#191c1d) to maintain a soft, premium feel.
- **Don't** use 1px solid dividers between product list items. Use 16px of vertical spacing or a subtle `surface-variant` background shift.
- **Don't** use aggressive animations. Transitions should be "Snappy but Soft"—200ms ease-out is the standard.
- **Don't** crowd the "Add to RFQ" buttons. Give them the same "breathing room" as the product imagery.