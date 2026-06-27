import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    rotateX: -20,
    y: 40,
    scale: 0.95,
  },
  in: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    rotateX: 20,
    y: -40,
    scale: 1.05,
  }
};

const pageTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ transformOrigin: 'center center', perspective: '1200px' }}
    >
      {children}
    </motion.div>
  );
}
