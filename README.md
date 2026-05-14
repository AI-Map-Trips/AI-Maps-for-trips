# Europe Route Copilot MVP  
## AI Maps for Trips

A Europe-first AI road-trip planner and interactive route companion.

**Positioning:**  
> Turn the route into part of the trip.

This project explores how AI, maps and user preferences can improve road-trip planning by suggesting meaningful stops along a route, instead of treating travel time as dead time.

The MVP focuses on route-based discovery for European trips, combining destination setup, traveler preferences, AI-assisted recommendations, map interaction and monetization-ready surfaces.

---

## Project Goal

The goal of this MVP is to help users discover places worth visiting between point A and point B.

Instead of only showing the fastest route, the product is designed to suggest:

- scenic detours;
- local restaurants;
- villages;
- nature spots;
- lakes and mountains;
- activities;
- hotels or overnight stops;
- family-friendly alternatives;
- low-energy or bad-weather options.

The broader vision is to create an AI travel companion that turns a normal route into a more valuable travel experience.

---

## My Role

I used this repository as a product and technical experimentation base to explore an AI-assisted travel planning concept.

My contribution focused on:

- auditing the existing app structure;
- identifying what could be reused and what needed to change;
- repositioning the product from a hardcoded US itinerary to a Europe-first route planning MVP;
- defining the product flow around destination setup, preferences, route suggestions and interactive map usage;
- introducing a structured domain model for trips, users, preferences, stops, recommendations, affiliate links, plans and feature flags;
- designing a modular service layer for recommendations, map provider abstraction and affiliate provider logic;
- preparing the product for future integration with Google Maps, Google Places, Google Routes, AI providers, Supabase and Stripe.

---

## Phase 1 — Repository Audit

### Existing architecture found

- **Stack:** React 19, Vite, Tailwind CSS, Google Maps JS API loader, Framer Motion and Lucide.
- **App shape:** single large command-center shell focused on one seeded Yosemite family trip.
- **State:** localStorage persistence via `usePersistedTripState`.

### Strengths preserved

- premium dark “operations console” visual style;
- map-centric interaction patterns;
- dense, card-based information surfaces;
- local persistence hooks;
- useful helper utilities.

### Weak points for the Europe MVP

- heavily hardcoded US itinerary and domain data;
- no Europe-first onboarding or preference model;
- no structured recommendation engine layer;
- no clear data model for monetization or feature gating;
- limited readiness for real backend or AI provider integration.

---

## Refactor Plan Applied

1. Preserved the working shell strengths, especially the dark dashboard feel and map-first interaction.
2. Introduced a Europe-first domain model for users, trips, members, preferences, routes, stops, recommendations, notes, affiliate links, plans and feature flags.
3. Added a modular service layer:
   - destination suggestion helper;
   - structured recommendation engine;
   - map provider abstraction;
   - affiliate provider abstraction.
4. Rebuilt the product flow around MVP priorities:
   - trip setup wizard;
   - preference onboarding;
   - AI recommendation grouping and alternatives;
   - interactive route map;
   - save/remove/reorder stops;
   - trip dashboard;
   - collaboration and monetization surfaces.
5. Kept persistence local for fast iteration, while making the architecture ready for future backend migration.

---

## MVP Feature Coverage

### Destination and Trip Setup

- Manual destination entry.
- AI destination suggestion action.
- Route start, end, dates and traveler count.
- Car mode with simple convoy-mode foundation.

### Preference Onboarding

The MVP collects and stores:

- cuisines;
- dietary restrictions;
- activity interests;
- budget range;
- energy level;
- route style: fastest, scenic or food-first;
- must-have traits.

### AI Route Suggestions

The recommendation engine accepts:

- route;
- preferences;
- trip context;
- weather context.

It returns structured recommendations with:

- type;
- title;
- short description;
- estimated detour impact;
- relevance score;
- tags;
- family-friendly flag;
- dietary relevance;
- booking/action URL slot.

It also includes alternatives for:

- weather changes;
- late departure;
- low-energy scenario.

### Interactive Map

- Route preview with provider abstraction.
- Recommendation markers.
- Click-to-select interaction.
- Save/remove/reorder stops.
- Mode switch: fastest, scenic, food-first.

### Trip Dashboard

Includes:

- route context;
- selected stops;
- recommendations;
- saved hotel/activity booking surfaces;
- trip notes;
- collaboration list.

### Sharing and Collaboration

- Invite collaborators by email.
- MVP local persistence.
- Data shape ready for realtime backend extension.

### Monetization-Ready Layer

- Freemium plan model: Free vs Pro.
- Feature gating stubs for premium capabilities.
- Affiliate CTA slots for hotels, activities and transport.

---

## Data Model

The current MVP schema is defined in:

```txt
src/domainModels.js
