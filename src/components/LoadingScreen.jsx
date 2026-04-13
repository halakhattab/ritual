import { motion } from 'framer-motion'
import Wordmark from './Wordmark'

export default function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#F2EDE4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        zIndex: 50,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ fontSize: '1.8rem' }}
      >
        <Wordmark />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Breathing gold progress line */}
        <div style={{ position: 'relative', width: 120, height: 2 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#9B754020',
              borderRadius: 1,
            }}
          />
          <motion.div
            animate={{
              scaleX: [0.12, 1, 0.12],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#9B7540',
              borderRadius: 1,
              transformOrigin: 'center',
            }}
          />
        </div>

        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1rem',
            color: '#9B7540',
            letterSpacing: '0.05em',
          }}
        >
          crafting your intention…
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
