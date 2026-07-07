/**
 * Prompt Builder for AI Itinerary Generation
 * Combines system prompt, JSON schema, and user form data into a single prompt.
 */

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are WanderLust AI, a professional AI travel consultant.

Your responsibilities:
- Generate realistic, practical travel itineraries
- Recommend practical, enjoyable activities
- Suggest authentic local cuisine
- Estimate realistic budgets appropriate for the chosen tier
- Recommend suitable accommodations
- Recommend practical transportation options
- Suggest essential packing items
- Include important safety tips
- Include accurate weather guidance
- Include hidden gems
- Include photography spots

Rules you MUST follow:
- Never invent information if uncertain
- Prefer well-known attractions
- Ensure travel time between activities is realistic
- Ensure attractions are open during suggested times
- Generate exactly the same number of itinerary days as requested
- Return ONLY valid, properly formatted JSON
- Never use Markdown formatting
- Never explain your reasoning
- Strictly follow the provided JSON schema
- Ensure all dates and times are realistic
- Ensure all budget estimates are reasonable for the destination and budget tier
- Ensure all recommendations are appropriate for the number of travelers and travel style`;

// ---------------------------------------------------------------------------
// Itinerary JSON Schema
// ---------------------------------------------------------------------------
const ITINERARY_SCHEMA = {
  tripSummary: {
    destination: "string",
    startDate: "string",
    endDate: "string",
    duration: "number",
    travelers: "string",
    budgetTier: "string",
    travelStyle: "string",
    overallDescription: "string",
  },
  destinationOverview: {
    description: "string",
    bestTimeToVisit: "string",
    localCustoms: "string",
  },
  weatherGuide: {
    typicalWeather: "string",
    temperatureRange: "string",
    precipitation: "string",
    advice: "string",
  },
  dailyPlan: [
    {
      day: "number",
      date: "string",
      morning: {
        activity: "string",
        location: "string",
        duration: "string",
        description: "string",
      },
      afternoon: {
        activity: "string",
        location: "string",
        duration: "string",
        description: "string",
      },
      evening: {
        activity: "string",
        location: "string",
        duration: "string",
        description: "string",
      },
    },
  ],
  budgetBreakdown: {
    totalEstimate: "string",
    currency: "string",
    accommodation: "string",
    food: "string",
    transportation: "string",
    activities: "string",
    miscellaneous: "string",
  },
  accommodationSuggestions: [
    {
      name: "string",
      type: "string",
      location: "string",
      priceRange: "string",
      description: "string",
    },
  ],
  transportationPlan: {
    arrival: "string",
    gettingAround: "string",
    departure: "string",
  },
  foodRecommendations: {
    mustTry: ["string"],
    restaurants: [
      {
        name: "string",
        cuisine: "string",
        priceRange: "string",
        location: "string",
        description: "string",
      },
    ],
  },
  packingChecklist: {
    clothing: ["string"],
    toiletries: ["string"],
    electronics: ["string"],
    documents: ["string"],
    miscellaneous: ["string"],
  },
  clothingRecommendations: {
    daywear: "string",
    eveningwear: "string",
    footwear: "string",
  },
  photoSpots: [
    {
      name: "string",
      location: "string",
      bestTime: "string",
      description: "string",
    },
  ],
  hiddenGems: [
    {
      name: "string",
      location: "string",
      description: "string",
    },
  ],
  travelTips: ["string"],
  safetyTips: ["string"],
  emergencyInformation: {
    police: "string",
    ambulance: "string",
    fire: "string",
    embassy: "string",
    localEmergencyContacts: ["string"],
  },
};

// ---------------------------------------------------------------------------
// Required keys for validation
// ---------------------------------------------------------------------------
const REQUIRED_KEYS = Object.keys(ITINERARY_SCHEMA);
const ARRAY_KEYS = ["dailyPlan", "travelTips", "safetyTips"];

// ---------------------------------------------------------------------------
// Build Prompt
// ---------------------------------------------------------------------------

/**
 * Builds a complete prompt string from user form data.
 * @param {Object} formData - User inputs from the planner form.
 * @returns {string} Complete prompt for the AI.
 */
function buildPrompt(formData) {
  const {
    destination,
    startDate,
    duration,
    budget,
    travelers,
    travelStyle,
    interests = [],
    accommodation,
    transportation,
    food,
    specialRequests,
  } = formData;

  // Calculate end date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + parseInt(duration));
  const endDate = end.toISOString().split("T")[0];

  // Build user input section
  let userInput = `DESTINATION: ${destination}
TRAVEL DATES: ${startDate} to ${endDate}
DURATION: ${duration} days
BUDGET: ${budget}
TRAVELERS: ${travelers}
TRAVEL STYLE: ${travelStyle}
INTERESTS: ${interests.length > 0 ? (Array.isArray(interests) ? interests.join(", ") : interests) : "No specific interests"}
ACCOMMODATION: ${accommodation}
TRANSPORTATION: ${transportation}
FOOD: ${food}`;

  if (specialRequests && specialRequests.trim()) {
    userInput += `\nSPECIAL REQUESTS: ${specialRequests}`;
  }

  const schemaString = JSON.stringify(ITINERARY_SCHEMA, null, 2);

  const fullPrompt = `${SYSTEM_PROMPT}

${userInput}

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${duration} days of daily plans
- Return ONLY valid JSON matching the schema below
- No extra text, explanations, or Markdown

RESPONSE SCHEMA:
${schemaString}`;

  return fullPrompt;
}

// ---------------------------------------------------------------------------
// Parse AI Response
// ---------------------------------------------------------------------------

/**
 * Cleans and parses the raw AI response into a JSON object.
 * @param {string} rawResponse - Raw text from the AI.
 * @returns {Object} Parsed JSON object.
 */
function parseResponse(rawResponse) {
  if (!rawResponse || rawResponse.trim() === "") {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  let cleaned = rawResponse;

  // Remove Markdown code fences
  const codeFenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = cleaned.match(codeFenceRegex);
  if (match && match[1]) {
    cleaned = match[1];
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response could not be parsed. Please try again.");
  }
}

// ---------------------------------------------------------------------------
// Validate Itinerary
// ---------------------------------------------------------------------------

/**
 * Validates that the parsed itinerary contains all required keys.
 * @param {Object} itinerary - Parsed itinerary object.
 * @returns {Object} The validated itinerary.
 */
function validateItinerary(itinerary) {
  for (const key of REQUIRED_KEYS) {
    if (!(key in itinerary)) {
      throw new Error(`AI response is missing required section: "${key}". Please try again.`);
    }
  }

  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(itinerary[key])) {
      throw new Error(`AI response has invalid format for "${key}". Please try again.`);
    }
  }

  return itinerary;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
module.exports = {
  buildPrompt,
  parseResponse,
  validateItinerary,
};
