import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Wordmark from './components/Wordmark'
import ProgressDots from './components/ProgressDots'
import LoadingScreen from './components/LoadingScreen'
import RevealScreen from './components/RevealScreen'

const MOODS = ['Energized', 'Calm', 'Foggy', 'Motivated', 'Anxious', 'Tired']
const NEEDS = ['Clarity', 'Rest', 'Momentum', 'Connection', 'Courage', 'Joy']
const COOLDOWN_DURATION = 30

const MOOD_ICONS = {
  Energized: '↑',
  Calm: '○',
  Foggy: '≈',
  Motivated: '↗',
  Anxious: '◌',
  Tired: '◡',
}

const NEED_ICONS = {
  Clarity: '✦',
  Rest: '◎',
  Momentum: '→',
  Connection: '◇',
  Courage: '▲',
  Joy: '☀',
}

// Slide variants — direction 1 = forward, -1 = back
// Exiting screen blurs out; entering screen starts sharp
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '60px' : '-60px',
    opacity: 0,
    filter: 'blur(0px)',
  }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir) => ({
    x: dir > 0 ? '-60px' : '60px',
    opacity: 0,
    filter: 'blur(4px)',
  }),
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
})

function PillButton({ label, selected, onClick, icon }) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ scale: selected ? [1, 1.08, 1] : 1 }}
      transition={{ scale: { duration: 0.25, ease: 'easeOut' } }}
      whileHover={{ boxShadow: '0 0 12px rgba(155, 117, 64, 0.25)' }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#9B754080'
          e.currentTarget.style.color = '#0D0B08'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#3A353040'
          e.currentTarget.style.color = '#3A3530'
        }
      }}
      style={{
        padding: '12px 24px',
        border: selected ? '1.5px solid #9B7540' : '1.5px solid #3A353040',
        background: selected ? '#9B7540' : 'transparent',
        color: selected ? '#F2EDE4' : '#3A3530',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.92rem',
        fontWeight: 400,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        borderRadius: 3,
        transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: 16,
            lineHeight: 1,
            display: 'inline-block',
            opacity: selected ? 1 : 0.7,
            transition: 'opacity 0.18s ease',
          }}
        >
          {icon}
        </span>
      )}
      {label}
    </motion.button>
  )
}

function QuestionLayout({ step, direction, question, subtitle, children }) {
  return (
    <motion.div
      key={`step-${step}`}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top nav */}
      <div
        style={{
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Wordmark />
        <ProgressDots step={step} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 60px',
          gap: '40px',
          maxWidth: 640,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', width: '100%' }}>
          <motion.p
            {...fadeUp(0.15)}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
              fontWeight: 400,
              color: '#0D0B08',
              lineHeight: 1.2,
            }}
          >
            {question}
          </motion.p>
          {subtitle && (
            <motion.p
              {...fadeUp(0.25)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                color: '#9B7540',
                letterSpacing: '0.04em',
              }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <motion.div
          {...fadeUp(0.35)}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [mood, setMood] = useState(null)
  const [weighing, setWeighing] = useState('')
  const [weighingFocused, setWeighingFocused] = useState(false)
  const [need, setNeed] = useState(null)
  const [result, setResult] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const cursorGlowRef = useRef(null)

  // Init cooldown from localStorage
  useEffect(() => {
    const lastGen = localStorage.getItem('ritual_last_generation')
    if (lastGen) {
      const elapsed = (Date.now() - parseInt(lastGen)) / 1000
      const remaining = Math.max(0, COOLDOWN_DURATION - elapsed)
      if (remaining > 0) setCooldown(Math.ceil(remaining))
    }
  }, [])

  // Cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Cursor glow — update via DOM ref to avoid re-renders on every mousemove
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate(${e.clientX - 100}px, ${e.clientY - 100}px)`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const goTo = (s, dir = 1) => {
    setDirection(dir)
    setStep(s)
  }

  const generateIntention = async () => {
    if (cooldown > 0) return
    setError(null)
    setIsGenerating(true)
    goTo('loading', 1)

    const content = `You are a warm, wise wellness guide. Based on the following about someone's day, generate:
1. A daily intention (one sentence, poetic, personal, present tense — not generic)
2. A morning ritual (name + 1 sentence description)
3. A midday ritual (name + 1 sentence description)
4. An evening ritual (name + 1 sentence description)
5. A closing thought (one sentence, like something a trusted friend would say)

Their mood: ${mood}
What's weighing on them: ${weighing.trim() || 'Nothing in particular'}
What they need today: ${need}

Respond ONLY in this exact JSON format, no preamble, no markdown:
{
  "intention": "...",
  "morning": { "name": "...", "description": "..." },
  "midday": { "name": "...", "description": "..." },
  "evening": { "name": "...", "description": "..." },
  "closing": "..."
}`

    try {
      const proxyUrl = import.meta.env.VITE_PROXY_URL
      if (!proxyUrl) throw new Error('VITE_PROXY_URL is not configured.')

      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content }],
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API error ${res.status}: ${errText}`)
      }

      const data = await res.json()
      const text = data.content[0].text.trim()

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(cleaned)

      setResult(parsed)
      localStorage.setItem('ritual_last_generation', Date.now().toString())
      setCooldown(COOLDOWN_DURATION)
      goTo('reveal', 1)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
      goTo(3, -1)
    } finally {
      setIsGenerating(false)
    }
  }

  const reset = () => {
    setDirection(-1)
    setMood(null)
    setWeighing('')
    setNeed(null)
    setResult(null)
    setError(null)
    setIsGenerating(false)
    setStep(1)
  }

  const isActive = need && cooldown === 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F2EDE4',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cursor glow — follows mouse, no React re-renders */}
      <div
        ref={cursorGlowRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,117,64,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />

      <AnimatePresence mode="wait" custom={direction}>
        {/* ─── STEP 1: Mood ─── */}
        {step === 1 && (
          <QuestionLayout
            key="s1"
            step={1}
            direction={direction}
            question="How are you arriving today?"
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {MOODS.map((m, i) => (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.35 }}
                >
                  <PillButton
                    label={m}
                    selected={mood === m}
                    onClick={() => setMood(m)}
                    icon={MOOD_ICONS[m]}
                  />
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: mood ? 1 : 0.4 }}
              onClick={() => mood && goTo(2, 1)}
              style={{
                marginTop: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#0D0B08',
                background: 'transparent',
                border: '1px solid #0D0B0840',
                padding: '12px 36px',
                cursor: mood ? 'pointer' : 'default',
                borderRadius: 3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (mood) {
                  e.currentTarget.style.background = '#0D0B0808'
                  e.currentTarget.style.borderColor = '#0D0B08'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#0D0B0840'
              }}
            >
              Continue
            </motion.button>
          </QuestionLayout>
        )}

        {/* ─── STEP 2: Weighing ─── */}
        {step === 2 && (
          <QuestionLayout
            key="s2"
            step={2}
            direction={direction}
            question="What is weighing on you right now?"
            subtitle="Optional — take your time, or skip entirely."
          >
            {/* Textarea with animated gold underline and character count */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
              <textarea
                value={weighing}
                onChange={(e) => setWeighing(e.target.value)}
                onFocus={() => setWeighingFocused(true)}
                onBlur={() => setWeighingFocused(false)}
                placeholder="A deadline, a conversation, a feeling…"
                rows={3}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #3A353050',
                  padding: '12px 0',
                  paddingBottom: '20px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.3rem',
                  fontStyle: 'italic',
                  color: '#0D0B08',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                }}
              />
              {/* Animated gold underline — grows left to right on focus */}
              <motion.div
                animate={{ scaleX: weighingFocused ? 1 : 0 }}
                initial={{ scaleX: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: '#9B7540',
                  transformOrigin: 'left',
                  pointerEvents: 'none',
                }}
              />
              {/* Character count — appears only when typing */}
              {weighing.length > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 0,
                    fontSize: '0.72rem',
                    color: '#9B7540',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.02em',
                    pointerEvents: 'none',
                  }}
                >
                  {weighing.length}
                </motion.span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setWeighing('')
                  goTo(3, 1)
                }}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  color: '#9B7540',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 4px',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Nothing today
              </button>

              <button
                onClick={() => goTo(3, 1)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#0D0B08',
                  background: 'transparent',
                  border: '1px solid #0D0B0840',
                  padding: '12px 36px',
                  cursor: 'pointer',
                  borderRadius: 3,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0D0B0808'
                  e.currentTarget.style.borderColor = '#0D0B08'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#0D0B0840'
                }}
              >
                Continue
              </button>
            </div>

            {/* Back */}
            <button
              onClick={() => goTo(1, -1)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.78rem',
                color: '#9B754080',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              ← Back
            </button>
          </QuestionLayout>
        )}

        {/* ─── STEP 3: Need ─── */}
        {step === 3 && (
          <QuestionLayout
            key="s3"
            step={3}
            direction={direction}
            question="What do you most need from today?"
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {NEEDS.map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.35 }}
                >
                  <PillButton
                    label={n}
                    selected={need === n}
                    onClick={() => setNeed(n)}
                    icon={NEED_ICONS[n]}
                  />
                </motion.div>
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: '0.82rem',
                  color: '#C0392B',
                  textAlign: 'center',
                  maxWidth: 400,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </motion.p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {/* Generate button — shimmer on hover, "Crafting…" text while loading */}
              <button
                onClick={generateIntention}
                disabled={!need || cooldown > 0}
                className={isActive ? 'btn-shimmer' : ''}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isActive ? '#F2EDE4' : '#9B7540',
                  background: isActive ? '#9B7540' : 'transparent',
                  border: `1px solid ${isActive ? '#9B7540' : '#9B754050'}`,
                  padding: '14px 40px',
                  cursor: isActive ? 'pointer' : 'default',
                  borderRadius: 3,
                  transition: 'background 0.25s ease, border-color 0.25s ease',
                  opacity: need ? 1 : 0.5,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 220,
                }}
                onMouseEnter={(e) => {
                  if (isActive) {
                    e.currentTarget.style.background = '#7D5E32'
                    e.currentTarget.style.borderColor = '#7D5E32'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isActive) {
                    e.currentTarget.style.background = '#9B7540'
                    e.currentTarget.style.borderColor = '#9B7540'
                  }
                }}
              >
                {isGenerating ? (
                  <motion.span
                    animate={{ opacity: [1, 0.45, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ display: 'inline-block' }}
                  >
                    Crafting your intention…
                  </motion.span>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s`
                ) : (
                  'Generate my intention'
                )}
              </button>

              {/* Back */}
              <button
                onClick={() => goTo(2, -1)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.78rem',
                  color: '#9B754080',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  marginTop: 4,
                }}
              >
                ← Back
              </button>
            </div>
          </QuestionLayout>
        )}

        {/* ─── LOADING ─── */}
        {step === 'loading' && <LoadingScreen key="loading" />}

        {/* ─── REVEAL ─── */}
        {step === 'reveal' && result && (
          <RevealScreen key="reveal" result={result} onReset={reset} cooldown={cooldown} />
        )}
      </AnimatePresence>
    </div>
  )
}
