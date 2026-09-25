# AuthPortal - HTML, CSS & JavaScript Login Website

A modern, responsive, and secure frontend authentication portal built using pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (no external framework dependencies required).

## Features

- **Sign In & Sign Up Views**: Seamless tab switching between login and registration.
- **Forgot Password Workflow**: Reset password flow with client validation and feedback.
- **Interactive Authenticated Dashboard**:
  - Displays user profile, avatar, login stats, and active session status.
  - Sign Out and protected action simulation.
- **Form Validation & UX**:
  - Real-time password strength meter (visual bar and criteria indicator).
  - Show / Hide password toggle buttons with SVG icons.
  - Inline error feedback and accessible inputs.
  - Toast notification alerts for actions (success, error, information).
- **Persistent Local Database**:
  - Pre-seeded with a demo account (`alex@example.com` / `Secret123!`).
  - Supports registering new users dynamically with `localStorage`.
  - Fast "Fill Demo" shortcut button for testing.
- **Social Login Placeholders**: Google & GitHub OAuth sign-in flow triggers.
- **Responsive & Modern Styling**:
  - Glassmorphic card design with backdrop-filter.
  - Ambient animated gradient blobs.
  - Fully mobile-friendly layout.

## Files
- `index.html`: Main markup with semantic sections, forms, and SVG icons.
- `styles.css`: Modern CSS styling with CSS variables, animations, and responsive breakpoints.
- `app.js`: State management, validations, storage, and authentication logic.
