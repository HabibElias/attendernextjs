# Attender Next.js Agent Guidance

Read this document and the Flutter analysis blueprint before making changes.

- **Stack**: Next.js App Router, TypeScript, Tailwind CSS v4, Zod, Vitest.
  Use pinned pnpm and Node versions.
- **Application Scope**: Classroom attendance management (migrating from Flutter).
  Two distinct user roles: Teacher (classes, schedules, sessions, QR codes) and
  Student (classes, sessions, QR scanning, attendance submission).
- **Backend Architecture**: Go REST API backend; Next.js frontend interacts via
  server-side DAL/adapters and typed Server Actions.
- **Route Organization**:
  - Auth routes: `src/app/(auth)/login`, `src/app/(auth)/signup`, `src/app/(auth)/onboarding`
  - App routes: `src/app/(app)/dashboard`, `src/app/(app)/classes`, `src/app/(app)/sessions`, `src/app/(app)/scan`, `src/app/(app)/profile`
  - API routes: `src/app/api/v1/*`
  - Routes only compose and delegate. Keep route, page, and layout files <= 60 nonblank/noncomment lines.
- **Feature Names**: `auth`, `teacher-classes`, `teacher-sessions`, `student-classes`, `attendance-qr`, `profile`.
  Features never import other features directly. Share through `src/components/ui`, `src/lib`, or `src/server`.
- **Server Boundaries**:
  - Runtime `src/server` modules must import `server-only`.
  - Client modules cannot reach server code, including through barrels or dynamic imports.
  - Native Server Action references (`"use server"`) are the only supported cross-boundary bridge.
- **Source Size Discipline**:
  - Handwritten source files <= 200 lines, functions <= 60 lines, cyclomatic complexity <= 10, parameters <= 4.
  - Test files may have <= 300 lines.
  - Split by responsibility, not line count. Split before you exceed. Never raise a limit or disable a rule to pass.
- **Contracts & Validation**:
  - Pure Zod schemas live in `src/lib/contracts/*`.
  - Server actions and HTTP endpoints validate with shared contracts.
  - No submitted values, passwords, or raw backend stack traces in error responses.
- **Error Mapping & Result Envelopes**:
  - Server Actions use `actionResult` with safe error codes (`VALIDATION_FAILED`, `UNAUTHENTICATED`, `FORBIDDEN`, `CONFLICT`, `INTERNAL_ERROR`).
  - HTTP handlers use `httpResult` and `safeFailure`.
- **UI Design, Taste & Impeccable Workflow**:
  - When building or modifying a screen, follow this workflow:
    1. **Taste (`design-taste-frontend`)**: Establish layout structure, visual rhythm, distinct voice, real-world hierarchy, and equal edges. Avoid generic AI templates or stock cliches.
    2. **Impeccable (`impeccable`)**: Audit the rendered output, catch AI slop, refine tokens/typography, verify contrast, and ensure high-craft polish.
    3. **Pick UI Library (`pick-ui-library`)**: Consult before adding or hand-rolling complex controls (Select, Combobox, Modal, Calendar, Tabs, etc.) to choose proven accessible primitives (Base UI, Radix/shadcn).
    4. **Refactoring & Source Size Discipline**: Proactively refactor into small focused modules before exceeding limits.
  - Every screen implements loading, empty, error, permission-denied, and success states.
  - Support mobile screens down to 360px viewport width.
  - Design tokens live in `src/styles/tokens.css` with primary color `#0E58BC`.
- **Quality Checks**:
  - Run `pnpm check` (`pnpm typecheck && pnpm lint && pnpm format:check && pnpm test`) before claiming completion.
  - Fix any failures without disabling rules.
