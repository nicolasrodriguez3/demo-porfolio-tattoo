# Lightbox Specification

## Purpose

Fullscreen image viewer that opens when visitors click gallery or portfolio images, using the View Transitions API for smooth animations and providing keyboard navigation for browsing.

## Requirements

### Requirement: Open and Close Lightbox

The system MUST open a fullscreen overlay when a gallery or portfolio image is clicked.

- The lightbox MUST display the image centered with a dark backdrop (rgba(0,0,0,0.9)).
- The lightbox MUST use the View Transitions API (`document.startViewTransition`) for the open animation.
- The lightbox MUST close when:
  - The visitor clicks outside the image (backdrop area).
  - The visitor presses the Escape key.
  - The visitor clicks a close button (X icon) in the corner.
- The close action MUST also use a View Transition for the reverse animation.

#### Scenario: User opens lightbox from gallery

- GIVEN the visitor is browsing the gallery
- WHEN the visitor clicks on a tattoo image
- THEN the lightbox opens with a crossfade or scale transition
- AND the image is displayed fullscreen against a dark backdrop
- AND the close button is visible in the top-right corner

#### Scenario: User closes lightbox with Escape

- GIVEN the lightbox is open
- WHEN the visitor presses the Escape key
- THEN the lightbox closes with a reverse transition
- AND the gallery page is visible underneath

#### Scenario: User closes lightbox by clicking backdrop

- GIVEN the lightbox is open
- WHEN the visitor clicks outside the image (on the dark backdrop)
- THEN the lightbox closes with animation

### Requirement: Image Metadata Display

The lightbox MUST display the image's metadata: artist name, style tags, and description.

- Metadata SHOULD appear as a semi-transparent overlay at the bottom of the image or as a panel beside it on large screens.
- The description MUST support multi-line text.

#### Scenario: Lightbox shows image details

- GIVEN a gallery image titled "Dragon sleeve" by Lautaro, style "tradicional"
- WHEN the lightbox opens for this image
- THEN the artist name "Lautaro", style "tradicional", and description are visible

### Requirement: Keyboard Navigation

The lightbox MUST support keyboard navigation when multiple images are available.

- Right Arrow (â†’) MUST navigate to the next image.
- Left Arrow (â†) MUST navigate to the previous image.
- The system SHOULD loop navigation (next on last image goes to first).
- The system SHOULD show an image counter "X de Y" (e.g., "3 de 12").

#### Scenario: User navigates through images

- GIVEN the lightbox is open showing image 3 of 12
- WHEN the visitor presses the Right Arrow key
- THEN the lightbox transitions to image 4 of 12
- AND the counter updates to "4 de 12"

#### Scenario: Single image — no navigation

- GIVEN the gallery has only 1 image
- WHEN the lightbox opens for that image
- THEN no prev/next arrows are shown
- AND the counter shows "1 de 1"

### Requirement: Accessibility

The lightbox MUST be accessible to screen readers and keyboard users.

- The lightbox container MUST have `role="dialog"` and `aria-modal="true"`.
- Focus MUST be trapped inside the lightbox while it is open (Tab cycles through close button and nav arrows).
- When the lightbox closes, focus MUST return to the triggering image.

#### Scenario: Screen reader announces lightbox

- GIVEN the lightbox opens for an image titled "Dragon sleeve"
- WHEN a screen reader is active
- THEN the lightbox is announced as a dialog
- AND the image title and artist are announced

### Requirement: View Transitions Fallback

If the View Transitions API is not supported (older browsers), the lightbox MUST still function with a fallback animation (simple fade or no animation).

#### Scenario: View Transitions unsupported

- GIVEN the browser does not support `document.startViewTransition`
- WHEN the visitor clicks a gallery image
- THEN the lightbox opens with a CSS fade transition (or instantly)
- AND all functionality (navigation, close, keyboard) still works

## Acceptance Criteria

- [ ] Lightbox opens with View Transitions animation on supported browsers
- [ ] Lightbox closes with reverse animation on Escape, backdrop click, or close button
- [ ] Image metadata (artist, style, description) is visible
- [ ] Arrow keys navigate prev/next (when 2+ images)
- [ ] Single image shows no nav arrows and "1 de 1"
- [ ] Focus is trapped inside lightbox while open
- [ ] Focus returns to triggering element on close
- [ ] Screen reader announces dialog with `role="dialog"`
- [ ] View Transitions fallback works in unsupported browsers

## Edge Cases

- Single image — no prev/next arrows, counter shows "1 de 1"
- View Transitions API unsupported — falls back to CSS transition or instant open
- Image fails to load in lightbox — shows "Imagen no disponible" placeholder
- Rapid arrow key spam — navigation debounced or queued to avoid race conditions
- Extremely large image — constrained to viewport with `object-fit: contain`
- Image metadata has very long description — scrolls or truncates within overlay
- Multiple lightbox trigger elements on same page — only one lightbox instance at a time
