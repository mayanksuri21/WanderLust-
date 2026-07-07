const Listing = require("../MODELS/listing");
const aiGateway = require("../services/ai/aiGateway");
const { buildPrompt, parseResponse, validateItinerary } = require("../services/ai/promptBuilder");

/**
 * Render the AI planner form.
 */
module.exports.renderPlanner = (req, res) => {
  res.render("ai/planner");
};

/**
 * Handle planner form submission: build prompt, call AI, parse and validate response.
 * Also queries for matching WanderLust listings to show as "Recommended Stays".
 */
module.exports.generateItinerary = async (req, res) => {
  try {
    const formData = req.body;

    // Step 1: Build prompt
    const prompt = buildPrompt(formData);

    // Step 2: Call AI
    const rawResponse = await aiGateway.generateItinerary(prompt);

    // Step 3: Parse response
    const parsed = parseResponse(rawResponse);

    // Step 4: Validate
    const itinerary = validateItinerary(parsed);

    // Store in session for PDF download
    req.session.itinerary = itinerary;
    req.session.plannerFormData = formData;

    // Step 5: Find recommended stays matching the destination
    let recommendedStays = [];
    try {
      const destination = itinerary.tripSummary.destination || "";
      // Extract words from destination to match against location/country
      const searchTerms = destination
        .split(/[,\s]+/)
        .filter((t) => t.length > 2);

      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map((term) => ({
          $or: [
            { location: { $regex: term, $options: "i" } },
            { country: { $regex: term, $options: "i" } },
          ],
        }));

        recommendedStays = await Listing.find({ $or: orConditions }).limit(6);
      }
    } catch (listingErr) {
      console.error("[PlannerController] Error fetching recommended stays:", listingErr.message);
      // Non-fatal: continue without recommendations
    }

    res.render("ai/result", { itinerary, recommendedStays });
  } catch (error) {
    console.error("[PlannerController] Error generating itinerary:", error.message);
    req.flash("error", error.message || "Something went wrong while generating your itinerary. Please try again.");
    res.redirect("/planner");
  }
};
