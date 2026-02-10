// Utility functions for property features

/**
 * Calculate Rent Confidence Score (0-100)
 * Based on: verified listing, price fairness, FairFlex availability, amenities count
 */
export const calculateRentConfidence = (property) => {
  let score = 0
  
  // Verified listing (30 points)
  // Assume properties with id <= 10 are verified (you can add verified field later)
  const isVerified = property.id <= 10 || property.verified === true
  if (isVerified) score += 30
  
  // Price fairness (30 points)
  // Lower price per sqft = better value
  const pricePerSqft = property.price / property.areaSqft
  const avgPricePerSqft = 12 // Average Rs. 12 per sqft in Nepal
  if (pricePerSqft <= avgPricePerSqft * 0.8) score += 30
  else if (pricePerSqft <= avgPricePerSqft) score += 20
  else if (pricePerSqft <= avgPricePerSqft * 1.2) score += 10
  
  // FairFlex discount availability (20 points)
  // Properties under 20k or with 3+ bedrooms typically offer FairFlex
  const hasFairFlex = property.price <= 20000 || property.bedrooms >= 3
  if (hasFairFlex) score += 20
  
  // Amenities count (20 points)
  // Estimate amenities based on property features
  let amenitiesCount = 0
  if (property.bedrooms >= 3) amenitiesCount++
  if (property.bathrooms >= 2) amenitiesCount++
  if (property.areaSqft >= 1500) amenitiesCount++
  if (property.price <= 18000) amenitiesCount++ // Budget-friendly
  
  if (amenitiesCount >= 3) score += 20
  else if (amenitiesCount >= 2) score += 15
  else if (amenitiesCount >= 1) score += 10
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Determine who this home is best for
 * Returns: 'Family' | 'Students' | 'Professionals' | 'Quiet Living'
 */
export const getBestForLabel = (property) => {
  const { price, bedrooms, bathrooms, areaSqft, location } = property
  
  // Family: 3+ bedrooms, 2+ bathrooms, spacious
  if (bedrooms >= 3 && bathrooms >= 2 && areaSqft >= 1800) {
    return 'Family'
  }
  
  // Students: Low price, 1-2 bedrooms, compact
  if (price <= 12000 && bedrooms <= 2 && areaSqft <= 1200) {
    return 'Students'
  }
  
  // Professionals: Mid-range price, 2-3 bedrooms, good location
  const professionalLocations = ['Kathmandu', 'Lalitpur', 'Pokhara']
  if (price >= 12000 && price <= 20000 && bedrooms >= 2 && professionalLocations.includes(location)) {
    return 'Professionals'
  }
  
  // Quiet Living: Lower price, fewer bedrooms, peaceful areas
  const quietLocations = ['Bhaktapur', 'Chitwan']
  if (price <= 16000 && bedrooms <= 3 && quietLocations.includes(location)) {
    return 'Quiet Living'
  }
  
  // Default based on price
  if (price <= 15000) return 'Students'
  if (price >= 25000) return 'Family'
  return 'Professionals'
}

/**
 * Calculate FairFlex savings for 3 or 6 month stays
 * Returns: { savings3Months, savings6Months, monthlySavings3, monthlySavings6 }
 */
export const calculateFairFlexSavings = (property) => {
  const monthlyPrice = property.price
  
  // FairFlex discount: 5% for 3 months, 10% for 6 months
  const discount3Months = 0.05
  const discount6Months = 0.10
  
  const total3Months = monthlyPrice * 3
  const total6Months = monthlyPrice * 6
  
  const savings3Months = total3Months * discount3Months
  const savings6Months = total6Months * discount6Months
  
  const monthlySavings3 = monthlyPrice * discount3Months
  const monthlySavings6 = monthlyPrice * discount6Months
  
  return {
    savings3Months: Math.round(savings3Months),
    savings6Months: Math.round(savings6Months),
    monthlySavings3: Math.round(monthlySavings3),
    monthlySavings6: Math.round(monthlySavings6),
    hasFairFlex: property.price <= 20000 || property.bedrooms >= 3
  }
}

/**
 * Get city-specific living cost estimates (monthly)
 */
export const getCityLivingCost = (city) => {
  const estimates = {
    'Kathmandu': {
      rent: 15000,
      food: 8000,
      transport: 3000,
      utilities: 2000,
      total: 28000
    },
    'Lalitpur': {
      rent: 14000,
      food: 7500,
      transport: 2500,
      utilities: 1800,
      total: 25800
    },
    'Bhaktapur': {
      rent: 12000,
      food: 7000,
      transport: 2000,
      utilities: 1500,
      total: 22500
    },
    'Pokhara': {
      rent: 13000,
      food: 7500,
      transport: 2000,
      utilities: 1700,
      total: 24200
    },
    'Chitwan': {
      rent: 11000,
      food: 6500,
      transport: 1500,
      utilities: 1400,
      total: 20400
    }
  }
  
  return estimates[city] || estimates['Kathmandu']
}

/**
 * Get Nepal-specific local insights for a city
 */
export const getCityInsights = (city) => {
  const insights = {
    'Kathmandu': {
      tip: 'Best connectivity and amenities. Consider Thamel for tourists, Baneshwor for professionals.',
      highlight: 'Capital city with excellent public transport and job opportunities.'
    },
    'Lalitpur': {
      tip: 'Rich cultural heritage with modern amenities. Patan Durbar Square area is highly walkable.',
      highlight: 'Lower rent than Kathmandu with similar access to facilities.'
    },
    'Bhaktapur': {
      tip: 'Heritage city with peaceful living. Great for families seeking traditional atmosphere.',
      highlight: 'Most affordable among major cities with good schools and healthcare.'
    },
    'Pokhara': {
      tip: 'Tourist-friendly with beautiful lake views. Lakeside area is popular but pricier.',
      highlight: 'Perfect balance of nature and modern amenities. Growing job market.'
    },
    'Chitwan': {
      tip: 'Close to nature and national park. Lower cost of living with good quality of life.',
      highlight: 'Ideal for those seeking quieter lifestyle away from city hustle.'
    }
  }
  
  return insights[city] || {
    tip: 'Nepal offers diverse living options across all major cities.',
    highlight: 'Each city has unique charm and affordability.'
  }
}

/**
 * Generate explanation for why a property might be better for comparison
 */
export const getComparisonExplanation = (property, allProperties) => {
  const explanations = []
  
  // Price comparison
  const avgPrice = allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length
  if (property.price < avgPrice * 0.9) {
    explanations.push('Best value for money')
  } else if (property.price > avgPrice * 1.1) {
    explanations.push('Premium option with more space')
  }
  
  // Size comparison
  const avgArea = allProperties.reduce((sum, p) => sum + p.areaSqft, 0) / allProperties.length
  if (property.areaSqft > avgArea * 1.2) {
    explanations.push('Most spacious option')
  }
  
  // Bedrooms comparison
  const maxBeds = Math.max(...allProperties.map(p => p.bedrooms))
  if (property.bedrooms === maxBeds) {
    explanations.push('Best for larger families')
  }
  
  // Location advantage
  const popularCities = ['Kathmandu', 'Lalitpur', 'Pokhara']
  if (popularCities.includes(property.location)) {
    explanations.push('Prime location with better connectivity')
  }
  
  // FairFlex availability
  const savings = calculateFairFlexSavings(property)
  if (savings.hasFairFlex) {
    explanations.push('FairFlex available - save on long stays')
  }
  
  return explanations.length > 0 
    ? explanations.join(' • ') 
    : 'Good balance of features and price'
}

