import React from 'react'

const LocationIcon = ({ 
  size = 24, 
  color = "currentColor", 
  className = "",
  animated = false 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color}
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
    >
      <path d="M12 2c-4.42 0-8 3.58-8 8 0 4.41 8 12 8 12s8-7.59 8-12c0-4.42-3.58-8-8-8z"/>
    </svg>
  )
}

export default LocationIcon