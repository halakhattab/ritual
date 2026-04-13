import { motion } from 'framer-motion'

export default function Wordmark({ dark = false }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.4rem',
        fontWeight: 400,
        letterSpacing: '0.02em',
        color: dark ? '#C4A46B' : '#9B7540',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      ritual
      <motion.span
        whileHover={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          color: dark ? '#C4A46B' : '#9B7540',
          display: 'inline-block',
          transformOrigin: 'center bottom',
        }}
      >
        .
      </motion.span>
    </div>
  )
}
