# Contact Form Specification

## Purpose

Functional contact page where potential clients can message the studio and find the physical location. Form submits via Web3Forms; location shown via Leaflet with OpenStreetMap tiles.

## Requirements

### Requirement: Form Fields and Validation

The system MUST provide a contact form with the following fields and validation rules:

- **Name** (MUST be required, text input)
- **Email** (MUST be required, MUST validate email format client-side)
- **Phone** (SHOULD be optional, text input)
- **Message** (MUST be required, textarea)
- All required fields MUST show inline validation errors when submitted empty.
- Invalid email format MUST show a specific "Email invÃ¡lido" error message.

#### Scenario: Visitor submits valid form

- GIVEN the visitor fills name "Juan", email "juan@ejemplo.com", and message "Quiero un turno"
- WHEN the visitor clicks "Enviar"
- THEN the form submits to Web3Forms
- AND a success message "Mensaje enviado con Ã©xito" is displayed
- AND the form fields are reset

#### Scenario: Visitor submits empty form

- GIVEN the contact form is displayed with empty fields
- WHEN the visitor clicks "Enviar"
- THEN the name, email, and message fields show "Campo requerido" errors
- AND the form is not submitted

#### Scenario: Visitor submits invalid email

- GIVEN the visitor enters "email-invalido" in the email field
- WHEN the visitor clicks "Enviar"
- THEN the email field shows "Email invÃ¡lido"
- AND the form is not submitted

### Requirement: Spam Prevention

The system SHOULD include a honeypot field (hidden from real users) to prevent automated bot submissions.

- The honeypot field MUST not be visible to human visitors.
- If the honeypot field contains any value on submission, the system MUST silently discard the submission without sending it to Web3Forms.
- The system SHOULD implement client-side rate limiting (max 1 submission per 60 seconds).

#### Scenario: Bot fills honeypot field

- GIVEN an automated bot fills every form field including the hidden honeypot
- WHEN the bot submits the form
- THEN the submission is silently discarded
- AND no request is sent to Web3Forms
- AND the bot receives the same success message as a real user

### Requirement: Submission Feedback

The system MUST provide visual feedback for form submission states.

- Success state: green banner with "Mensaje enviado con Ã©xito"
- Error state: red banner with "Error al enviar. Intenta de nuevo."
- Loading state: submit button shows a spinner or "Enviando..." text and is disabled
- The system SHOULD auto-dismiss success messages after 5 seconds.

#### Scenario: Form submission fails

- GIVEN the visitor submits a valid form
- WHEN the Web3Forms API returns an error or times out
- THEN an error message "Error al enviar. Intenta de nuevo." is displayed
- AND the form data is preserved so the visitor can retry

### Requirement: Location Map

The system MUST display an interactive Leaflet map on the contact page.

- The map MUST show a pin at Bavio 173, ParanÃ¡, Entre RÃ­os.
- The map MUST include the required OpenStreetMap attribution: "Â© OpenStreetMap contributors".
- The map SHOULD include a popup with the studio name and address when the pin is clicked.
- The map MUST be responsive — stacks below the form on mobile, sits beside it on desktop.
- The map SHOULD NOT require an API key.

#### Scenario: Map loads with correct location

- GIVEN the visitor opens the contact page
- WHEN the page loads
- THEN a Leaflet map is rendered with a pin
- AND the pin is centered on Bavio 173, ParanÃ¡
- AND the attribution "Â© OpenStreetMap contributors" is visible

#### Scenario: Pin click shows studio info

- GIVEN the map is displayed
- WHEN the visitor clicks the pin
- THEN a popup shows "Carmin Tattoo Studio" and the address

## Acceptance Criteria

- [ ] Empty form submission shows validation errors on required fields
- [ ] Invalid email shows specific error message
- [ ] Valid submission shows success message and resets form
- [ ] Failed submission shows error message and preserves data
- [ ] Honeypot submission silently discards
- [ ] Rate limiting blocks rapid re-submissions
- [ ] Map renders with pin at Bavio 173, ParanÃ¡
- [ ] Map attribution is visible ("Â© OpenStreetMap contributors")
- [ ] Form and map stack vertically on mobile (<768px)
- [ ] Submit button shows loading state during submission

## Edge Cases

- Very long message text (>5000 chars) — truncated or displayed with scroll
- XSS attempts in form fields — Web3Forms sanitizes; client-side encoding as defense-in-depth
- Rapid repeated submissions — rate limiter blocks within 60s window
- Map tile server unreachable — graceful fallback (static image or error message)
- JavaScript disabled — form should not submit (graceful degradation: "JavaScript necesario" message)
- Web3Forms endpoint down — error feedback shown to user
- Private browsing with localStorage unavailable — form still works
