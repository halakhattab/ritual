import { motion } from 'framer-motion'

export default function ProgressDots({ step }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[1, 2, 3].map((n) => (
        <motion.div
          key={n}
          animate={{
            backgroundColor: step === n ? '#9B7540' : 'transparent',
            borderColor: step === n ? '#9B7540' : '#9B754060',
            width: step === n ? 10 : 6,
            height: step === n ? 10 : 6,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: '#9B754060',
          }}
        />
      ))}
    </div>
  )
}
