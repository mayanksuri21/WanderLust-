const Trip = require("../MODELS/Trip");

/**
 * Save the current session itinerary as a Trip for the logged-in user.
 */
module.exports.saveTrip = async (req, res) => {
  const { itinerary, plannerFormData } = req.session;

  if (!itinerary) {
    req.flash("error", "No itinerary to save. Please generate one first.");
    return res.redirect("/planner");
  }

  try {
    const trip = new Trip({
      user: req.user._id,
      destination: itinerary.tripSummary.destination,
      country: itinerary.destinationOverview?.description?.match(
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/
      )?.[0] || "",
      startDate: itinerary.tripSummary.startDate,
      endDate: itinerary.tripSummary.endDate,
      duration: itinerary.tripSummary.duration,
      travelers: itinerary.tripSummary.travelers,
      budget: itinerary.tripSummary.budgetTier,
      travelStyle: itinerary.tripSummary.travelStyle,
      itinerary,
    });

    await trip.save();
    req.flash("success", "Trip saved successfully!");
    res.redirect("/planner/my-trips");
  } catch (error) {
    console.error("[TripController] Error saving trip:", error.message);
    req.flash("error", "Unable to save trip. Please try again.");
    res.redirect("/planner");
  }
};

/**
 * List all saved trips for the logged-in user with optional search and sort.
 */
module.exports.listTrips = async (req, res) => {
  try {
    const { q, sort } = req.query;
    const filter = { user: req.user._id };

    // Search by destination
    if (q && q.trim()) {
      filter.destination = { $regex: q.trim(), $options: "i" };
    }

    // Sort: newest (default) or oldest
    const sortOrder = sort === "oldest" ? 1 : -1;

    const trips = await Trip.find(filter)
      .sort({ createdAt: sortOrder })
      .lean();

    res.render("ai/savedTrips", { trips, query: q || "", currentSort: sort || "newest" });
  } catch (error) {
    console.error("[TripController] Error listing trips:", error.message);
    req.flash("error", "Unable to load your trips. Please try again.");
    res.redirect("/listings");
  }
};

/**
 * View a single saved trip.
 */
module.exports.viewTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      req.flash("error", "Trip not found.");
      return res.redirect("/planner/my-trips");
    }

    // Verify ownership
    if (!trip.user.equals(req.user._id)) {
      req.flash("error", "You don't have permission to view this trip.");
      return res.redirect("/planner/my-trips");
    }

    res.render("ai/viewTrip", { trip, itinerary: trip.itinerary });
  } catch (error) {
    console.error("[TripController] Error viewing trip:", error.message);
    req.flash("error", "Unable to load trip. Please try again.");
    res.redirect("/planner/my-trips");
  }
};

/**
 * Delete a saved trip.
 */
module.exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      req.flash("error", "Trip not found.");
      return res.redirect("/planner/my-trips");
    }

    // Verify ownership
    if (!trip.user.equals(req.user._id)) {
      req.flash("error", "You don't have permission to delete this trip.");
      return res.redirect("/planner/my-trips");
    }

    await Trip.findByIdAndDelete(req.params.id);
    req.flash("success", "Trip deleted successfully.");
    res.redirect("/planner/my-trips");
  } catch (error) {
    console.error("[TripController] Error deleting trip:", error.message);
    req.flash("error", "Unable to delete trip. Please try again.");
    res.redirect("/planner/my-trips");
  }
};
