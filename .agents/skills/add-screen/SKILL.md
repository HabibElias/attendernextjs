---
name: add-screen
description: Add an authorized Attender product screen using Taste for layout, Impeccable for audit/anti-slop, pick-ui-library for primitives, and strict size limits.
---

# Add a Product Screen

Follow this 5-stage workflow whenever adding or redesigning a screen:

1. **Understand Purpose & Contract**:
   - Check the target route (`(auth)` or `(app)`).
   - Ensure input/output contracts exist in `src/lib/contracts/*`.

2. **Layout & Feel (Taste)**:
   - Use `design-taste-frontend` (`taste`) to establish structure, visual hierarchy, spacing, typography, and viewport adaptation.
   - Ground copy in the real Attender domain (teachers, students, QR attendance, schedules).
   - No generic template fluff, overused purple gradients, or floating badge clichés.

3. **Component Selection (Pick-UI-Library)**:
   - For interactive or complex UI controls (Select, Dialog/Modal, Tabs, Dropdowns, Date/Calendar):
     - Check `pick-ui-library` to select accessible headless primitives (Base UI, Radix/shadcn) instead of fragile custom implementations.

4. **Refinement & Anti-Slop (Impeccable)**:
   - Use `impeccable` to audit hierarchy, micro-interactions, tokens from `src/styles/tokens.css`, and contrast.
   - Implement all 5 required accessible states:
     - `loading`
     - `empty`
     - `error`
     - `permission-denied`
     - `success`
   - Verify responsive behavior down to 360px viewport width.

5. **Refactoring & Quality Gate**:
   - Thin routes: `page.tsx` and `layout.tsx` must be <= 60 lines.
   - Handwritten source files <= 200 lines, functions <= 60 lines, complexity <= 10, parameters <= 4.
   - Split by responsibility before exceeding limits.
   - Run `pnpm check` and fix any issues without disabling rules.
