import React from 'react'

const WaterDropIcon = ({ 
  size = 24, 
  color = "currentColor", 
  className = "",
  animated = false 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-bounce' : ''}`}
    >
      <path 
        d="M12 2l-4.5 9c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5L12 2z" 
        fill={color}
      />
      {/* Shine effect */}
      <ellipse 
        cx="10.5" 
        cy="8" 
        rx="1.5" 
        ry="2" 
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  )
}

export default WaterDropIcon