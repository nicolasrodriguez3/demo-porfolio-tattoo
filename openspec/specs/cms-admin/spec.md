# CMS Admin Specification

## Purpose

Admin panel for Carmin Tattoo Studio to manage gallery images, artist profiles, and site content through Keystatic without writing code. Content persists to git and renders at build time.

## Requirements

### Requirement: Keystatic Authentication

The system MUST authenticate admin users via Keystatic admin UI at the `/keystatic` route in development mode.

- The Keystatic admin UI MUST NOT be accessible in production builds — only statically rendered content is served.
- The system MUST support up to 3 Keystatic admin users.

#### Scenario: Admin accesses Keystatic panel

- GIVEN the Astro dev server is running
- WHEN an admin navigates to `/keystatic`
- THEN the Keystatic login screen is displayed
- AND the admin can authenticate with their GitHub account

#### Scenario: Production build hides admin

- GIVEN the site is deployed to production (Cloudflare Pages)
- WHEN a visitor navigates to `/keystatic`
- THEN the request returns a 404 or redirects to the homepage
- AND the admin UI is never served

### Requirement: Gallery Image Management

The system MUST allow admins to upload, edit, and delete gallery images with associated metadata.

- Each image MUST support: title, description, style tags (one or more), artist attribution, and the image file itself.
- The system SHOULD validate image uploads — MUST reject files over 5MB and non-image formats.
- The system SHOULD provide an in-admin preview of uploaded images.

#### Scenario: Admin uploads gallery image

- GIVEN the admin is authenticated in Keystatic
- WHEN the admin uploads a new image with title "Dragon sleeve", style "tradicional", and artist "Lautaro"
- THEN the image and metadata are saved to the git repository
- AND the image appears on the public gallery after the next build

#### Scenario: Admin updates image metadata

- GIVEN a gallery image exists with title "Old title"
- WHEN the admin edits the title to "New title"
- THEN the change is committed to git
- AND the public site shows "New title" after rebuild

#### Scenario: Upload unsupported format

- GIVEN the admin is in Keystatic
- WHEN the admin uploads a `.webp` file that exceeds 5MB
- THEN the system rejects the upload with a format or size error message
- AND the image is not persisted

### Requirement: Artist Profile Management

The system MUST allow admins to create and edit artist profiles.

- Each artist MUST have: name, photo, bio (rich text), style specialties, and optional social/contact links.
- The system SHOULD allow admins to select portfolio images from the gallery for each artist.

#### Scenario: Admin creates artist profile

- GIVEN the admin is authenticated in Keystatic
- WHEN the admin creates a new artist "Lautaro" with bio, photo, and styles ["tradicional", "blackwork"]
- THEN the profile is saved to the git repository
- AND "Lautaro" appears in the public artist directory after rebuild

### Requirement: Site Content Management

The system MUST allow admins to manage global site content: studio name, address, contact info, social links, and homepage text.

#### Scenario: Admin updates contact info

- GIVEN the admin is authenticated in Keystatic
- WHEN the admin updates the studio address
- THEN the change is committed to git
- AND the contact page reflects the new address after rebuild

## Acceptance Criteria

- [ ] Admin can log into Keystatic at `/keystatic` in dev mode
- [ ] Admin can upload gallery images with title, style tags, and artist
- [ ] Admin can create and edit artist profiles
- [ ] Admin can update site content (studio info, contact)
- [ ] Unsupported file formats are rejected with a clear message
- [ ] Images over 5MB are rejected
- [ ] Keystatic is inaccessible in production builds
- [ ] All content changes persist to git and render after build

## Edge Cases

- Large image uploads (over 5MB) are rejected
- Empty gallery state — gallery page handles gracefully
- Special characters in titles and descriptions render correctly
- Git merge conflicts on concurrent edits — Keystatic handles via standard git workflow
- Admin disconnects during upload — partial state not persisted
