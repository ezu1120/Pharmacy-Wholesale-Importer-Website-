# Implementation Plan: SRS Full Implementation

## Overview

Incremental implementation of all 12 SRS gap-closure requirements across the existing React + Node.js/Express + PostgreSQL stack. Each task group maps to one requirement and targets specific files. No new services are introduced.

## Tasks

- [ ] 1. Req 1 — Multi-Language Support
  - [ ] 1.1 Add localStorage persistence to i18n initialisation
    - In `frontend/src/lib/i18n.js`, set `detection.order` to include `localStorage` and configure `detection.caches: ['localStorage']` so the selected locale survives page reloads.
    - _Requirements: 1.2, 1.13_

  - [ ] 1.2 Add Language Toggle and Track RFQ link to Navbar
    - In `frontend/src/components/Navbar.jsx`, add an EN/አማ toggle button that calls `i18n.changeLanguage()`. Wire all nav labels and action button text through `useTranslation()`. Add "Track RFQ" to `NAV_LINKS` (desktop + mobile menu).
    - _Requirements: 1.1, 1.11, 9.1, 9.2_

  - [ ] 1.3 Wire useTranslation() in Footer
    - Replace all hardcoded strings in `frontend/src/components/Footer.jsx` with `t()` calls backed by Translation_Keys in `en.json` / `am.json`.
    - _Requirements: 1.12_

  - [ ] 1.4 Wire useTranslation() in Home page
    - Replace all hardcoded English literals in `frontend/src/pages/Home.jsx` with `t()` calls. Add corresponding keys to both locale files.
    - _Requirements: 1.4_

  - [ ] 1.5 Wire useTranslation() in Products, RFQ, Compare pages
    - Apply `useTranslation()` to `Products.jsx`, `RFQ.jsx`, and `Compare.jsx`. Add all new Translation_Keys to `en.json` and `am.json`.
    - _Requirements: 1.5, 1.6, 1.7_

  - [ ] 1.6 Wire useTranslation() in About, Services, Contact pages
    - Apply `useTranslation()` to `About.jsx`, `Services.jsx`, and `Contact.jsx`. Add all new Translation_Keys to both locale files.
    - _Requirements: 1.8, 1.9, 1.10_

  - [ ]* 1.7 Write property test — language toggle idempotency
    - **Property 1: Language toggle idempotency** — toggling the language twice returns `i18n.language` to its original value.
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. Req 2 — Product Comparison (4 products, dosage_form, country_of_origin)
  - [x] 2.1 Add dosage_form and country_of_origin columns to DB schema
    - Update `backend/src/db/schema.sql` to add `dosage_form VARCHAR(100)` and `country_of_origin VARCHAR(100)` columns to the `products` table.
    - _Requirements: 2.6_

  - [x] 2.2 Create migration script for new product columns
    - Create `backend/src/db/migrate-v2.js` that runs `ALTER TABLE products ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(100), ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100)`.
    - _Requirements: 2.6_

  - [x] 2.3 Include new fields in backend product routes
    - Update all `SELECT` queries in `backend/src/routes/products.js` to include `dosage_form` and `country_of_origin`. Update `GET/POST/PUT` handlers in `backend/src/routes/admin.js` to read and write these fields.
    - _Requirements: 2.7, 2.8_

  - [x] 2.4 Raise compare limit to 4 and add new rows in Compare page
    - In `frontend/src/pages/Compare.jsx`, raise the selection limit from 3 to 4. Add "Dosage Form" and "Country of Origin" rows to the comparison table. Display "—" when a value is absent. Show a limit-reached message when 4 products are already selected.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.5 Add dosage_form and country_of_origin fields to Admin product form
    - In `frontend/src/pages/AdminProducts.jsx`, add text input fields for Dosage Form and Country of Origin in the product create/edit form.
    - _Requirements: 2.7_

  - [ ]* 2.6 Write property test — compare limit never exceeds 4
    - **Property 3: Compare limit** — `selectedIds.length` never exceeds 4 regardless of how many add actions are dispatched.
    - **Validates: Requirements 2.1, 2.2**

- [ ] 3. Req 3 — RFQ Step 2 Per-Product Notes UI
  - [x] 3.1 Add per-product notes textarea in RFQ Step 2
    - In `frontend/src/pages/RFQ.jsx`, add a `<textarea>` (max 500 chars) labeled "Note" for each product in the Step 2 selected-products panel. On change, call `updateProduct()` on the RFQ_Store to persist the `notes` field.
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Display per-product notes in RFQ Step 4 review
    - In the Step 4 review panel of `RFQ.jsx`, render each product's note beneath the product name when the note is non-empty.
    - _Requirements: 3.4_

  - [ ]* 3.3 Write property test — per-product notes round-trip
    - **Property 5: Per-product notes** — notes written via `updateProduct()` are retrievable from the store unchanged.
    - **Validates: Requirements 3.2, 3.5**

- [ ] 4. Req 4 — RFQ Success Page Navigation + PDF Download
  - [x] 4.1 Navigate to RFQ Success page after submission
    - In `frontend/src/pages/RFQ.jsx`, change the `onSuccess` handler to call `navigate('/rfq/success/' + rfqNumber)` using the `rfqNumber` returned by the API response.
    - _Requirements: 4.1_

  - [x] 4.2 Add "Download RFQ PDF" button and supporting content to RFQSuccess page
    - In `frontend/src/pages/RFQSuccess.jsx`, add a "Download RFQ PDF" button that calls `GET /api/rfq/:rfqNumber/pdf`. Add a "What Happens Next" section, a link to `/track?rfq=<rfqNumber>`, and a link to the Customer_Dashboard. Handle the case where the RFQ number is not found.
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 4.3 Add public RFQ PDF endpoint to backend
    - In `backend/src/routes/rfq.js`, add `GET /api/rfq/:rfqNumber/pdf` (public, no auth required) that generates and streams the submitted RFQ as a PDF using the existing pdf service.
    - _Requirements: 4.4_

  - [ ]* 4.4 Write property test — RFQ success routing uses API rfqNumber
    - **Property 2: RFQ success routing** — the navigate call always uses the `rfqNumber` value from the API response, never a hardcoded or stale value.
    - **Validates: Requirements 4.1**

- [ ] 5. Req 5 — Customer Portal Quotation PDF Download
  - [x] 5.1 Add Quotation PDF and RFQ Copy download buttons to CustomerRFQDetail
    - In `frontend/src/pages/CustomerRFQDetail.jsx`, add a prominently styled "Download Quotation PDF" button visible only when status is `QUOTATION_SENT` (calls `GET /customer/rfqs/:id/pdf`). Add a "Download RFQ Copy" button visible for all statuses. Show an informational message when the quotation is not yet available.
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.2 Write property test — PDF authorization enforces customer_id ownership
    - **Property 6: PDF authorization** — the customer PDF endpoint returns 403 when the requesting customer's `id` does not match the RFQ's `customer_id`.
    - **Validates: Requirements 5.4**

- [ ] 6. Req 6 — SEO Meta Tags
  - [x] 6.1 Install react-helmet-async and wrap app in HelmetProvider
    - Add `react-helmet-async` to `frontend/package.json`. In `frontend/src/main.jsx`, wrap the app tree in `<HelmetProvider>`.
    - _Requirements: 6.1_

  - [x] 6.2 Add Helmet meta tags to Home and Products pages
    - In `Home.jsx`, add `<Helmet>` with title, description, canonical, and Open Graph tags. In `Products.jsx`, add `<Helmet>` with title, description, canonical, OG tags, and a JSON-LD `ItemList` schema block populated from the loaded product list.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.3 Add Helmet meta tags to About, Services, Contact, RFQ, TrackRFQ pages
    - Add `<Helmet>` with title, description, and canonical `<link>` to `About.jsx`, `Services.jsx`, `Contact.jsx`, `RFQ.jsx`, and `TrackRFQ.jsx`.
    - _Requirements: 6.1, 6.6_

  - [x] 6.4 Update sitemap.xml with all public URLs
    - Update `frontend/public/sitemap.xml` to include `<url>` entries for `/`, `/products`, `/about`, `/services`, `/contact`, `/rfq`, and `/track`, each with a `<lastmod>` date.
    - _Requirements: 6.7_

- [ ] 7. Req 7 — Home Page Contact Section
  - [x] 7.1 Add Home Contact Section to Home page
    - In `frontend/src/pages/Home.jsx`, add a `Home_Contact_Section` before the footer containing: address/phone/email info cards, a map `<iframe>`, and a quick contact form (First Name, Last Name, Email, Message). Wire the form to the existing backend contact endpoint using react-hook-form + zod validation. Show success/error feedback. Use Translation_Keys for all text. Ensure responsive layout.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 8. Req 8 — Registration Full Profile Fields
  - [x] 8.1 Extend Register page form with full profile fields
    - In `frontend/src/pages/Register.jsx`, add fields for Company Name, Business Type (dropdown), Phone, Country, and City. Update the zod schema to require all five fields. Include them in the form submission payload.
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 8.2 Extend backend register endpoint to persist and return profile fields
    - In `backend/src/routes/auth.js`, extend `registerSchema` to accept `company_name`, `business_type`, `phone`, `country`, and `city`. Update the `INSERT` statement to persist all five fields. Return the full profile (including these fields) in the JWT response payload.
    - _Requirements: 8.4, 8.5_

  - [x] 8.3 Auto-fill RFQ Step 1 from auth store profile
    - In `frontend/src/pages/RFQ.jsx`, on Step 1 mount, read the authenticated user's profile from the auth store and pre-populate all customer info fields. If all fields are populated, automatically advance to Step 2.
    - _Requirements: 8.6, 8.7_

  - [ ]* 8.4 Write property test — registration completeness
    - **Property 4: Registration completeness** — all 5 profile fields (`company_name`, `business_type`, `phone`, `country`, `city`) submitted in the request body are present and unchanged in the response payload.
    - **Validates: Requirements 8.4, 8.5**

- [ ] 9. Req 9 — Track RFQ Navigation (Navbar + Home CTA)
  - [x] 9.1 Add Track RFQ link to Home page CTA / hero section
    - In `frontend/src/pages/Home.jsx`, add a visible "Track RFQ" link or button in the CTA or hero section that routes to `/track`.
    - _Requirements: 9.3_

  _(Navbar changes for Req 9 are covered by task 1.2)_

- [ ] 10. Req 10 — Admin Categories CMS
  - [x] 10.1 Add Categories tab to AdminContent page
    - In `frontend/src/pages/AdminContent.jsx`, add a "Categories" tab. Implement an editor that fetches `home_categories` from the `site_content` table and allows the Admin to add, remove, reorder, and edit (name, icon, color, description) category entries. Persist changes via the existing site content API.
    - _Requirements: 10.1, 10.2, 10.5, 10.6_

  - [x] 10.2 Replace hardcoded CATEGORIES in Home page with useSiteContent
    - In `frontend/src/pages/Home.jsx`, replace the hardcoded `CATEGORIES` array with `useSiteContent('home_categories', DEFAULT_CATEGORIES)` so the Home page renders CMS-managed categories with a fallback to the defaults.
    - _Requirements: 10.3, 10.4_

- [ ] 11. Req 11 — Live Chat Improvements
  - [x] 11.1 Add online/offline status indicator and error state to LiveChat widget
    - In `frontend/src/components/LiveChat.jsx`, add a visual online/offline status indicator. Add an error state UI that is shown when the backend chat endpoint is unreachable, retaining the user's typed message so they can retry.
    - _Requirements: 11.5, 11.6_

- [ ] 12. Req 12 — Non-Functional: API 401 Interceptor
  - [x] 12.1 Add axios 401 response interceptor to api.js
    - In `frontend/src/lib/api.js`, add an axios response interceptor that catches 401 responses and redirects the user to `/login?redirect=<originalUrl>`, preserving the originally requested URL as a query parameter.
    - _Requirements: 12.10_

- [x] 13. Final Checkpoint
  - Ensure all tests pass and the application builds without errors. Verify each requirement's acceptance criteria against the implemented code. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery.
- Each task references specific requirements for full traceability.
- Property tests validate universal correctness properties defined in the spec.
- Unit tests validate specific examples and edge cases.
- Tasks 1.2 and 9.1 share the Navbar file — implement them together in task 1.2 to avoid conflicts.
- Run `node backend/src/db/migrate-v2.js` once after task 2.2 to apply the DB schema changes before testing task 2.3 onwards.
