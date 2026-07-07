# Artist Directory Specification

## Purpose

Artist directory pages where potential clients can browse each tattoo artist's profile, see their style specialties, view portfolio work, and get contact information to decide who to book with.

## Requirements

### Requirement: Artist Listing

The system MUST display a directory page listing all artists from the Keystatic-managed content collection.

- Each listing MUST show: artist name, profile photo (thumbnail), and style specialties as tags.
- Each listing MUST link to the artist's individual profile page.
- The listing SHOULD show a small preview (2–3 thumbnail images) of the artist's portfolio.
- Artists with no portfolio images MAY still appear in the listing with a "Sin trabajos publicados" indicator.

#### Scenario: Visitor views artist directory

- GIVEN the studio has 3 artists configured in Keystatic
- WHEN the visitor navigates to `/artists`
- THEN all 3 artists are displayed with name, photo, and style tags
- AND each card links to its individual profile

#### Scenario: No artists configured

- GIVEN no artist profiles exist in Keystatic
- WHEN the visitor navigates to `/artists`
- THEN a message "Conociendo a nuestros artistas..." is displayed
- AND the page does not crash or show an empty grid

### Requirement: Individual Artist Profile

The system MUST provide an individual profile page for each artist at `/artists/[slug]`.

- The profile MUST display: full bio, profile photo (large), style specialties, portfolio gallery (linked images), and contact/social info.
- Portfolio images in the profile MUST link to the lightbox for full-size viewing.
- The bio SHOULD support rich text (paragraphs, line breaks) from Keystatic.

#### Scenario: Visitor opens artist profile

- GIVEN the visitor is on the artist directory
- WHEN the visitor clicks on "Lautaro"
- THEN a profile page loads at `/artists/lautaro`
- AND the page shows Lautaro's bio, photo, styles, and portfolio images
- AND clicking a portfolio image opens the lightbox

### Requirement: Portfolio Image Linking

Portfolio images on artist profiles MUST be linkable to their gallery counterparts — clicking an image from an artist profile opens the same image in the lightbox as it would from the gallery.

- The system SHOULD link artist portfolio images back to their appearances in the gallery view.
- Portfolio images MUST use the same content source as gallery images.

#### Scenario: Artist portfolio loaded from same collection

- GIVEN the admin uploaded a dragon sleeve image and tagged it with artist "Lautaro"
- WHEN the visitor views Lautaro's profile
- THEN the dragon sleeve image appears in Lautaro's portfolio gallery

## Acceptance Criteria

- [ ] Directory page lists all artists with name, photo, and style tags
- [ ] Each artist card links to `/artists/[slug]` profile page
- [ ] Profile page includes bio, photo, styles, portfolio, and contact info
- [ ] Portfolio images open in lightbox
- [ ] Empty artist directory shows placeholder message
- [ ] Artist with no portfolio shows "Sin trabajos publicados"
- [ ] Rich text bio renders formatting (paragraphs, line breaks)
- [ ] Portfolio images match the gallery collection for that artist

## Edge Cases

- Artist with no portfolio images — shows "Sin trabajos publicados" instead of empty grid
- Artist without profile photo — shows a silhouette/placeholder avatar
- Very long bio — scrolls naturally, no layout break
- Artist slug contains special characters or spaces — URL-friendly slugification
- Artist deleted from Keystatic — profile returns 404 with helpful message
