# Dark Mode Specification

## Purpose

Dark/light theme toggle with user preference persistence. Defaults to dark editorial aesthetic matching the studio's visual identity, with a toggle for visitor preference.

## Requirements

### Requirement: Default Dark Theme

The system MUST render in dark mode on first visit, before any user interaction.

- The base background MUST be `#0A0A0A`, text `#F5F0EB`, accent `#B87333` (copper).
- The dark theme MUST be applied via the `dark` CSS class on the `<html>` element (Tailwind `darkMode: 'class'` strategy).
- If JavaScript is disabled, the server-rendered HTML MUST already include the `dark` class.

#### Scenario: First visit shows dark mode

- GIVEN a visitor accesses the site for the first time
- WHEN the page loads
- THEN the background is `#0A0A0A` and text is `#F5F0EB`
- AND the `<html>` element has the `dark` class

### Requirement: System Preference Respect

On first visit, if the visitor has NOT made an explicit choice, the system MUST check `prefers-color-scheme` and respect it.

- If the system preference is `light` and the user has no stored choice, the light theme MUST be applied.
- If the system preference is `dark` and the user has no stored choice, the dark theme MUST be applied.
- An explicit user toggle MUST override the system preference.

#### Scenario: User with light system preference

- GIVEN a visitor has system preference set to light mode
- AND the visitor has never toggled the theme on this site
- WHEN the visitor loads the site
- THEN the light theme is applied (bg light, text dark)
- AND no `dark` class is present on `<html>`

### Requirement: Toggle Button

The system MUST provide a visible toggle button in the UI (e.g., header or nav) to switch between dark and light modes.

- The button SHOULD show a sun icon in dark mode and a moon icon in light mode.
- Clicking the button MUST toggle the `dark` class on `<html>`.
- The toggle MUST work without a full page reload.

#### Scenario: User toggles to light mode

- GIVEN the site is in dark mode (`dark` class present)
- WHEN the visitor clicks the theme toggle button
- THEN the `dark` class is removed from `<html>`
- AND the site renders in light mode
- AND the toggle icon changes from sun to moon

### Requirement: Preference Persistence

The system MUST persist the user's theme preference across page navigation using the Tailwind class strategy.

- The theme class (`dark` or absent) MUST be applied server-side (via Astro middleware or inline script) before first paint.
- The system SHOULD store the explicit preference in `localStorage` under the key `theme`.
- The value SHOULD be `"dark"` or `"light"` respectively.
- If `localStorage` has a stored value, it MUST take precedence over `prefers-color-scheme`.

#### Scenario: Preference survives navigation

- GIVEN the visitor toggles to light mode
- WHEN the visitor navigates to another page (e.g., from gallery to contact)
- THEN the light mode persists on the new page
- AND the `<html>` element has no `dark` class on the new page

#### Scenario: localStorage cleared

- GIVEN the visitor had previously selected light mode (stored in localStorage)
- WHEN the visitor clears localStorage and reloads the page
- THEN the theme falls back to the system `prefers-color-scheme` value
- AND the toggle reflects whichever theme was applied

### Requirement: No Layout Shift

Toggling themes MUST NOT cause layout shift.

- Color transitions SHOULD use CSS `transition` on `background-color` and `color` for smooth animation.
- All theme-aware CSS variables MUST be defined on `:root` and `:root.dark` (or via Tailwind `dark:` variants).

#### Scenario: Toggle with no layout shift

- GIVEN the site is in dark mode
- WHEN the visitor toggles to light mode
- THEN all elements remain in their original positions
- AND only colors change
- AND a smooth color transition animates the change

## Acceptance Criteria

- [ ] First visit renders in dark mode by default
- [ ] Toggle button switches between dark and light
- [ ] Toggle icon reflects current mode (sun in dark, moon in light)
- [ ] Preference persists across page navigation
- [ ] New visitor with light system preference sees light mode
- [ ] Explicit toggle overrides system preference
- [ ] No layout shift on theme toggle
- [ ] Smooth CSS transition on color change
- [ ] localStorage key `theme` stores `"dark"` or `"light"`
- [ ] JavaScript disabled: server-rendered dark class present
- [ ] localStorage unavailable: falls back to system preference or default dark

## Edge Cases

- JavaScript disabled — server-rendered HTML includes `dark` class by default
- localStorage unavailable (Safari private browsing) — preference not saved, defaults to system preference
- System `prefers-color-scheme` changes while page is open — no real-time tracking, respects current choice until next page load or toggle
- Rapid toggle clicks — only the final state is applied; no race conditions or flicker
- Color transition on page load — first paint shows correct colors; transition fires only on explicit toggle, not on load
