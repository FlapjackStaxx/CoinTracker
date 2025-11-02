# CoinTracker Mobile App Design

## Vision and Goals
- Provide a pocket reference and catalog for a private collection of foreign coins and banknotes (primarily pre-1990).
- Allow fast capture of item information via the phone camera with optional manual entry.
- Maintain accurate records of purchase price, market value, provenance, and sale status.
- Surface market trends and valuations so the collector knows when to buy, hold, or sell.

## Target Platforms and Technology Choices
- **Mobile platform**: Cross-platform support via React Native (iOS + Android) to maximize reach while reusing code.
- **Camera + ML**: Use the device camera with on-device object detection (e.g., TensorFlow Lite) to suggest matches; fall back to manual search if recognition confidence is low.
- **Backend**: Supabase (PostgreSQL + auth + storage) for rapid development, realtime sync, and serverless functions for periodic market data refresh.
- **Market data integration**: Scheduled edge functions fetch coin/banknote price guides (Numista, NGC, Krause) and normalize values.
- **State management**: React Query + Zustand for remote/local data handling with offline-first caching.

## Core Features
1. **Catalog Browser**
   - Filter by country, denomination, year, metal, grade, acquisition status, or sold items.
   - Grid and list views with high-resolution imagery.
   - Quick search with fuzzy matching on catalog number, nickname, inscriptions.
2. **Item Detail View**
   - High-res photos (obverse/reverse), grade, denomination, issue year, mint mark.
   - Purchase details: acquisition date, cost, seller, receipt attachments.
   - Current market value with historical chart and confidence band.
   - Notes section and tags.
   - Actions: edit, duplicate, mark as sold, delete.
3. **Camera Scan & Recognition**
   - Guided capture workflow: align coin/bill in outline, auto-capture when sharp.
   - On-device model suggests top matches; user confirms or manually searches.
   - Prefills attributes (country, denomination, catalog number) from reference database.
4. **CRUD Management**
   - Create: manual form + camera-assisted entry.
   - Read: offline-available detail pages and summary stats.
   - Update: edit metadata, adjust market value, add new photos, change status to sold.
   - Delete: soft delete with undo snackbar; permanent purge in settings.
5. **Portfolio Dashboard**
   - Total acquisition cost vs current valuation, gains/losses.
   - Breakdown by country, period, metal, or status (owned vs sold).
   - Recent additions and reminders for re-appraisal.
6. **Synchronization & Offline Mode**
   - Local SQLite cache mirrored with Supabase for offline browsing and edits.
   - Conflict resolution strategy: last-write wins with change logs and manual merge UI.

## Information Architecture & Data Model
- **Entities**
  - `Item`: UUID, name/title, denomination, country, year, mint, catalog number, grade, composition, diameter/weight, obverse/reverse images, notes.
  - `Acquisition`: purchase price, currency, date, seller, provenance, condition at purchase.
  - `Valuation`: source (e.g., Numista), amount, currency, fetched_at, confidence.
  - `MarketHistory`: time-series valuations per item.
  - `Status`: enum (`owned`, `on_loan`, `sold`, `wishlist`).
- **Relationships**
  - An `Item` has one current `Valuation` and historical `MarketHistory` entries.
  - `Acquisition` belongs to `Item` and tracks purchase context.
  - `Status` transitions logged with timestamp + optional note.
- **Storage**
  - Supabase table per entity; storage bucket for media (JPEG/PNG).
  - Local SQLite mirrors `Item`, `Valuation`, `Acquisition`, `MarketHistory` tables for offline use.

## Camera Recognition Pipeline
1. **Capture**: Camera module captures obverse/reverse images (auto-cropped and denoised).
2. **Preprocessing**: Convert to grayscale + edge detection for coins; perspective correction for banknotes.
3. **Feature Extraction**: Use MobileNetV3 backbone fine-tuned on coin datasets; detect inscriptions via OCR (Tesseract mobile).
4. **Matching**: Compare embedding against Supabase-hosted reference vectors; combine with OCR tokens and year to rank candidates.
5. **User Confirmation**: Present top 3 matches with key metadata; user confirms or searches manually.
6. **Enrichment**: Once matched, fetch metadata and valuations, pre-fill form for review.

## Market Data Refresh Strategy
- Nightly scheduled Supabase edge function per region/currency.
- Source APIs scraped with respect to TOS, caching responses to minimize load.
- Normalization pipeline converts to user's preferred currency using ECB exchange rates.
- Valuation confidence derived from recency + source reliability weights.

## Prototype Backend Implementation
- A lightweight Node.js + Express service (included in this repository) provides CRUD endpoints for managing collection items, an export route, and a placeholder recognition endpoint for camera uploads.
- Persistence relies on lowdb (JSON on disk) so the demo runs anywhere without compiling native SQLite bindings.
- Automated Vitest + Supertest suites cover the health check, CRUD lifecycle, and recognition placeholder to ensure the demo API remains stable as features evolve.

## Security and Privacy Considerations
- Supabase Auth with email/password and optional biometric sign-in.
- Row-Level Security (RLS) ensures user isolation.
- Encrypt sensitive local data with platform Keychain/Keystore integration.
- Allow opt-out of cloud sync (local-only mode) with manual backups.

## Roadmap
1. **MVP (8 weeks)**
   - Manual CRUD, camera capture with manual tagging, Supabase sync, dashboard basics.
2. **Phase 2 (6 weeks)**
   - On-device recognition model, market data integration, offline sync polish.
3. **Phase 3 (ongoing)**
   - Advanced analytics, sharing/export, integration with auction marketplaces.

## Success Metrics
- Time to log a new item (goal: <60 seconds with camera assist).
- Percentage of catalog with complete metadata (target: 90%).
- Recognition match accuracy (goal: >85% top-1 for trained regions).
- Monthly active users and retention for pilot group.
