export const CURRENCIES = {
  default: 'EUR',
}

export const UNIT_SYSTEM = 'metric'

export const SUPPORTED_LANGUAGES = ['en', 'it', 'es', 'fr', 'de']

export const FEATURE_KEYS = {
  LIVE_SHARING: 'live_sharing',
  PDF_EXPORT: 'pdf_export',
  CALENDAR_EXPORT: 'calendar_export',
  ADVANCED_BUDGET: 'advanced_budget',
  AI_MEAL_PLANNER: 'ai_meal_planner',
  CUSTOM_MAP_LAYERS: 'custom_map_layers',
}

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    maxTrips: 2,
    maxCollaborators: 2,
    maxSuggestions: 12,
    enabledFeatures: [],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxTrips: Infinity,
    maxCollaborators: Infinity,
    maxSuggestions: Infinity,
    enabledFeatures: Object.values(FEATURE_KEYS),
  },
}

export function createEmptyTrip() {
  return {
    users: [],
    trips: [],
    trip_members: [],
    traveler_preferences: [],
    trip_routes: [],
    stops: [],
    recommendations: [],
    saved_places: [],
    notes: [],
    affiliate_links: [],
    subscription_plans: Object.values(SUBSCRIPTION_PLANS),
    feature_flags: [
      { key: FEATURE_KEYS.LIVE_SHARING, enabled: false, plan: 'pro' },
      { key: FEATURE_KEYS.PDF_EXPORT, enabled: false, plan: 'pro' },
      { key: FEATURE_KEYS.CALENDAR_EXPORT, enabled: false, plan: 'pro' },
      { key: FEATURE_KEYS.ADVANCED_BUDGET, enabled: false, plan: 'pro' },
      { key: FEATURE_KEYS.AI_MEAL_PLANNER, enabled: false, plan: 'pro' },
      { key: FEATURE_KEYS.CUSTOM_MAP_LAYERS, enabled: false, plan: 'pro' },
    ],
  }
}

export const TRIP_STORAGE_KEY = 'euro-trip-copilot/v1'

export function createStarterTrip() {
  return {
    id: 'trip-eu-001',
    title: 'European Road Journey',
    destination: '',
    destinationIdea: '',
    startLocation: '',
    endLocation: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    mode: 'car',
    convoyMode: false,
    routeStyle: 'scenic',
    languages: ['en'],
    currency: CURRENCIES.default,
    unitSystem: UNIT_SYSTEM,
    setupComplete: false,
    preferenceComplete: false,
    preferences: {
      cuisines: [],
      dislikedFoods: '',
      dietaryRestrictions: '',
      activities: [],
      budgetRange: 'mid-range',
      stopFrequency: 'every 90-120 minutes',
      travelEnergy: 'balanced',
      mustHaveTraits: [],
      scenicPreference: 'balanced',
      kidsPetsAccessibility: [],
    },
    collaborators: [],
    notes: '',
    hotels: [],
    savedRestaurants: [],
    savedActivities: [],
    selectedStops: [],
    recommendedStops: [],
    alternatives: [],
    affiliateCtas: {
      hotel: '',
      activities: '',
      transport: '',
    },
  }
}
