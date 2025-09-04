import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'

export const LocalLottieAnimation = ({ animationData, style = {} }) => {
  const lottieRef = useRef(null)
  
  // Force restart animation when animationData changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(0, true)
      lottieRef.current.play()
    }
  }, [animationData])
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        width={`${parseInt(style.width) - 5}px` || '80%'}
        height={`${parseInt(style.height) - 5}px`|| '80%'}
        style={
            {
                maxWidth: '140px',
                maxHeight: '140px',
            }
        }
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid meet',
          hideOnTransparent: true,
          
        }}
      />
    </motion.div>
  )
}