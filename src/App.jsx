import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Euro,
  Lightbulb,
  Lock,
  Plus,
  Route,
  Sparkles,
  Users,
  WandSparkles,
} from 'lucide-react'
import { TRIP_STORAGE_KEY, createEmptyTrip, createStarterTrip, FEATURE_KEYS, SUBSCRIPTION_PLANS } from './domainModels'
import { recommendationEngine, suggestDestination, mapProvider, affiliateProvider } from './services'
import { usePersistedTripState } from './usePersistedTripState'

const CUISINES = ['Italian', 'Spanish', 'French', 'Greek', 'Turkish', 'Seafood', 'Vegetarian']
const ACTIVITIES = ['nature', 'history', 'shopping', 'hiking', 'beaches', 'family fun', 'museums', 'nightlife', 'wellness', 'hidden gems']
const TRAITS = ['kid-friendly', 'pet-friendly', 'luxury', 'cheap eats', 'local-only', 'scenic route', 'accessibility-first']

const STAGES = ['setup', 'preferences', 'dashboard']

function cn(base, condition, whenTrue, whenFalse = '') {
  return `${base} ${condition ? whenTrue : whenFalse}`.trim()
}

function AppShell({ children }) {
  return (
    <main className="min-h-screen bg-[#F7FAFF] text-[#0B203A]">
      <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">{children}</div>
    </main>
  )
}

function Surface({ children, className = '' }) {
  return <section className={`rounded-2xl border border-[#D5E6FF] bg-white shadow-[0_10px_40px_rgba(21,88,175,0.08)] ${className}`}>{children}</section>
}

function SectionHeader({ badge, title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EAF2FF] p-4 md:p-5">
      <div>
        {badge ? <div className="mb-2 inline-flex rounded-full border border-[#D7E7FF] bg-[#F3F8FF] px-2.5 py-1 text-[11px] font-semibold text-[#225CA8]">{badge}</div> : null}
        <h2 className="text-lg font-semibold text-[#0F2D52] md:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#55739A]">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  )
}

function StageProgress({ stage }) {
  const index = STAGES.indexOf(stage)
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-[#D5E6FF] bg-white p-4 md:flex-row md:items-center md:justify-between md:px-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F86CC]">Plan less. Travel better.</p>
        <h1 className="text-xl font-semibold text-[#0F2D52] md:text-2xl">From A to B, with the right stops in between.</h1>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {['Trip setup', 'Your preferences', 'Route companion'].map((label, step) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                step <= index,
                'border-[#4C8EF0] bg-[#4C8EF0] text-white',
                'border-[#CFE0FA] bg-[#F7FAFF] text-[#6587B2]',
              )}
            >
              {step + 1}
            </span>
            <span className={cn('font-medium', step <= index, 'text-[#2E5F9D]', 'text-[#7F9BC0]')}>{label}</span>
            {step < 2 ? <ArrowRight size={14} className="text-[#90AED4]" /> : null}
          </div>
        ))}
      </div>
    </div>
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
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              active,
              'border-[#4B8FF5] bg-[#EEF5FF] text-[#1D5DB5]',
              'border-[#D6E4F8] bg-white text-[#5C789C] hover:border-[#A8C5EE]',
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ title, description, cta, onCta }) {
  return (
    <div className="rounded-xl border border-dashed border-[#BCD5F9] bg-[#F6FAFF] p-6 text-center">
      <WandSparkles className="mx-auto mb-3 text-[#4F86CC]" size={24} />
      <h3 className="text-base font-semibold text-[#204D86]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#5E7EA7]">{description}</p>
      {cta ? (
        <button onClick={onCta} className="mt-4 rounded-full bg-[#4D90F5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3E7FE0]">
          {cta}
        </button>
      ) : null}
    </div>
  )
}

function RecommendationCard({ item, onSave, onRemove, isSaved, onInspect }) {
  const whyRelevant = `${item.tags.slice(0, 2).join(' • ')} • ${item.estimatedDetourImpact}`

  return (
    <article className="rounded-xl border border-[#DBE9FB] bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5B84B8]">{item.type.replace('_', ' ')}</p>
          <h4 className="text-sm font-semibold text-[#153B6A]">{item.title}</h4>
          <p className="mt-1 text-xs text-[#3F6A9E]">Why this fits: {whyRelevant}</p>
        </div>
        <span className="rounded-full bg-[#EFF6FF] px-2 py-1 text-[11px] font-semibold text-[#2E67B7]">{item.relevanceScore}%</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#57799F]">{item.shortDescription}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[#6487B2]">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-[#D8E8FD] bg-[#F7FBFF] px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <button onClick={() => onInspect(item.id)} className="font-medium text-[#2F6FC0] hover:underline">
          View on map
        </button>
        <div className="flex items-center gap-3">
          {item.bookingActionUrl ? (
            <a href={item.bookingActionUrl} target="_blank" rel="noreferrer" className="font-medium text-[#2D5EA7] underline">
              Book option
            </a>
          ) : null}
          <button onClick={() => (isSaved ? onRemove(item) : onSave(item))} className="rounded-full bg-[#ECF5FF] px-3 py-1 font-semibold text-[#2A67B8] hover:bg-[#DBECFF]">
            {isSaved ? 'Remove' : 'Save stop'}
          </button>
        </div>
      </div>
    </article>
  )
}

function RouteMap({ routePreview, recommendations, onPick, selectedId }) {
  const polyline = routePreview.polyline.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <div className="rounded-xl border border-[#D7E8FC] bg-[linear-gradient(180deg,#F7FBFF,#FFFFFF)] p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-[#5D7FA8]">
        <span className="inline-flex items-center gap-1 font-medium text-[#2B5D9D]"><Route size={14} /> Route preview</span>
        <span>{routePreview.provider}</span>
      </div>
      <svg viewBox="0 0 100 100" className="h-72 w-full rounded-lg bg-[radial-gradient(circle_at_10%_10%,rgba(73,144,236,0.24),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(120,187,255,0.22),transparent_34%),#F3F9FF]">
        <polyline points={polyline} fill="none" stroke="#2F80ED" strokeWidth="2.1" strokeLinecap="round" />
        {routePreview.markers.map((m) => (
          <g key={m.id}>
            <circle cx={m.x} cy={m.y} r="2.2" fill={m.type === 'end' ? '#1CA672' : '#2F80ED'} />
            <text x={m.x + 1.8} y={m.y - 2.4} fill="#2C5F9F" fontSize="3.1">
              {m.label}
            </text>
          </g>
        ))}
        {recommendations.map((rec, idx) => (
          <g key={rec.id} onClick={() => onPick(rec.id)} className="cursor-pointer">
            <circle cx={18 + idx * 19} cy={65 - idx * 11} r={selectedId === rec.id ? '2.9' : '2.2'} fill={selectedId === rec.id ? '#F59E0B' : '#1E4E88'} />
          </g>
        ))}
      </svg>
    </div>
  )
}

function SelectedStopList({ selectedStops, onMove }) {
  if (!selectedStops.length) {
    return (
      <EmptyState
        title="No stops saved yet"
        description="Save a few suggestions to shape your route timeline. Start with one scenic stop and one food stop."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {selectedStops.map((stop, index) => (
        <li key={stop.id} className="rounded-xl border border-[#D9E9FD] bg-[#FAFCFF] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#204974]">{stop.title}</p>
              <p className="text-xs text-[#6182A8]">{stop.type.replace('_', ' ')} • {stop.estimatedDetourImpact}</p>
            </div>
            <div className="flex gap-1 text-sm">
              <button onClick={() => onMove(index, -1)} className="rounded border border-[#CFE0F8] bg-white px-2">↑</button>
              <button onClick={() => onMove(index, 1)} className="rounded border border-[#CFE0F8] bg-white px-2">↓</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [store, setStore] = usePersistedTripState(TRIP_STORAGE_KEY, {
    schema: createEmptyTrip(),
    activeTrip: createStarterTrip(),
    plan: 'free',
  })

  const initialStage = store.activeTrip.preferenceComplete ? 'dashboard' : store.activeTrip.setupComplete ? 'preferences' : 'setup'
  const [stage, setStage] = useState(initialStage)
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
  const focusedRecommendation = recommendations.find((item) => item.id === selectedRecommendation) || recommendations[0] || null

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

  function generateDestinationIdea() {
    const suggestion = suggestDestination({
      travelStyle: trip.preferences.travelEnergy,
      activityPreferences: trip.preferences.activities,
      budgetRange: trip.preferences.budgetRange,
    })
    updateTrip({ destinationIdea: suggestion, destination: suggestion, endLocation: suggestion })
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
    setSelectedRecommendation(recommendations[0]?.id || null)
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
    <AppShell>
      <StageProgress stage={stage} />

      <Surface className="mb-4 overflow-hidden">
        <SectionHeader
          badge="Europe-first route copilot"
          title="Discover places you’ll actually want to stop at"
          subtitle="Apple-Maps-inspired clarity: white surfaces, blue routes, and guided decisions for first-time planners."
          actions={
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D8E7FB] bg-[#F7FBFF] px-3 py-1.5 text-[#3F6FA9]"><Euro size={13} /> EUR default</span>
              <span className="rounded-full border border-[#D8E7FB] bg-[#F7FBFF] px-3 py-1.5 text-[#3F6FA9]">Metric</span>
            </div>
          }
        />

        <div className="p-4 md:p-5">
          {stage === 'setup' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#557399]">Start with destination + dates. We’ll personalize your route once your basics are set.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" placeholder="Start city" value={trip.startLocation} onChange={(e) => updateTrip({ startLocation: e.target.value })} />
                <input className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" placeholder="Destination" value={trip.destination} onChange={(e) => updateTrip({ destination: e.target.value, endLocation: e.target.value })} />
                <input type="date" className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.startDate} onChange={(e) => updateTrip({ startDate: e.target.value })} />
                <input type="date" className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.endDate} onChange={(e) => updateTrip({ endDate: e.target.value })} />
                <input type="number" min="1" className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.travelers} onChange={(e) => updateTrip({ travelers: Number(e.target.value) })} />
                <label className="flex items-center gap-2 rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm text-[#476A95]"><input type="checkbox" checked={trip.convoyMode} onChange={(e) => updateTrip({ convoyMode: e.target.checked })} />Prepare convoy mode</label>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-[#D9E7FA] bg-[#F6FAFF] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#4C74A3]">
                  <span className="font-medium">Need inspiration?</span> Ask AI for destination ideas based on your style.
                </div>
                <button onClick={generateDestinationIdea} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4C90F2] px-4 py-2 text-sm font-semibold text-white"><Sparkles size={14} /> Suggest a destination</button>
              </div>
              {trip.destinationIdea ? <p className="text-sm text-[#3568A8]">Suggested: <strong>{trip.destinationIdea}</strong></p> : null}
              <div className="flex justify-end">
                <button className="rounded-full bg-[#2E84F6] px-5 py-2.5 text-sm font-semibold text-white" onClick={completeSetup}>Continue to preferences</button>
              </div>
            </div>
          ) : null}

          {stage === 'preferences' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#5878A0]">Tell us how you like to travel so every stop feels intentional.</p>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5E86B7]">Preferred cuisines</p>
                <ChipPicker options={CUISINES} values={trip.preferences.cuisines} onToggle={(v) => togglePreferenceField('cuisines', v)} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5E86B7]">Activities you care about</p>
                <ChipPicker options={ACTIVITIES} values={trip.preferences.activities} onToggle={(v) => togglePreferenceField('activities', v)} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5E86B7]">Must-have trip traits</p>
                <ChipPicker options={TRAITS} values={trip.preferences.mustHaveTraits} onToggle={(v) => togglePreferenceField('mustHaveTraits', v)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.preferences.budgetRange} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, budgetRange: e.target.value } })}><option>budget</option><option>mid-range</option><option>luxury</option></select>
                <select className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.preferences.travelEnergy} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, travelEnergy: e.target.value } })}><option>relaxed</option><option>balanced</option><option>intense</option></select>
                <select className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" value={trip.routeStyle} onChange={(e) => updateTrip({ routeStyle: e.target.value })}><option value="fastest">fastest</option><option value="scenic">scenic</option><option value="food-first">food-first</option></select>
                <input className="rounded-xl border border-[#D3E2F9] bg-[#FBFDFF] p-3 text-sm" placeholder="Dietary restrictions" value={trip.preferences.dietaryRestrictions} onChange={(e) => updateTrip({ preferences: { ...trip.preferences, dietaryRestrictions: e.target.value } })} />
              </div>
              <div className="flex justify-end">
                <button className="rounded-full bg-[#2E84F6] px-5 py-2.5 text-sm font-semibold text-white" onClick={completePreferences}>Generate route companion</button>
              </div>
            </div>
          ) : null}

          {stage === 'dashboard' ? (
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
                <div className="space-y-4">
                  <Surface className="overflow-hidden border-[#DCEAFD] shadow-none">
                    <SectionHeader
                      title="Your route + AI suggestions"
                      subtitle="See what to stop for, why it matters, and what to do next."
                      actions={
                        <div className="flex flex-wrap gap-2">
                          {['fastest', 'scenic', 'food-first'].map((mode) => (
                            <button key={mode} className={cn('rounded-full border px-3 py-1.5 text-xs font-medium', trip.routeStyle === mode, 'border-[#4B90F5] bg-[#EEF5FF] text-[#2B66B6]', 'border-[#D7E4F7] text-[#607EA4]')} onClick={() => updateTrip({ routeStyle: mode })}>
                              {mode}
                            </button>
                          ))}
                        </div>
                      }
                    />
                    <div className="grid gap-4 p-3 md:p-4 lg:grid-cols-[1.3fr,1fr]">
                      <RouteMap routePreview={routePreview} recommendations={recommendations} onPick={setSelectedRecommendation} selectedId={selectedRecommendation} />
                      <div className="rounded-xl border border-[#D8E8FD] bg-[#F8FBFF] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6288B7]">Detail panel</p>
                        {focusedRecommendation ? (
                          <div className="mt-2 space-y-2">
                            <h3 className="text-base font-semibold text-[#154473]">{focusedRecommendation.title}</h3>
                            <p className="text-sm text-[#51769F]">{focusedRecommendation.shortDescription}</p>
                            <p className="text-xs text-[#5D80AA]">Detour impact: <strong>{focusedRecommendation.estimatedDetourImpact}</strong></p>
                            <p className="text-xs text-[#5D80AA]">Family friendly: <strong>{focusedRecommendation.familyFriendly ? 'Yes' : 'No'}</strong></p>
                            <button className="rounded-full bg-[#2E84F6] px-4 py-2 text-xs font-semibold text-white" onClick={() => saveStop(focusedRecommendation)}>Add to selected stops</button>
                          </div>
                        ) : (
                          <EmptyState title="No recommendation selected" description="Tap a map marker or card to inspect a stop in detail." />
                        )}
                      </div>
                    </div>
                  </Surface>

                  <Surface className="p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#123D6E]">AI suggestions</h3>
                      <span className="text-xs text-[#6185AF]">{recommendations.length} suggestions generated</span>
                    </div>
                    {!recommendations.length ? (
                      <EmptyState title="No suggestions yet" description="Complete preferences to generate route-aware recommendations." />
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {recommendations.map((item) => (
                          <RecommendationCard
                            key={item.id}
                            item={item}
                            onInspect={setSelectedRecommendation}
                            onSave={saveStop}
                            onRemove={removeStop}
                            isSaved={trip.selectedStops.some((s) => s.id === item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </Surface>
                </div>

                <div className="space-y-4">
                  <Surface className="p-4 md:p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#2D78D7]" />
                      <h3 className="text-base font-semibold text-[#123D6E]">Selected stops</h3>
                    </div>
                    <SelectedStopList selectedStops={trip.selectedStops} onMove={moveStop} />
                  </Surface>

                  <Surface className="p-4 md:p-5">
                    <h3 className="text-base font-semibold text-[#123D6E]">Alternatives if plans shift</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {generated.alternatives.map((alt) => (
                        <li key={alt.id} className="rounded-xl border border-[#DDEBFD] bg-[#F8FBFF] p-3 text-[#4E739C]"><strong>{alt.trigger}:</strong> {alt.suggestion}</li>
                      ))}
                    </ul>
                  </Surface>

                  <Surface className="p-4 md:p-5">
                    <h3 className="text-base font-semibold text-[#123D6E]">Trip notes & collaboration</h3>
                    <textarea className="mt-2 h-24 w-full rounded-xl border border-[#D5E4F9] bg-[#FBFDFF] p-3 text-sm" placeholder="Key reminders, bookings, and meetup points..." value={trip.notes} onChange={(e) => updateTrip({ notes: e.target.value })} />
                    <div className="mt-3 flex gap-2">
                      <input className="w-full rounded-xl border border-[#D5E4F9] bg-[#FBFDFF] p-2.5 text-sm" placeholder="Invite collaborator by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                      <button className="rounded-xl border border-[#C8DCF8] bg-[#F4F9FF] px-3 text-[#2D66B8]" onClick={addCollaborator}><Plus size={14} /></button>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-[#5D81AA]">
                      {trip.collaborators.length ? trip.collaborators.map((member) => <li key={member.email} className="flex items-center gap-2"><Users size={12} /> {member.email}</li>) : <li>No collaborators yet.</li>}
                    </ul>
                  </Surface>
                </div>
              </div>

              <Surface className="overflow-hidden">
                <SectionHeader
                  badge="Freemium + partner bookings"
                  title="Upgrade when you need deeper planning power"
                  subtitle="Free for basic route planning. Pro unlocks advanced planning and live trip coordination."
                />
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#D7E7FC] bg-[#FAFCFF] p-4">
                    <p className="text-sm font-semibold text-[#1C4A7C]">Free</p>
                    <p className="text-xs text-[#5C7FA8]">1-2 trips, limited collaborators, limited AI suggestions.</p>
                    <ul className="mt-3 space-y-1 text-xs text-[#567AA3]">
                      <li>• Basic route companion</li>
                      <li>• Hotel/activity/transport booking slots</li>
                      <li>• Structured suggestions</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[#9DC2F6] bg-[linear-gradient(180deg,#F4F9FF,#EAF4FF)] p-4">
                    <div className="flex items-center gap-2"><Crown size={16} className="text-[#2F6FC0]" /><p className="text-sm font-semibold text-[#1C4A7C]">Pro</p></div>
                    <p className="text-xs text-[#5C7FA8]">Unlimited trips, exports, live-sharing roadmap, and premium tools.</p>
                    <ul className="mt-3 space-y-1 text-xs text-[#567AA3]">
                      {['Live sharing', 'PDF export', 'Calendar export', 'AI meal planner', 'Advanced budget planner', 'Custom map layers'].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">{premiumLocked ? <Lock size={12} /> : <CheckCircle2 size={12} />} {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-[#E5F0FF] bg-[#FBFDFF] p-4 text-xs text-[#4F75A1]">
                  <a href={trip.affiliateCtas.hotel} target="_blank" rel="noreferrer" className="rounded-full border border-[#CEE0FA] bg-white px-3 py-1.5 hover:border-[#A7C5EE]">Hotel booking CTA</a>
                  <a href={trip.affiliateCtas.activities} target="_blank" rel="noreferrer" className="rounded-full border border-[#CEE0FA] bg-white px-3 py-1.5 hover:border-[#A7C5EE]">Activity booking CTA</a>
                  <a href={trip.affiliateCtas.transport} target="_blank" rel="noreferrer" className="rounded-full border border-[#CEE0FA] bg-white px-3 py-1.5 hover:border-[#A7C5EE]">Transport booking CTA</a>
                </div>
              </Surface>
            </div>
          ) : null}
        </div>
      </Surface>

      {stage !== 'dashboard' ? (
        <Surface className="p-4 text-sm text-[#5B7EA6]">
          <div className="flex flex-wrap items-center gap-2">
            <Lightbulb size={16} className="text-[#4F86CC]" />
            <p>
              First run tip: complete setup + preferences once, then reuse the trip profile for future weekend routes.
            </p>
          </div>
        </Surface>
      ) : null}
    </AppShell>
  )
}
