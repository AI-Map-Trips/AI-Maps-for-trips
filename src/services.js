const DESTINATION_IDEAS = [
  'Dolomites Panorama Loop (Italy)',
  'Basque Coast + Rioja Food Road (Spain)',
  'Alsace Villages + Black Forest (France/Germany)',
  'Bavaria Lakes + Salzburg Arc (Germany/Austria)',
  'Portuguese Atlantic Villages Route (Portugal)',
]

export function suggestDestination({ travelStyle, activityPreferences, budgetRange }) {
  const style = (travelStyle || '').toLowerCase()
  if (style.includes('relaxed') || activityPreferences?.includes('wellness')) {
    return DESTINATION_IDEAS[4]
  }
  if (activityPreferences?.includes('hiking') || activityPreferences?.includes('nature')) {
    return DESTINATION_IDEAS[0]
  }
  if (budgetRange === 'luxury') return DESTINATION_IDEAS[3]
  return DESTINATION_IDEAS[2]
}

export const affiliateProvider = {
  buildLink(type, context = {}) {
    const base = {
      hotel: 'https://example-affiliate.com/hotels',
      activity: 'https://example-affiliate.com/activities',
      transport: 'https://example-affiliate.com/transport',
    }[type]

    if (!base) return ''
    const query = new URLSearchParams(context).toString()
    return query ? `${base}?${query}` : base
  },
}

function scoreByMode(mode, item) {
  if (mode === 'scenic') return item.scenicScore * 1.2 + item.foodScore * 0.4
  if (mode === 'food-first') return item.foodScore * 1.2 + item.familyScore * 0.3
  return item.speedScore * 1.1 + item.familyScore * 0.4
}

export function recommendationEngine({ route, preferences, tripContext, weatherContext, mode = 'scenic' }) {
  const raw = [
    {
      id: 'rec-1',
      type: 'restaurant',
      title: 'Farm-to-table lunch in a hill village',
      shortDescription: 'Seasonal menu with kid portions and fast service near your route.',
      estimatedDetourImpact: '+12 min',
      relevanceScore: 88,
      tags: ['local', 'family', 'lunch'],
      familyFriendly: true,
      dietaryRelevance: preferences.dietaryRestrictions || 'general',
      bookingActionUrl: affiliateProvider.buildLink('activity', { slot: 'restaurant', destination: route.destination }),
      scenicScore: 68,
      foodScore: 94,
      speedScore: 72,
      familyScore: 90,
    },
    {
      id: 'rec-2',
      type: 'viewpoint',
      title: 'Alpine viewpoint with short walking loop',
      shortDescription: 'Easy scenic stop with accessible path and photo platform.',
      estimatedDetourImpact: '+15 min',
      relevanceScore: 92,
      tags: ['scenic', 'viewpoint', 'nature'],
      familyFriendly: true,
      dietaryRelevance: null,
      bookingActionUrl: '',
      scenicScore: 98,
      foodScore: 45,
      speedScore: 70,
      familyScore: 82,
    },
    {
      id: 'rec-3',
      type: 'family_stop',
      title: 'Lakeside rest area with playground',
      shortDescription: 'Restrooms, shaded picnic tables, pet zone, and secure parking.',
      estimatedDetourImpact: '+8 min',
      relevanceScore: 86,
      tags: ['rest stop', 'kids', 'pet-friendly'],
      familyFriendly: true,
      dietaryRelevance: null,
      bookingActionUrl: '',
      scenicScore: 72,
      foodScore: 60,
      speedScore: 90,
      familyScore: 95,
    },
    {
      id: 'rec-4',
      type: 'attraction',
      title: 'Historic village center and local market',
      shortDescription: 'Short cultural detour for architecture, artisan shops, and snacks.',
      estimatedDetourImpact: '+20 min',
      relevanceScore: 83,
      tags: ['culture', 'history', 'local'],
      familyFriendly: true,
      dietaryRelevance: null,
      bookingActionUrl: affiliateProvider.buildLink('activity', { slot: 'village', destination: route.destination }),
      scenicScore: 84,
      foodScore: 82,
      speedScore: 52,
      familyScore: 76,
    },
  ]

  const ranked = raw
    .map((item) => ({ ...item, rank: Math.round(scoreByMode(mode, item)) }))
    .sort((a, b) => b.rank - a.rank)

  const alternatives = [
    {
      id: 'alt-1',
      trigger: 'If weather changes',
      suggestion: weatherContext?.condition === 'rain' ? 'Swap viewpoint for covered market and museum stop.' : 'Keep scenic ridge stop active.',
    },
    {
      id: 'alt-2',
      trigger: 'If you leave later',
      suggestion: 'Skip long detour and prioritize high-rated restaurant + one quick viewpoint.',
    },
    {
      id: 'alt-3',
      trigger: 'If energy drops',
      suggestion: 'Use comfort stop sequence with shorter walking attractions every 75 minutes.',
    },
  ]

  return {
    grouped: {
      restaurants: ranked.filter((item) => item.type === 'restaurant'),
      attractions: ranked.filter((item) => ['attraction', 'viewpoint'].includes(item.type)),
      restStops: ranked.filter((item) => item.type === 'family_stop'),
      all: ranked,
    },
    alternatives,
    context: {
      route,
      preferences,
      tripContext,
    },
  }
}

export const mapProvider = {
  getRoutePreview({ start, end, mode }) {
    return {
      provider: 'mock-provider',
      polyline: [
        { x: 6, y: 82 },
        { x: 24, y: 68 },
        { x: 44, y: mode === 'scenic' ? 28 : 45 },
        { x: 62, y: mode === 'food-first' ? 56 : 34 },
        { x: 82, y: 38 },
        { x: 94, y: 16 },
      ],
      markers: [
        { id: 'start', label: start || 'Start', x: 6, y: 82, type: 'start' },
        { id: 'end', label: end || 'Destination', x: 94, y: 16, type: 'end' },
      ],
    }
  },
}
