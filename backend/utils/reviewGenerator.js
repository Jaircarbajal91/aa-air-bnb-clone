/**
 * Generates location-specific reviews with star ratings that align with sentiment
 */

/**
 * Generates a review based on location, property type, and star rating
 * @param {Object} options - Review generation options
 * @param {string} options.city - City name
 * @param {string} options.state - State name
 * @param {string} options.propertyType - Type of property (e.g., "Beach House", "Mountain Cabin")
 * @param {number} options.stars - Star rating (1-5)
 * @returns {string} - Generated review text
 */
function generateReview({ city, state, propertyType = 'property', stars }) {
  const cityName = city || 'the area';
  const stateName = state || '';
  const location = stateName ? `${cityName}, ${stateName}` : cityName;
  
  // Determine review length (some short, some lengthy)
  const isLengthy = Math.random() > 0.4; // 60% chance of lengthy review
  
  if (stars === 1 || stars === 2) {
    // Negative reviews
    const negativeTemplates = {
      short: [
        `Disappointed with our stay in ${cityName}. Not as described.`,
        `Had issues during our visit to ${location}. Would not recommend.`,
        `Poor experience in ${cityName}. Property needs improvement.`,
        `Not worth the price in ${location}. Many problems.`,
        `Unpleasant stay in ${cityName}. Cleanliness was an issue.`
      ],
      lengthy: [
        `Unfortunately, our stay in ${cityName} did not meet expectations. The ${propertyType.toLowerCase()} had several issues that made our visit uncomfortable. The property was not as clean as we had hoped, and there were maintenance problems that should have been addressed. The location in ${stateName ? stateName : cityName} was decent, but the condition of the property overshadowed any positive aspects. We would not recommend this property to others.`,
        `We were quite disappointed with our experience in ${location}. The ${propertyType.toLowerCase()} had multiple problems that affected our stay. From the moment we arrived, we noticed issues with cleanliness and maintenance. The property description did not accurately reflect the actual condition. While ${cityName} itself is a nice area, this particular property needs significant improvements before we would consider staying again.`,
        `Our stay in ${cityName} was unfortunately not a positive experience. The ${propertyType.toLowerCase()} had several concerning issues including cleanliness problems and maintenance needs. The property did not match the description provided, and we encountered difficulties that made our visit less enjoyable. ${stateName ? `While ${stateName} is a beautiful state,` : ''} this property needs attention before it can provide a satisfactory experience for guests.`,
        `We had a disappointing visit to ${location}. The ${propertyType.toLowerCase()} had various issues that impacted our stay negatively. The property was not maintained well, and we encountered problems that should have been addressed. The location in ${cityName} was okay, but the condition of the property was the main concern. We would not return to this property.`,
        `Unfortunately, our experience in ${cityName} was not what we expected. The ${propertyType.toLowerCase()} had several problems including maintenance issues and cleanliness concerns. The property description was misleading, and we felt the value did not match what we paid. While the area around ${location} has potential, this property needs significant work.`
      ]
    };
    const templates = isLengthy ? negativeTemplates.lengthy : negativeTemplates.short;
    return templates[Math.floor(Math.random() * templates.length)];
    
  } else if (stars === 3) {
    // Neutral/mixed reviews
    const neutralTemplates = {
      short: [
        `Decent place in ${cityName}. Some good aspects, but could improve.`,
        `Average stay in ${location}. Property was okay, nothing special.`,
        `Mixed experience in ${cityName}. Some positives, some negatives.`,
        `Fair property in ${location}. Met basic expectations.`,
        `Okay stay in ${cityName}. Room for improvement but acceptable.`
      ],
      lengthy: [
        `Our stay in ${cityName} was generally okay. The ${propertyType.toLowerCase()} had some positive aspects, but there were also areas that could be improved. The location in ${stateName ? stateName : cityName} was convenient, and the property served its basic purpose. However, we noticed some maintenance issues and the overall experience was just average. It's a decent option if you're looking for something basic in ${location}.`,
        `We had a mixed experience during our visit to ${location}. The ${propertyType.toLowerCase()} had some good qualities - the location in ${cityName} was nice and the property was functional. However, there were also some aspects that could be better, such as cleanliness and maintenance. Overall, it was an acceptable stay but not exceptional. We might consider staying again if improvements are made.`,
        `Our stay in ${cityName} was fairly average. The ${propertyType.toLowerCase()} met our basic needs, and the location in ${stateName ? stateName : cityName} was decent. There were some things we liked about the property, but also some areas that could use improvement. The experience wasn't bad, but it wasn't particularly memorable either. It's a reasonable option for a basic stay in ${location}.`,
        `We had an okay experience in ${location}. The ${propertyType.toLowerCase()} was functional and the location in ${cityName} was convenient. There were some positive aspects to our stay, but we also noticed things that could be better. Overall, it was an average experience - not great, but not terrible either. It served its purpose for our visit to ${stateName ? stateName : cityName}.`
      ]
    };
    const templates = isLengthy ? neutralTemplates.lengthy : neutralTemplates.short;
    return templates[Math.floor(Math.random() * templates.length)];
    
  } else {
    // Positive reviews (4-5 stars)
    const positiveTemplates = {
      short: [
        `Amazing stay in ${cityName}! The ${propertyType.toLowerCase()} was perfect. Highly recommend!`,
        `Wonderful experience in ${location}. Beautiful property and great location.`,
        `Excellent ${propertyType.toLowerCase()} in ${cityName}. Everything was perfect!`,
        `Fantastic stay in ${location}. The property exceeded our expectations.`,
        `Loved our time in ${cityName}! The ${propertyType.toLowerCase()} was wonderful.`,
        `Perfect getaway in ${location}. Beautiful property and amazing location.`,
        `Outstanding stay in ${cityName}. The ${propertyType.toLowerCase()} was exceptional!`,
        `Incredible experience in ${location}. Highly recommend this property!`
      ],
      lengthy: [
        `We had an absolutely amazing stay in ${cityName}! The ${propertyType.toLowerCase()} was everything we hoped for and more. The property was beautifully maintained, clean, and had all the amenities we needed. The location in ${stateName ? stateName : cityName} was perfect - close to local attractions and restaurants, yet peaceful and quiet. The host was responsive and helpful throughout our stay. We would definitely return to this property and highly recommend it to anyone visiting ${location}. This was one of our best vacation experiences!`,
        `Our stay in ${location} was absolutely wonderful! The ${propertyType.toLowerCase()} exceeded all our expectations. From the moment we arrived, we were impressed by the cleanliness, attention to detail, and beautiful decor. The property had everything we needed for a comfortable and enjoyable stay. The location in ${cityName} was ideal - we were able to explore the area easily while having a peaceful retreat to return to. The host was fantastic and made sure we had everything we needed. We can't wait to return to this property in ${stateName ? stateName : cityName}!`,
        `We had an exceptional experience during our stay in ${cityName}! The ${propertyType.toLowerCase()} was stunning and perfectly maintained. Every detail was thoughtfully considered, from the comfortable furnishings to the well-equipped kitchen. The location in ${stateName ? stateName : cityName} was perfect for exploring the area, and we loved being able to come back to such a beautiful and comfortable space. The host was incredibly responsive and helpful. This property made our visit to ${location} truly memorable. We highly recommend it and will definitely be back!`,
        `What an incredible stay we had in ${location}! The ${propertyType.toLowerCase()} was absolutely perfect in every way. The property was immaculate, beautifully decorated, and had all the amenities we could ask for. The location in ${cityName} was ideal - we enjoyed exploring the local area and found great restaurants and attractions nearby. The host was wonderful and went above and beyond to ensure our comfort. Our time in ${stateName ? stateName : cityName} was made even more special by this amazing property. We would give it more than 5 stars if we could!`,
        `We absolutely loved our stay in ${cityName}! The ${propertyType.toLowerCase()} was exceptional and exceeded all our expectations. The property was spotlessly clean, beautifully designed, and had everything we needed for a perfect vacation. The location in ${location} was fantastic - we were close to everything we wanted to see and do. The host was incredibly welcoming and provided excellent recommendations for local dining and activities. This was one of the best properties we've stayed in, and we can't wait to return to ${stateName ? stateName : cityName} and stay here again!`,
        `Our experience in ${location} was absolutely fantastic! The ${propertyType.toLowerCase()} was stunning, well-maintained, and had all the comforts of home. We were impressed by the attention to detail and the beautiful decor throughout the property. The location in ${cityName} was perfect - peaceful yet convenient to local attractions. The host was responsive and helpful, making our stay even more enjoyable. We had an amazing time exploring ${stateName ? stateName : cityName} and this property was the perfect base for our adventures. We highly recommend it to anyone visiting the area!`
      ]
    };
    const templates = isLengthy ? positiveTemplates.lengthy : positiveTemplates.short;
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

/**
 * Extracts property type from spot name
 * @param {string} spotName - Name of the spot
 * @returns {string} - Property type
 */
function extractPropertyType(spotName) {
  if (!spotName) return 'property';
  
  const nameLower = spotName.toLowerCase();
  if (nameLower.includes('beach') || nameLower.includes('coastal')) return 'Beach House';
  if (nameLower.includes('mountain') || nameLower.includes('cabin')) return 'Mountain Cabin';
  if (nameLower.includes('lake')) return 'Lake House';
  if (nameLower.includes('apartment') || nameLower.includes('loft')) return 'Modern Apartment';
  if (nameLower.includes('cottage') || nameLower.includes('charming')) return 'Cozy Cottage';
  if (nameLower.includes('luxury') || nameLower.includes('villa')) return 'Luxury Home';
  return 'property';
}

module.exports = {
  generateReview,
  extractPropertyType
};

