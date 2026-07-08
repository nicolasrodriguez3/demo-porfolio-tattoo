# Gallery Browsing Specification

## Purpose

Public gallery page where visitors can browse tattoo images in a responsive masonry grid and filter by style to find work that interests them.

## Requirements

### Requirement: Masonry Grid Display

The system MUST display gallery images in a responsive masonry grid without vertical gaps.

- The grid MUST use CSS columns or a JavaScript-free masonry approach that avoids layout shift.
- The column count MUST adapt to viewport width: 1 column on mobile (<640px), 2 columns on tablet (640–1024px), 3–4 columns on desktop (>1024px).
- Images SHOULD use lazy loading (`loading="lazy"`) for performance.

#### Scenario: Visitor views gallery

- GIVEN the gallery page is loaded with 12 images
- WHEN the page renders
- THEN images appear in a masonry grid without gaps
- AND the column count matches the viewport width

#### Scenario: Gallery with one image

- GIVEN the gallery has only 1 image
- WHEN the gallery page loads
- THEN the single image is displayed centered in a single column
- AND no layout breaks occur

### Requirement: Style Filtering

The system MUST allow visitors to filter gallery images by tattoo style without triggering a full page reload.

- Filters MUST be displayed as clickable tags or buttons above the grid.
- Each image MUST be tagged with one or more styles from the Keystatic content.
- The active filter MUST be visually highlighted.
- A "Todos" or "All" option MUST reset the filter.
- Filtering SHOULD use client-side filtering (JavaScript) for instant feedback.

#### Scenario: Visitor filters by style

- GIVEN the gallery displays images of styles "tradicional", "blackwork", and "realismo"
- WHEN the visitor clicks the "blackwork" filter
- THEN only blackwork images remain visible
- AND the grid reflows without gaps
- AND the URL updates or reflects the active filter

#### Scenario: Filter returns no results

- GIVEN no images are tagged with style "geomÃ©trico"
- WHEN the visitor selects "geomÃ©trico"
- THEN a "No se encontraron resultados" message is shown
- AND the filter remains active so the visitor can change it

#### Scenario: Filter resets to show all

- GIVEN a style filter is active
- WHEN the visitor clicks "Todos"
- THEN all images are displayed again
- AND the active filter highlight is removed

### Requirement: Image Metadata on Hover

The system MUST display image metadata (artist name and style tags) when the visitor hovers or focuses on an image.

- On touch devices, the metadata MUST be visible via tap or as a persistent overlay.
- The overlay MUST NOT obscure the image more than necessary.

#### Scenario: Visitor hovers image

- GIVEN the gallery shows a dragon sleeve image by Lautaro tagged "tradicional"
- WHEN the visitor hovers over the image
- THEN an overlay shows "Lautaro — tradicional"
- AND the overlay fades in smoothly

## Acceptance Criteria

- [ ] Masonry grid renders without gaps at all breakpoints
- [ ] Filtering updates visible images instantly without page reload
- [ ] Active filter is visually highlighted
- [ ] "Todos" filter resets to show all images
- [ ] Filter with no results shows a friendly message
- [ ] Each image shows artist + style on hover/focus (desktop) or tap (mobile)
- [ ] Lazy loading is active for images below the fold
- [ ] Column count adapts: 1 col mobile, 2 col tablet, 3+ col desktop

## Edge Cases

- Empty gallery — show "GalerÃ­a vacÃ­a" message with CTA to contact the studio
- Single image — renders correctly in one column, centered
- Image with very long title — text truncates gracefully
- Very large gallery (100+ images) — lazy loading prevents performance issues
- JavaScript disabled — gallery still renders in a single-column fallback (all images visible, no filtering)
