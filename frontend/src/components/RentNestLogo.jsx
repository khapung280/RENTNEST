import React from 'react'

const RentNestLogo = ({ className = '', size = 40, showText = true, variant = 'default' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Advanced Logo Icon - Premium House + Nest Design */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-lg"
      >
        {/* Outer Glow Circle */}
        <circle cx="70" cy="70" r="68" fill="url(#outerGlow)" opacity="0.3" />
        
        {/* Main Background Circle with Gradient */}
        <circle cx="70" cy="70" r="65" fill="url(#mainGradient)" stroke="url(#borderGradient)" strokeWidth="2" />
        
        {/* House Structure - More Detailed */}
        <g transform="translate(70, 70)">
          {/* House Base Shadow */}
          <ellipse cx="0" cy="50" rx="35" ry="8" fill="black" opacity="0.2" />
          
          {/* House Foundation */}
          <rect x="-35" y="40" width="70" height="5" fill="#1E293B" rx="2" />
          
          {/* Main House Body */}
          <path
            d="M-35 40 L-35 5 L35 5 L35 40 Z"
            fill="white"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          
          {/* Roof with Tiles */}
          <path
            d="M-38 5 L0 -15 L38 5 Z"
            fill="url(#roofGradient)"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
          
          {/* Roof Tile Details */}
          <path
            d="M-30 0 L0 -12 L30 0"
            stroke="#FCD34D"
            strokeWidth="0.8"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M-20 2.5 L0 -8 L20 2.5"
            stroke="#FCD34D"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
          
          {/* Door - More Detailed */}
          <rect
            x="-10"
            y="15"
            width="20"
            height="25"
            fill="url(#doorGradient)"
            rx="3"
            stroke="#1E40AF"
            strokeWidth="1.5"
          />
          
          {/* Door Frame */}
          <rect
            x="-12"
            y="13"
            width="24"
            height="29"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="1"
            rx="4"
          />
          
          {/* Door Handle - More Realistic */}
          <circle
            cx="5"
            cy="27"
            r="2"
            fill="url(#handleGradient)"
            stroke="#1E40AF"
            strokeWidth="0.5"
          />
          
          {/* Door Window/Peephole */}
          <circle
            cx="0"
            cy="20"
            r="3"
            fill="#93C5FD"
            stroke="#3B82F6"
            strokeWidth="1"
          />
          
          {/* Windows - More Detailed */}
          <g>
            {/* Left Window */}
            <rect
              x="-28"
              y="8"
              width="14"
              height="14"
              fill="url(#windowGradient)"
              rx="2"
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
            <line x1="-28" y1="15" x2="-14" y2="15" stroke="#3B82F6" strokeWidth="1" />
            <line x1="-21" y1="8" x2="-21" y2="22" stroke="#3B82F6" strokeWidth="1" />
            
            {/* Right Window */}
            <rect
              x="14"
              y="8"
              width="14"
              height="14"
              fill="url(#windowGradient)"
              rx="2"
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
            <line x1="14" y1="15" x2="28" y2="15" stroke="#3B82F6" strokeWidth="1" />
            <line x1="21" y1="8" x2="21" y2="22" stroke="#3B82F6" strokeWidth="1" />
          </g>
          
          {/* Advanced Nest on Roof - More Unique and Detailed */}
          <g transform="translate(28, -8)">
            {/* Nest Shadow */}
            <ellipse cx="0" cy="18" rx="10" ry="3" fill="black" opacity="0.15" />
            
            {/* Nest Structure - Twisted Twigs */}
            <g>
              {/* Outer Twigs - More Realistic */}
              <path
                d="M-10 10 Q-12 6 -10 2 Q-8 0 -5 2 Q-3 4 -2 6 Q0 8 2 6 Q3 4 5 2 Q8 0 10 2 Q12 6 10 10 Q8 14 5 16 Q2 18 0 18 Q-2 18 -5 16 Q-8 14 -10 10 Z"
                fill="url(#nestGradient)"
                stroke="#78350F"
                strokeWidth="1.5"
              />
              
              {/* Inner Nest Layer */}
              <ellipse
                cx="0"
                cy="12"
                rx="7"
                ry="5"
                fill="#92400E"
                opacity="0.7"
              />
              
              {/* Twig Details - Individual Sticks */}
              <path
                d="M-8 8 Q-6 4 -4 6"
                stroke="#78350F"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M-4 6 Q-2 2 0 4"
                stroke="#78350F"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M0 4 Q2 2 4 6"
                stroke="#78350F"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M4 6 Q6 4 8 8"
                stroke="#78350F"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Nest Interior - Cozy Texture */}
              <ellipse
                cx="0"
                cy="13"
                rx="6"
                ry="4"
                fill="#A16207"
                opacity="0.9"
              />
              
              {/* Eggs in Nest - More Realistic */}
              <g>
                <ellipse
                  cx="-3"
                  cy="14"
                  rx="2.5"
                  ry="3"
                  fill="url(#eggGradient)"
                  stroke="#FCD34D"
                  strokeWidth="0.8"
                />
                <ellipse
                  cx="3"
                  cy="14"
                  rx="2.5"
                  ry="3"
                  fill="url(#eggGradient)"
                  stroke="#FCD34D"
                  strokeWidth="0.8"
                />
                {/* Egg Highlights */}
                <ellipse
                  cx="-3"
                  cy="13"
                  rx="1"
                  ry="1.5"
                  fill="white"
                  opacity="0.6"
                />
                <ellipse
                  cx="3"
                  cy="13"
                  rx="1"
                  ry="1.5"
                  fill="white"
                  opacity="0.6"
                />
              </g>
              
              {/* Small Bird Silhouette (Optional - Makes it more unique) */}
              <g transform="translate(-2, -3)" opacity="0.7">
                <ellipse cx="0" cy="0" rx="2" ry="1.5" fill="#1E293B" />
                <path
                  d="M-1.5 -1 Q-2.5 -2 -3 -1.5"
                  stroke="#1E293B"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
          
          {/* Decorative Elements - Makes it more premium */}
          <g opacity="0.3">
            {/* Sun Rays */}
            <path
              d="M-50 -50 L-45 -50 M-50 -50 L-50 -45"
              stroke="#FCD34D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M50 -50 L45 -50 M50 -50 L50 -45"
              stroke="#FCD34D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>
        
        {/* Gradient Definitions */}
        <defs>
          {/* Main Background Gradient */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          
          {/* Border Gradient */}
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          
          {/* Outer Glow */}
          <radialGradient id="outerGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          
          {/* Roof Gradient */}
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
          
          {/* Door Gradient */}
          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          
          {/* Handle Gradient */}
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          
          {/* Window Gradient */}
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          
          {/* Nest Gradient */}
          <linearGradient id="nestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A16207" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          
          {/* Egg Gradient */}
          <linearGradient id="eggGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="50%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Logo Text - light gradient for dark theme when variant="dark" */}
      {showText && (
        <div className="flex flex-col">
          <span className={`text-2xl font-extrabold bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-sm ${
            variant === 'dark'
              ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
          }`}>
            RentNest
          </span>
          {variant === 'withTagline' && (
            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">
              Your Home, Your Nest
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default RentNestLogo
