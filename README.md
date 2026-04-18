# Europe Route Copilot MVP (AI Maps for Trips)

A Europe-first AI road-trip planner and interactive route companion.

> **Positioning**: “Turn the route into part of the trip.”

## Phase 1 — Repository audit (what existed)

### Existing architecture found
- **Stack**: React 19 + Vite + Tailwind CSS + Google Maps JS API loader + Framer Motion + Lucide.
- **App shape**: single large command-center shell focused on one seeded Yosemite family trip.
- **State**: localStorage persistence via `usePersistedTripState`.
- **Strengths to preserve**:
  - premium dark “operations console” visual style,
  - map-centric interaction patterns,
  - dense, card-based information surfaces,
  - local persistence hooks and utility helpers.
- **Weak points for Europe MVP**:
  - heavily hardcoded US itinerary/domain data,
  - no Europe-first onboarding/preferences model,
  - no structured recommendation engine layer,
  - no clear data model for monetization or feature gating.

## Refactor plan applied

1. **Preserved working shell strengths** (dark dashboard feel and route/map focus).
2. **Introduced Europe-first domain model** for users, trips, members, preferences, routes, stops, recommendations, notes, affiliate links, plans, feature flags.
3. **Added modular service layer**:
   - destination suggestion helper,
   - structured recommendation engine (mocked but typed-by-shape),
   - map provider abstraction (mock provider for MVP),
   - affiliate provider abstraction.
4. **Rebuilt product flow** around MVP priorities:
   - trip setup wizard,
   - preference onboarding,
   - AI recommendation grouping + alternatives,
   - interactive route map and stop save/reorder,
   - trip dashboard + collaboration + monetization surfaces.
5. **Kept persistence local** for fast iteration; architecture is collaborative-ready.

## MVP feature coverage

### ✅ Destination + trip setup
- Manual destination entry.
- AI destination suggestion action.
- Route start/end/dates/traveler count.
- Car mode with simple convoy-mode foundation.

### ✅ Preference onboarding
Collects and stores:
- cuisines,
- dietary restrictions,
- activity interests,
- budget range,
- energy level,
- route style (fastest/scenic/food-first),
- must-have traits.

### ✅ AI route suggestions (mocked engine)
Engine accepts:
- route,
- preferences,
- trip context,
- weather context.

Returns structured recommendations with:
- type,
- title,
- short description,
- estimated detour impact,
- relevance score,
- tags,
- family-friendly,
- dietary relevance,
- booking/action URL slot.

Also includes alternatives for:
- weather changes,
- late departure,
- low-energy scenario.

### ✅ Interactive map
- Route preview with provider abstraction.
- Recommendation markers (click-to-select).
- Save/remove/reorder stops.
- Mode switch: fastest/scenic/food-first.

### ✅ Trip dashboard
Includes:
- route context,
- selected stops,
- recommendations,
- saved hotel/activity booking surfaces,
- trip notes,
- collaboration list.

### ✅ Sharing/collaboration
- Invite collaborators by email (MVP local persistence).
- Data shape is ready for realtime backend extension.

### ✅ Monetization-ready layer
- Freemium plan model (Free vs Pro).
- Feature gating stubs for premium capabilities.
- Affiliate CTA slots for hotel/activity/transport.

## Data model (current MVP schema)

Defined in `src/domainModels.js`:
- `users`
- `trips`
- `trip_members`
- `traveler_preferences`
- `trip_routes`
- `stops`
- `recommendations`
- `saved_places`
- `notes`
- `affiliate_links`
- `subscription_plans`
- `feature_flags`

## Environment variables

Copy and edit:

```bash
cp .env.example .env
```

Current variables:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
# Optional custom styled map
# VITE_GOOGLE_MAP_ID=your_google_map_id_here
```

> The current MVP route map is rendered through a provider abstraction with a mock provider by default, so external map keys are optional for this implementation pass.

## Run locally

```bash
npm install
npm run dev
```

## Production-readiness note (mocked vs real)

### Mocked in this MVP
- Recommendation intelligence is deterministic mock logic (no external AI provider yet).
- Map/routing uses a mock provider abstraction route preview.
- Collaboration is local-state only (no Supabase/realtime backend wired yet).
- Affiliate providers are placeholder URLs with swap-ready abstraction.

### Production-ready foundations now in place
- Structured recommendation output contract.
- Feature flag + subscription plan model.
- Affiliate link abstraction separated from trip logic.
- Persisted trip state and modular service/domain layers for backend migration.

## Key files

- `src/App.jsx` — Europe-first MVP product flow and UI shell.
- `src/domainModels.js` — domain schema, plans, feature flags, starter trip model.
- `src/services.js` — recommendation engine, map provider, destination suggestion, affiliate provider.
- `src/usePersistedTripState.js` — local persistence hook.
