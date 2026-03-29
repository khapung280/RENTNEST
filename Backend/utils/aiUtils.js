const Property = require('../models/Property');

/**
 * Check if message is a greeting
 */
const isGreeting = (query) => {
  const lowerQuery = query.toLowerCase().trim();
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste', 'namaskar'];
  return greetings.some(greeting => lowerQuery === greeting || lowerQuery.startsWith(greeting + ' '));
};

/**
 * Check if database has any properties
 */
const hasProperties = async () => {
  const count = await Property.countDocuments({ status: 'approved', isActive: true });
  return count > 0;
};

/**
 * Parse natural language query to extract filters
 * Returns: { location, minPrice, maxPrice, type, bedrooms, duration, preferences }
 */
const parseQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  const parsed = {
    location: null,
    minPrice: null,
    maxPrice: null,
    type: null,
    bedrooms: null,
    duration: null,
    preferences: []
  };

  // Location detection (Nepal cities and areas)
  const locationMap = {
    kathmandu: 'Kathmandu',
    lalitpur: 'Lalitpur',
    bhaktapur: 'Bhaktapur',
    pokhara: 'Pokhara',
    chitwan: 'Chitwan',
    birgunj: 'Birgunj',
    biratnagar: 'Biratnagar',
    butwal: 'Butwal',
    dharan: 'Dharan',
    itahari: 'Itahari',
    thamel: 'Kathmandu',
    baneshwor: 'Kathmandu',
    lazimpat: 'Kathmandu',
    tokha: 'Kathmandu',
    'durbar marg': 'Kathmandu',
    buddhanagar: 'Kathmandu',
    baluwatar: 'Kathmandu',
    gongabu: 'Kathmandu',
    koteshwor: 'Kathmandu',
    patan: 'Lalitpur',
    jawalakhel: 'Lalitpur',
    kupondole: 'Lalitpur',
    balkhu: 'Lalitpur',
    lakeside: 'Pokhara',
  };

  const locationKeys = Object.keys(locationMap).sort((a, b) => b.length - a.length);
  for (const loc of locationKeys) {
    if (lowerQuery.includes(loc)) {
      parsed.location = locationMap[loc];
      break;
    }
  }

  // Price detection (under 20k, 20000, budget 25k, etc.)
  const pricePatterns = [
    { pattern: /(?:under|below|less than|max|up to|maximum|budget)\s*(?:rs\.?|npr|rupees?)?\s*(\d+)(?:k|000)?/i, type: 'max' },
    { pattern: /(?:above|over|more than|min|minimum|at least)\s*(?:rs\.?|npr|rupees?)?\s*(\d+)(?:k|000)?/i, type: 'min' },
    { pattern: /(?:price|cost)\s*(?:of|is|around)?\s*(?:rs\.?|npr|rupees?)?\s*(\d+)(?:k|000)?/i, type: 'max' },
    { pattern: /(\d+)(?:k|000)?\s*(?:rs\.?|npr|rupees?)?\s*(?:per month|monthly|pm)/i, type: 'max' },
    { pattern: /\b(\d{1,2})k\b/i, type: 'max' },
  ];

  for (const { pattern, type } of pricePatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const raw = match[0];
      const val = match[1];
      let price = parseInt(val);
      if (raw && (raw.toLowerCase().includes('k') || price < 100)) price *= 1000;
      if (price >= 1000 && price <= 500000) {
        if (type === 'max') parsed.maxPrice = price;
        else parsed.minPrice = price;
        break;
      }
    }
  }

  // Property type detection
  if (lowerQuery.match(/\b(?:house|villa|home|bungalow)\b/)) {
    parsed.type = 'house';
  } else if (lowerQuery.match(/\b(?:flat|apartment|studio|flat_apartment)\b/)) {
    parsed.type = 'flat_apartment';
  }

  // Bedrooms detection (2 bed, 3 bedroom, 2bhk, 3br, studio, etc.)
  const bedMatch = lowerQuery.match(/\b(\d+)\s*(?:bed|bedroom|beds?|bhk|br)\b/i);
  if (bedMatch) {
    parsed.bedrooms = parseInt(bedMatch[1]);
  } else if (lowerQuery.match(/\b(?:studio|single|1\s*bhk)\b/i)) {
    parsed.bedrooms = 1;
  }

  // Duration detection (1, 3, 6, 12 months)
  const durationMatch = lowerQuery.match(/\b(\d+)\s*(?:month|months?)\b/);
  if (durationMatch) {
    const months = parseInt(durationMatch[1]);
    if ([1, 3, 6, 12].includes(months)) {
      parsed.duration = months;
    }
  }

  // Preferences detection
  if (lowerQuery.match(/\b(?:family|families|kids|children)\b/)) {
    parsed.preferences.push('family');
  }
  if (lowerQuery.match(/\b(?:student|students|college|university)\b/)) {
    parsed.preferences.push('students');
  }
  if (lowerQuery.match(/\b(?:professional|working|office|job)\b/)) {
    parsed.preferences.push('professionals');
  }
  if (lowerQuery.match(/\b(?:quiet|peaceful|calm|tranquil)\b/)) {
    parsed.preferences.push('quiet');
  }
  if (lowerQuery.match(/\b(?:verified|verified listing|trusted)\b/)) {
    parsed.preferences.push('verified');
  }
  if (lowerQuery.match(/\b(?:furnished|furniture)\b/)) {
    parsed.preferences.push('furnished');
  }

  return parsed;
};

/**
 * Fallback response when no rule-based handler matches.
 * Future: Replace this with LLM-based response generation.
 * @param {string} query - User's message
 * @returns {object} AI response object
 */
const getFallbackResponse = (query) => {
  return {
    type: 'general_help',
    message: `Here’s how to get the best results:

**Search examples**
• **Location:** "Flats in Lalitpur" or "House in Pokhara lakeside"
• **Budget:** "Under 20000 NPR" or "Budget 25k per month"
• **Size:** "3 bedroom house" or "2 BHK flat"
• **Mix:** "Family friendly house Kathmandu under 30k"

**Topics I know well**
• **FairFlex** — discounts for longer stays
• **Booking flow** — request → owner approval → payment
• **Cancellations** — pending vs approved bookings

Tip: mention a **city** and **max rent** together for tighter matches.`,
    properties: []
  };
};

/**
 * Check if query is a search query (contains location, price, property type, etc.)
 */
const isSearchQuery = (parsedQuery) => {
  return !!(
    parsedQuery.location ||
    parsedQuery.minPrice ||
    parsedQuery.maxPrice ||
    parsedQuery.type ||
    parsedQuery.bedrooms ||
    parsedQuery.preferences.length > 0
  );
};

/**
 * Calculate Rent Confidence Score (same logic as frontend)
 */
const calculateRentConfidence = (property) => {
  let score = 0;
  
  if (property.verified) score += 30;
  
  const pricePerSqft = property.price / property.areaSqft;
  const avgPricePerSqft = 12;
  if (pricePerSqft <= avgPricePerSqft * 0.8) score += 30;
  else if (pricePerSqft <= avgPricePerSqft) score += 20;
  else if (pricePerSqft <= avgPricePerSqft * 1.2) score += 10;
  
  const hasFairFlex = property.price <= 20000 || property.bedrooms >= 3;
  if (hasFairFlex) score += 20;
  
  let amenitiesCount = 0;
  if (property.bedrooms >= 3) amenitiesCount++;
  if (property.bathrooms >= 2) amenitiesCount++;
  if (property.areaSqft >= 1500) amenitiesCount++;
  if (property.price <= 18000) amenitiesCount++;
  
  if (amenitiesCount >= 3) score += 20;
  else if (amenitiesCount >= 2) score += 15;
  else if (amenitiesCount >= 1) score += 10;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Get Best For Label (same logic as frontend)
 */
const getBestForLabel = (property) => {
  const { price, bedrooms, bathrooms, areaSqft, location } = property;
  
  if (bedrooms >= 3 && bathrooms >= 2 && areaSqft >= 1800) {
    return 'Family';
  }
  if (price <= 12000 && bedrooms <= 2 && areaSqft <= 1200) {
    return 'Students';
  }
  const professionalLocations = ['Kathmandu', 'Lalitpur', 'Pokhara'];
  if (price >= 12000 && price <= 20000 && bedrooms >= 2 && professionalLocations.includes(location)) {
    return 'Professionals';
  }
  const quietLocations = ['Bhaktapur', 'Chitwan'];
  if (price <= 16000 && bedrooms <= 3 && quietLocations.includes(location)) {
    return 'Quiet Living';
  }
  if (price <= 15000) return 'Students';
  if (price >= 25000) return 'Family';
  return 'Professionals';
};

/**
 * Calculate FairFlex savings
 */
const calculateFairFlexSavings = (property, duration = 6) => {
  const discounts = { 1: 0, 3: 0.05, 6: 0.10, 12: 0.15 };
  const discount = discounts[duration] || 0;
  const monthlyPrice = property.price;
  const discountedPrice = monthlyPrice * (1 - discount);
  const savings = monthlyPrice - discountedPrice;
  
  return {
    hasFairFlex: property.price <= 20000 || property.bedrooms >= 3,
    monthlySavings: Math.round(savings),
    totalSavings: Math.round(savings * duration),
    discountedPrice: Math.round(discountedPrice)
  };
};

/**
 * Search properties based on parsed query
 */
const searchProperties = async (parsedQuery) => {
  const filter = {
    status: 'approved',
    isActive: true
  };

  if (parsedQuery.location) {
    filter.location = { $regex: parsedQuery.location, $options: 'i' };
  }
  if (parsedQuery.type) {
    filter.type = parsedQuery.type;
  }
  if (parsedQuery.minPrice || parsedQuery.maxPrice) {
    filter.price = {};
    if (parsedQuery.minPrice) filter.price.$gte = parsedQuery.minPrice;
    if (parsedQuery.maxPrice) filter.price.$lte = parsedQuery.maxPrice;
  }
  if (parsedQuery.bedrooms) {
    filter.bedrooms = { $gte: parsedQuery.bedrooms };
  }
  if (parsedQuery.preferences.includes('verified')) {
    filter.verified = true;
  }

  const properties = await Property.find(filter)
    .populate('owner', 'name email phone')
    .limit(20)
    .sort({ createdAt: -1 });

  // Add calculated fields
  return properties.map(prop => {
    const propObj = prop.toObject();
    propObj.confidenceScore = calculateRentConfidence(propObj);
    propObj.bestFor = getBestForLabel(propObj);
    propObj.fairFlexSavings = parsedQuery.duration 
      ? calculateFairFlexSavings(propObj, parsedQuery.duration)
      : calculateFairFlexSavings(propObj, 6);
    return propObj;
  });
};

/**
 * Generate explanation for property recommendation
 */
const generateRecommendationExplanation = (property, parsedQuery) => {
  const reasons = [];
  
  // Best For match
  if (parsedQuery.preferences.includes('family') && property.bestFor === 'Family') {
    reasons.push('Perfect for families with ' + property.bedrooms + ' bedrooms and spacious layout');
  }
  if (parsedQuery.preferences.includes('students') && property.bestFor === 'Students') {
    reasons.push('Ideal for students with affordable pricing and compact size');
  }
  if (parsedQuery.preferences.includes('professionals') && property.bestFor === 'Professionals') {
    reasons.push('Great for professionals in a prime location');
  }
  
  // Rent Confidence
  if (property.confidenceScore >= 70) {
    reasons.push('High Rent Confidence Score (' + property.confidenceScore + '/100) indicates trustworthy listing');
  }
  
  // FairFlex
  if (property.fairFlexSavings.hasFairFlex && parsedQuery.duration) {
    reasons.push('FairFlex pricing available - save NPR ' + 
      property.fairFlexSavings.totalSavings.toLocaleString() + ' on ' + parsedQuery.duration + '-month stay');
  }
  
  // Price
  if (parsedQuery.maxPrice && property.price <= parsedQuery.maxPrice) {
    reasons.push('Within your budget at NPR ' + property.price.toLocaleString() + '/month');
  }
  
  // Location
  if (parsedQuery.location && property.location.includes(parsedQuery.location)) {
    reasons.push('Located in ' + property.location);
  }
  
  return reasons.length > 0 
    ? reasons.join('. ') + '.'
    : 'This property matches your search criteria.';
};

/**
 * Generate AI response based on query type
 */
const generateAIResponse = async (query, userId = null) => {
  const lowerQuery = query.toLowerCase().trim();
  
  // 1. Handle greetings first
  if (isGreeting(query)) {
    return {
      type: 'greeting',
      message: `Hello! 👋 I'm **RentNest AI** — your guide to rentals in Nepal.\n\n**I can help you:**\n• Search by **city**, **budget**, **bedrooms**, house vs flat\n• Explain **FairFlex** longer-stay savings\n• Walk through **booking** and what happens after you apply\n\n**Try:** "2 BHK under 25k in Pokhara" or "What is FairFlex?"`,
      properties: []
    };
  }

  // 1b. Thanks / goodbye (fast, friendly)
  if (/^(thanks?|thank you|ty|thx|appreciate it)[\s!.]*$/i.test(query.trim())) {
    return {
      type: 'smalltalk',
      message: `You're welcome! 🙏 If you need another search or have questions about **booking** or **FairFlex**, just ask.`,
      properties: []
    };
  }
  if (/^(bye|goodbye|see you|later)[\s!.]*$/i.test(query.trim())) {
    return {
      type: 'smalltalk',
      message: `Goodbye — happy house hunting! Come back anytime you want to search or compare listings.`,
      properties: []
    };
  }
  
  // 2. FairFlex explanation
  if (lowerQuery.match(/\b(?:fairflex|fair flex|pricing|discount|save|savings|why.*expensive|cheaper)\b/)) {
    return {
      type: 'fairflex_explanation',
      message: `FairFlex is our flexible pricing model that rewards longer stays:
      
• 1 month: Standard rate (no discount)
• 3 months: 5% discount per month
• 6 months: 10% discount per month
• 12 months: 15% discount per month

The longer you stay, the more you save! This helps property owners get stable tenants while giving you better rates. Properties under NPR 20,000/month or with 3+ bedrooms typically offer FairFlex pricing.`,
      properties: []
    };
  }
  
  // 3. Booking guidance
  if (lowerQuery.match(/\b(?:book|booking|how.*book|process|steps|guide)\b/)) {
    return {
      type: 'booking_guidance',
      message: `Here's how to book a property on RentNest:

1. **Browse Properties**: Search and filter properties by location, price, bedrooms, etc.
2. **View Details**: Click on a property to see full details, photos, and amenities
3. **Select Duration**: Choose your stay duration (1, 3, 6, or 12 months)
4. **Submit Booking Request**: Fill in your details (name, email, phone, move-in date)
5. **Wait for Approval**: The property owner will review and approve/reject your request
6. **Confirmation**: Once approved, you'll receive confirmation with payment details

**Verification**: Verified properties have been checked by our team for accuracy and trustworthiness.`,
      properties: []
    };
  }

  // 3b. Cancellation FAQ
  if (lowerQuery.match(/\b(?:cancel|cancellation|cancelled|refund)\b/)) {
    return {
      type: 'cancellation_faq',
      message: `**Cancellation Policy**

• **Pending bookings**: You can cancel anytime before the owner approves. No charges.
• **Approved bookings**: Cancellation terms depend on the property owner's policy. Contact the owner or check the property details for specific terms.
• **Refunds**: If applicable, refunds are processed according to the owner's policy and RentNest guidelines.

For help with a specific booking, go to **My Bookings** or contact the property owner directly.`,
      properties: []
    };
  }
  
  // 4. Check if database has properties
  const dbHasProperties = await hasProperties();
  if (!dbHasProperties) {
    return {
      type: 'no_properties',
      message: `Currently no properties available. Please check back later.\n\nWe're working on adding more properties to our platform. In the meantime, you can:\n• Check back later for new listings\n• Contact us if you're a property owner looking to list`,
      properties: []
    };
  }
  
  // 5. Parse query and check if it's a search query
  const parsedQuery = parseQuery(query);
  const isSearch = isSearchQuery(parsedQuery);

  // Fallback: no rule-based match (property search or FAQ)
  // This is the spot to plug in an LLM fallback in the future.
  if (!isSearch) {
    return getFallbackResponse(query);
  }
  
  // 6. Perform property search
  const properties = await searchProperties(parsedQuery);
  
  // 7. Handle no results
  if (properties.length === 0) {
    let fallbackMessage = `No properties found for this search. Please try:\n\n`;
    
    if (parsedQuery.location) {
      fallbackMessage += `• Adjusting your budget range\n`;
    }
    if (parsedQuery.maxPrice) {
      fallbackMessage += `• Trying a different location\n`;
    }
    if (parsedQuery.type) {
      fallbackMessage += `• Trying a different property type (house or flat)\n`;
    }
    if (parsedQuery.bedrooms) {
      fallbackMessage += `• Adjusting the number of bedrooms\n`;
    }
    
    fallbackMessage += `• Removing some filters to see more options`;
    
    return {
      type: 'no_results',
      message: fallbackMessage,
      properties: []
    };
  }
  
  // 8. Generate explanation for top property
  const topProperty = properties[0];
  const explanation = generateRecommendationExplanation(topProperty, parsedQuery);
  
  let message = `I found ${properties.length} property${properties.length > 1 ? 'ies' : ''} matching your search.\n\n`;
  message += `**Top Recommendation:** ${topProperty.title}\n`;
  message += `📍 ${topProperty.location} | 🛏️ ${topProperty.bedrooms} Beds | 💰 NPR ${topProperty.price.toLocaleString()}/month\n\n`;
  message += `**Why this property?**\n${explanation}\n\n`;
  
  if (properties.length > 1) {
    message += `I found ${properties.length - 1} more matching properties. Would you like to see them?`;
  }
  
  return {
    type: 'property_search',
    message,
    properties: properties.slice(0, 5), // Return top 5
    parsedQuery
  };
};

module.exports = {
  parseQuery,
  searchProperties,
  generateAIResponse,
  getFallbackResponse,
  calculateRentConfidence,
  getBestForLabel,
  calculateFairFlexSavings,
  isGreeting,
  hasProperties,
  isSearchQuery
};
