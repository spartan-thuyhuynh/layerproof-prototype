import { useState, useRef, useEffect } from 'react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { X } from 'lucide-react'

const GENDERS = ['All genders', 'Mostly women', 'Mostly men', 'Non-binary skew']


const ALL_LOCATIONS = [
  'Global', 'North America', 'South America', 'Europe', 'Asia-Pacific',
  'Latin America', 'Middle East & Africa', 'Southeast Asia', 'East Asia',
  'South Asia', 'Central Asia', 'North Africa', 'Sub-Saharan Africa',
  'Oceania', 'Caribbean',
  // Countries
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Korea',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland',
  'Spain', 'Italy', 'Portugal', 'Poland', 'Russia', 'Turkey', 'Israel',
  'Saudi Arabia', 'UAE', 'South Africa', 'Nigeria', 'Kenya', 'Egypt',
  'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Singapore',
  'New Zealand', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Pakistan',
  'Bangladesh', 'Taiwan', 'Hong Kong', 'Ireland', 'Belgium', 'Austria',
  'Czech Republic', 'Romania', 'Ukraine', 'Greece',
]

export function WizStep4_Audience() {
  const {
    audienceAgeMin: ageMin, audienceAgeMax: ageMax,
    audienceGender: gender, audienceLocations: locations,
    setField,
  } = useWizardStore()
  const [geoQuery, setGeoQuery] = useState('')
  const [geoOpen, setGeoOpen] = useState(false)
  const geoRef = useRef<HTMLDivElement>(null)

  const suggestions = geoQuery.trim().length > 0
    ? ALL_LOCATIONS.filter(
        (l) => l.toLowerCase().includes(geoQuery.toLowerCase()) && !locations.includes(l)
      ).slice(0, 8)
    : []

  function addLocation(loc: string) {
    if (!locations.includes(loc)) setField('audienceLocations', [...locations, loc])
    setGeoQuery('')
    setGeoOpen(false)
  }

  function removeLocation(loc: string) {
    setField('audienceLocations', locations.filter((l) => l !== loc))
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) setGeoOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">Who's your audience?</h1>
        <p className="biz-step-sub">Help us calibrate your brand's tone and imagery style.</p>
      </div>

      <div className="biz-audience-row">
        <div className="biz-audience-label">Age range</div>
        <div className="biz-age-inputs">
          <div className="biz-age-field">
            <label className="biz-age-label">Min</label>
            <input
              className="onb-input biz-age-input"
              type="number"
              min={13} max={ageMax - 1}
              value={ageMin}
              onChange={(e) => setField('audienceAgeMin', Math.min(+e.target.value, ageMax - 1))}
            />
          </div>
          <span className="biz-age-dash">—</span>
          <div className="biz-age-field">
            <label className="biz-age-label">Max</label>
            <input
              className="onb-input biz-age-input"
              type="number"
              min={ageMin + 1} max={100}
              value={ageMax}
              onChange={(e) => setField('audienceAgeMax', Math.max(+e.target.value, ageMin + 1))}
            />
          </div>
        </div>
      </div>

      <div className="biz-audience-row">
        <div className="biz-audience-label">Gender skew</div>
        <div className="biz-gender-chips">
          {GENDERS.map((g) => (
            <button
              key={g}
              className={`biz-gender-chip${gender === g ? ' active' : ''}`}
              onClick={() => setField('audienceGender', g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="biz-audience-row">
        <div className="biz-audience-label">Geography</div>
        <div className="biz-geo-wrap" ref={geoRef}>
          <div className="biz-geo-tags">
            {locations.map((loc) => (
              <span key={loc} className="biz-geo-tag">
                {loc}
                <button className="biz-geo-tag-remove" onClick={() => removeLocation(loc)} aria-label={`Remove ${loc}`}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              className="biz-geo-input"
              placeholder={locations.length === 0 ? 'Search countries or regions…' : 'Add more…'}
              value={geoQuery}
              onChange={(e) => { setGeoQuery(e.target.value); setGeoOpen(true) }}
              onFocus={() => setGeoOpen(true)}
            />
          </div>
          {geoOpen && suggestions.length > 0 && (
            <div className="biz-geo-dropdown">
              {suggestions.map((s) => (
                <button key={s} className="biz-geo-option" onMouseDown={() => addLocation(s)}>{s}</button>
              ))}
            </div>
          )}
          {/* Quick-add suggestions */}
          {!geoOpen && (
            <div className="biz-geo-quick">
              {['Global', 'Vietnam', 'United States', 'Southeast Asia', 'Europe', 'Asia-Pacific']
                .filter((s) => !locations.includes(s))
                .map((s) => (
                  <button key={s} className="biz-val-suggestion" onClick={() => addLocation(s)}>
                    + {s}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function WizStep4_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="biz-nav">
      <button className="biz-nav-back-link" onClick={onBack}>← Back</button>
      <button className="btn primary" onClick={onNext}>Continue →</button>
    </div>
  )
}
