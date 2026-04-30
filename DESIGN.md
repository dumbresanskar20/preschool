# Design System Document: The Playful Professional

## 1. Overview & Creative North Star: "The Curated Playground"
This design system moves away from the chaotic, cluttered aesthetic often associated with early childhood education. Our Creative North Star is **"The Curated Playground."** We aim to balance the unbridled joy of a child’s imagination with the sophisticated structure required to instill trust in parents. 

The system breaks the "template" look by utilizing **Intentional Asymmetry**—where soft, oversized organic shapes overlap rigid grid lines—and **Tonal Depth**, replacing harsh borders with a sophisticated layering of warm, creamy surfaces. This is not just a website; it is a digital environment that feels as safe and welcoming as a physical classroom.

---

## 2. Colors: The Sophisticated Rainbow
While the palette is colorful, it is anchored by a warm, paper-like neutral (`surface: #fffadf`) to prevent visual fatigue. We use a "Soft-Pop" approach where vibrant primaries and secondaries are used as intentional accents against a creamy foundation.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** To define sections, designers must use background shifts. For example, a "Meet the Teachers" section should transition from `surface` to `surface-container-low` or `secondary-container` to create a boundary. Boundaries are felt, not seen.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of tactile materials.
*   **Base Layer:** `surface` (The foundation).
*   **Secondary Layer:** `surface-container` (For grouping related content).
*   **Floating Layer:** `surface-container-lowest` (For high-priority cards or modals).
*   **Interactive Layer:** `surface-bright` (For elements that need to "pop" toward the user).

### The "Glass & Gradient" Rule
To add a premium "soul" to the design:
*   **Hero Sections:** Use a subtle linear gradient from `primary` (#b81d27) to `primary-container` (#ffdad7) at a 45-degree angle to create a sense of morning sunlight.
*   **Floating Navigation:** Utilize **Glassmorphism**. Use `surface` at 80% opacity with a `20px` backdrop-blur. This allows the playful background illustrations to bleed through, making the UI feel integrated into the "playground."

---

## 3. Typography: Whimsy Meets Authority
The typography strategy uses a "Dual-Personality" scale.

*   **Display & Headlines (Plus Jakarta Sans):** This typeface offers a geometric, friendly roundness that feels modern and approachable. 
    *   *Usage:* Use `display-lg` for hero statements. Use `headline-sm` for section titles. Ensure tight tracking on large headers to keep the "bubble" aesthetic.
*   **Body & Titles (Be Vietnam Pro):** A highly legible sans-serif that maintains a professional tone for the "Parent-Facing" information.
    *   *Usage:* All instructional text, blog posts, and policy details use `body-md`. 
*   **The Identity Link:** By pairing the playful, large-scale `display-lg` with the clean, organized `body-lg`, we signal to parents that while we value fun, we are academically rigorous.

---

## 4. Elevation & Depth: Tonal Layering
Traditional material shadows are too "tech-focused" for a preschool. We use **Ambient Softness.**

*   **The Layering Principle:** Instead of shadows, place a `surface-container-highest` card on top of a `surface` background. The slight shift in "creaminess" creates a natural, soft lift.
*   **Ambient Shadows:** If an element must float (like a "Register Now" FAB), use a shadow tinted with the `on-surface` color (#1e1c00) at 5% opacity with a `40px` blur. It should look like a soft cloud, not a drop-shadow.
*   **The Ghost Border Fallback:** Only if accessibility requires a container boundary, use `outline-variant` at 15% opacity. This creates a "suggestion" of a line that doesn't break the organic flow.

---

## 5. Components

### Buttons
*   **Primary:** `rounded-full`, background `primary`, text `on-primary`. Use a subtle inner-glow (white at 10% opacity) on the top edge to give it a 3D "button" feel.
*   **Secondary:** `rounded-full`, background `secondary-container`, text `on-secondary-container`. No border.
*   **Tertiary:** `title-sm` text in `primary` color with a `4px` underline in `primary-fixed-dim`.

### Cards (The "Organic Container")
*   **Rule:** Forbid all divider lines.
*   **Styling:** Use `rounded-xl` (3rem) for a "bubbly" feel. Use `surface-container-low` as the background. 
*   **Interaction:** On hover, the card should scale `1.02x` and transition the background to `surface-container-high`.

### Input Fields
*   **Style:** `rounded-md` (1.5rem). Use `surface-container-highest` for the fill. 
*   **Focus State:** A 3px soft outer-glow of `tertiary-fixed` instead of a harsh solid stroke.

### Specialized Preschool Components
*   **Curriculum Chips:** Use `rounded-full` with background colors cycling through the rainbow palette (e.g., `primary-container` for Art, `secondary-container` for Science) to categorize activities visually.
*   **The "Playful" Tooltip:** High-contrast `inverse-surface` with `rounded-sm` (0.5rem) corners, used to explain school terms to new parents.

---

## 6. Do's and Don'ts

### Do:
*   **Use Intentional Asymmetry:** Let a cartoon illustration of a bunny "peak" over the edge of a container.
*   **Embrace White Space:** Use the `xl` (3rem) roundedness to create "islands" of content surrounded by the `surface` color.
*   **Color-Code for Parents:** Use `tertiary` (Blue) for logistical/admin info and `primary` (Red) for emotional/community info.

### Don't:
*   **Don't use 100% Black:** Always use `on-surface` (#1e1c00) for text to keep the vibe warm and soft.
*   **Don't use sharp corners:** Nothing in the "playground" should be sharp. If a component isn't `rounded-md` at minimum, it doesn't belong.
*   **Don't use Grid Dividers:** If you need to separate content, use a `32px` or `64px` vertical spacing gap or a change in surface tone. Lines create "barriers"; we want "flow."

### Accessibility Note:
While we use soft colors, ensure that all `on-container` text maintains a 4.5:1 contrast ratio against its respective `container` color. The `primary` and `secondary` tokens have been specifically tuned to pass these checks against the `surface` background.