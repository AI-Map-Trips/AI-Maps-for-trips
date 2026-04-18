import { useMemo, useState } from 'react'
import { Crown, Euro, Lock, MapPin, Plus, Route, Sparkles, Users } from 'lucide-react'
import { TRIP_STORAGE_KEY, createEmptyTrip, createStarterTrip, FEATURE_KEYS, SUBSCRIPTION_PLANS } from './domainModels'
import { recommendationEngine, suggestDestination, mapProvider, affiliateProvider } from './services'
import { usePersistedTripState } from './usePersistedTripState'

const CUISINES = ['Italian', 'Spanish', 'French', 'Greek', 'Turkish', 'Seafood', 'Vegetarian']
const ACTIVITIES = ['nature', 'history', 'shopping', 'hiking', 'beaches', 'family fun', 'museums', 'nightlife', 'wellness', 'hidden gems']
const TRAITS = ['kid-friendly', 'pet-friendly', 'luxury', 'cheap eats', 'local-only', 'scenic route', 'accessibility-first']

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-md border border-[#30363D] bg-[#111822] p-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      {subtitle ? <p className="mb-3 mt-1 text-xs text-[#9aa4b2]">{subtitle}</p> : null}
      {children}
    </section>
  )
}

function ChipPicker({ options, values, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border px-3 py-1 text-xs ${
              active ? 'border-[#58A6FF] bg-[#58A6FF]/15 text-[#d4e9ff]' : 'border-[#30363D] text-[#c9d1d9]'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function RecommendationCard({ item, onSave, onRemove, isSaved }) {
  return (
    <div className="rounded-md border border-[#30363D] bg-[#0d1117] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#8b949e]">{item.type.replace('_', ' ')}</div>
          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
        </div>
        <div className="text-xs text-[#D29922]">{item.estimatedDetourImpact}</div>
      </div>
      <p className="mt-2 text-xs text-[#c9d1d9]">{item.shortDescription}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#8b949e]">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded border border-[#30363D] px-2 py-0.5">#{tag}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[#58A6FF]">Relevance {item.relevanceScore}%</span>
        <div className="flex gap-2">
          {item.bookingActionUrl ? (
            <a href={item.bookingActionUrl} className="text-xs text-[#D29922] underline" target="_blank" rel="noreferrer">
              Book
            </a>
          ) : null}
          <button className="text-xs text-[#58A6FF]" onClick={() => (isSaved ? onRemove(item) : onSave(item))}>
            {isSaved ? 'Remove' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RouteMap({ routePreview, recommendations, onPick, selectedId }) {
  const polyline = routePreview.polyline.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <div className="rounded-md border border-[#30363D] bg-[#0a0f16] p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-[#9aa4b2]">
        <span className="flex items-center gap-1"><Route size={14} /> Interactive route</span>
        <span>{routePreview.provider}</span>
      </div>
      <svg viewBox="0 0 100 100" className="h-64 w-full rounded bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.16),transparent_50%)]">
        <polyline points={polyline} fill="none" stroke="#58A6FF" strokeWidth="1.8" />
        {routePreview.markers.map((m) => (
          <g key={m.id}>
            <circle cx={m.x} cy={m.y} r="2" fill={m.type === 'end' ? '#3FB950' : '#D29922'} />
            <text x={m.x + 1.5} y={m.y - 2} fill="#c9d1d9" fontSize="3">{m.label}</text>
          </g>
        ))}
        {recommendations.map((rec, idx) => (
          <g key={rec.id} onClick={() => onPick(rec.id)} className="cursor-pointer">
            <circle cx={18 + idx * 19} cy={66 - idx * 10} r={selectedId === rec.id ? '2.6' : '2.1'} fill={selectedId === rec.id ? '#F85149' : '#C9D1D9'} />
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function App() {
  const [store, setStore] = usePersistedTripState(TRIP_STORAGE_KEY, {
    schema: createEmptyTrip(),
    activeTrip: createStarterTrip(),
    plan: 'free',
  })
  const [stage, setStage] = useState(store.activeTrip.preferenceComplete ? 'dashboard' : store.activeTrip.setupComplete ? 'preferences' : 'setup')
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')

  const trip = store.activeTrip
  const plan = SUBSCRIPTION_PLANS[store.plan]

  const routePreview = useMemo(
    () => mapProvider.getRoutePreview({ start: trip.startLocation, end: trip.destination || trip.endLocation, mode: trip.routeStyle }),
    [trip.startLocation, trip.destination, trip.endLocation, trip.routeStyle],
  )

  const generated = useMemo(() => {
    const route = { start: trip.startLocation, end: trip.endLocation, destination: trip.destination, style: trip.routeStyle }
    return recommendationEngine({
      route,
      preferences: trip.preferences,
      tripContext: { travelers: trip.travelers, mode: trip.mode },
      weatherContext: { condition: 'sun' },
      mode: trip.routeStyle,
    })
  }, [trip])

  const recommendations = generated.grouped.all.slice(0, plan.maxSuggestions)

  function updateTrip(patch) {
    setStore((current) => ({ ...current, activeTrip: { ...current.activeTrip, ...patch } }))
  }

  function togglePreferenceField(field, value) {
    const values = trip.preferences[field]
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
    updateTrip({ preferences: { ...trip.preferences, [field]: next } })
  }

  function completeSetup() {
    updateTrip({ setupComplete: true })
    setStage('preferences')
  }

  function completePreferences() {
    const affiliateCtas = {
      hotel: affiliateProvider.buildLink('hotel', { destination: trip.destination || trip.endLocation }),
      activities: affiliateProvider.buildLink('activity', { destination: trip.destination || trip.endLocation }),
      transport: affiliateProvider.buildLink('transport', { destination: trip.destination || trip.endLocation }),
    }
    setStore((current) => ({
      ...current,
      activeTrip: {
        ...current.activeTrip,
        preferenceComplete: true,
        recommendedStops: recommendations,
        alternatives: generated.alternatives,
        affiliateCtas,
      },
    }))
    setStage('dashboard')
  }

  function saveStop(rec) {
    if (trip.selectedStops.some((item) => item.id === rec.id)) return
    updateTrip({ selectedStops: [...trip.selectedStops, rec] })
  }

  function removeStop(rec) {
    updateTrip({ selectedStops: trip.selectedStops.filter((item) => item.id !== rec.id) })
  }

  function moveStop(index, direction) {
    const next = [...trip.selectedStops]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateTrip({ selectedStops: next })
  }

  function addCollaborator() {
    if (!inviteEmail) return
    if (trip.collaborators.length >= plan.maxCollaborators) return
    updateTrip({ collaborators: [...trip.collaborators, { email: inviteEmail, role: 'editor' }] })
    setInviteEmail('')
  }

  const premiumLocked = !plan.enabledFeatures.includes(FEATURE_KEYS.LIVE_SHARING)

  return (
    <main className="min-h-screen bg-[#0A0C10] p-4 text-[#C9D1D9]">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-md border border-[#30363D] bg-[#111822] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#58A6FF]">Europe-first route copilot</p>
              <h1 className="text-2xl font-bold text-white">Turn the route into part of the trip.</h1>
              <p className="text-sm text-[#9aa4b2]">From A to B, with the right stops in between.</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded border border-[#30363D] px-2 py-1"><Euro size={14} /> EUR default</span>
              <span className="inline-flex items-center gap-1 rounded border border-[#30363D] px-2 py-1">Metric</span>
              <button onClick={() => setStore((cur) => ({ ...cur, plan: cur.plan === 'free' ? 'pro' : 'free' }))} className="rounded bg-[#58A6FF]/15 px-3 py-1 text-xs text-[#d4e9ff]">
                Plan: {plan.name}
              </button>
            </div>
          </div>
        </header>

        {stage === 'setup' ? (
          <Section title="1) Trip setup" subtitle="Choose destination, route basics, dates, and group size.">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" placeholder="Start city" value={trip.startLocation} onChange={(e) => updateTrip({ startLocation: e.target.value })} />
              <input className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" placeholder="Destination" value={trip.destination} onChange={(e) => updateTrip({ destination: e.target.value, endLocation: e.target.value })} />
              <input type="date" className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.startDate} onChange={(e) => updateTrip({ startDate: e.target.value })} />
              <input type="date" className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.endDate} onChange={(e) => updateTrip({ endDate: e.target.value })} />
              <input type="number" min="1" className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.travelers} onChange={(e) => updateTrip({ travelers: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={trip.convoyMode} onChange={(e) => updateTrip({ convoyMode: e.target.checked })} />Multi-car / convoy foundation</label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded border border-[#58A6FF] bg-[#58A6FF]/10 px-3 py-1 text-xs"
                onClick={() => updateTrip({ destinationIdea: suggestDestination({ travelStyle: trip.preferences.travelEnergy, activityPreferences: trip.preferences.activities, budgetRange: trip.preferences.budgetRange }), destination: suggestDestination({ travelStyle: trip.preferences.travelEnergy, activityPreferences: trip.preferences.activities, budgetRange: trip.preferences.budgetRange }), endLocation: suggestDestination({ travelStyle: trip.preferences.travelEnergy, activityPreferences: trip.preferences.activities, budgetRange: trip.preferences.budgetRange }) })}
              >
                <Sparkles size={14} /> Ask AI for destination ideas
              </button>
              <span className="text-xs text-[#9aa4b2]">{trip.destinationIdea || 'No suggestion yet'}</span>
            </div>
            <button className="mt-4 rounded bg-[#58A6FF] px-4 py-2 text-sm font-semibold text-[#071523]" onClick={completeSetup}>Continue to preferences</button>
          </Section>
        ) : null}

        {stage === 'preferences' ? (
          <Section title="2) Preference onboarding" subtitle="Discover places you'll actually want to stop at.">
            <div className="space-y-4">
              <div><p className="mb-1 text-xs">Preferred cuisines</p><ChipPicker options={CUISINES} values={trip.preferences.cuisines} onToggle={(v) => togglePreferenceField('cuisines', v)} /></div>
              <div><p className="mb-1 text-xs">Activities</p><ChipPicker options={ACTIVITIES} values={trip.preferences.activities} onToggle={(v) => togglePreferenceField('activities', v)} /></div>
              <div><p className="mb-1 text-xs">Must-have traits</p><ChipPicker options={TRAITS} values={trip.preferences.mustHaveTraits} onToggle={(v) => togglePreferenceField('mustHaveTraits', v)} /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.preferences.budgetRange} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, budgetRange: e.target.value } })}><option>budget</option><option>mid-range</option><option>luxury</option></select>
                <select className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.preferences.travelEnergy} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, travelEnergy: e.target.value } })}><option>relaxed</option><option>balanced</option><option>intense</option></select>
                <select className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" value={trip.routeStyle} onChange={(e) => updateTrip({ routeStyle: e.target.value })}><option value="fastest">fastest</option><option value="scenic">scenic</option><option value="food-first">food-first</option></select>
                <input className="rounded border border-[#30363D] bg-[#0d1117] p-2 text-sm" placeholder="Dietary restrictions" value={trip.preferences.dietaryRestrictions} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, dietaryRestrictions: e.target.value } })} />
              </div>
            </div>
            <button className="mt-4 rounded bg-[#58A6FF] px-4 py-2 text-sm font-semibold text-[#071523]" onClick={completePreferences}>Generate route suggestions</button>
          </Section>
        ) : null}

        {stage === 'dashboard' ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
            <div className="space-y-4">
              <Section title="3-4) Interactive route + AI suggestions" subtitle="Plan less. Travel better.">
                <div className="mb-3 flex items-center gap-2 text-xs">
                  {['fastest', 'scenic', 'food-first'].map((mode) => (
                    <button key={mode} className={`rounded border px-2 py-1 ${trip.routeStyle === mode ? 'border-[#58A6FF] text-[#58A6FF]' : 'border-[#30363D]'}`} onClick={() => updateTrip({ routeStyle: mode })}>{mode}</button>
                  ))}
                </div>
                <RouteMap routePreview={routePreview} recommendations={recommendations} onPick={setSelectedRecommendation} selectedId={selectedRecommendation} />
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {recommendations.map((item) => (
                    <RecommendationCard
                      key={item.id}
                      item={item}
                      onSave={saveStop}
                      onRemove={removeStop}
                      isSaved={trip.selectedStops.some((s) => s.id === item.id)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="5) Trip dashboard" subtitle="Route overview, selected stops, saved collections, notes.">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded border border-[#30363D] p-3">
                    <h3 className="mb-2 text-xs uppercase text-[#8b949e]">Selected stops</h3>
                    <div className="space-y-2">
                      {trip.selectedStops.map((stop, index) => (
                        <div key={stop.id} className="rounded border border-[#30363D] p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span>{stop.title}</span>
                            <div className="flex gap-2">
                              <button onClick={() => moveStop(index, -1)}>↑</button>
                              <button onClick={() => moveStop(index, 1)}>↓</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded border border-[#30363D] p-3">
                    <h3 className="mb-2 text-xs uppercase text-[#8b949e]">Trip notes</h3>
                    <textarea className="h-28 w-full rounded border border-[#30363D] bg-[#0d1117] p-2 text-xs" value={trip.notes} onChange={(e) => updateTrip({ notes: e.target.value })} />
                  </div>
                  <div className="rounded border border-[#30363D] p-3 text-xs">
                    <h3 className="mb-2 text-xs uppercase text-[#8b949e]">Saved hotels</h3>
                    <a href={trip.affiliateCtas.hotel} className="text-[#D29922] underline" target="_blank" rel="noreferrer">Hotel booking CTA</a>
                  </div>
                  <div className="rounded border border-[#30363D] p-3 text-xs">
                    <h3 className="mb-2 text-xs uppercase text-[#8b949e]">Saved activities</h3>
                    <a href={trip.affiliateCtas.activities} className="text-[#D29922] underline" target="_blank" rel="noreferrer">Activity booking CTA</a>
                  </div>
                </div>
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Alternatives" subtitle="Dynamic backup options.">
                <ul className="space-y-2 text-xs">
                  {generated.alternatives.map((alt) => (
                    <li key={alt.id} className="rounded border border-[#30363D] p-2"><b>{alt.trigger}:</b> {alt.suggestion}</li>
                  ))}
                </ul>
              </Section>

              <Section title="6) Sharing & collaboration" subtitle="Invite family/friends for collaborative planning.">
                <div className="flex gap-2">
                  <input className="w-full rounded border border-[#30363D] bg-[#0d1117] p-2 text-xs" placeholder="friend@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  <button className="rounded border border-[#58A6FF] px-3 text-xs" onClick={addCollaborator}><Plus size={14} /></button>
                </div>
                <ul className="mt-3 space-y-1 text-xs">
                  {trip.collaborators.map((member) => <li key={member.email} className="flex items-center gap-2"><Users size={12} /> {member.email}</li>)}
                </ul>
              </Section>

              <Section title="7) Monetization-ready surfaces" subtitle="Freemium + affiliate architecture in place.">
                <div className="space-y-2 text-xs">
                  <div className="rounded border border-[#30363D] p-2">Transport booking CTA: <a className="text-[#D29922] underline" href={trip.affiliateCtas.transport} target="_blank" rel="noreferrer">Open provider</a></div>
                  <div className="rounded border border-[#30363D] p-2">Feature flags: {Object.keys(FEATURE_KEYS).length} premium capabilities stubbed.</div>
                  <div className="rounded border border-[#30363D] p-2">
                    <div className="mb-1 flex items-center gap-2"><Crown size={14} /> Pro features</div>
                    <div className="space-y-1">
                      {[ 'Live sharing', 'PDF export', 'Calendar export', 'Advanced budget', 'AI meal planner', 'Custom map layers' ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2">{premiumLocked ? <Lock size={12} /> : <MapPin size={12} />}{feature}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
