const pdfGenerator = require("../services/ai/pdfGenerator");
const Trip = require("../MODELS/Trip");

/**
 * Download PDF from the current session itinerary.
 */
module.exports.downloadPDF = (req, res) => {
  const itinerary = req.session.itinerary;

  if (!itinerary) {
    req.flash("error", "No itinerary found. Please plan a trip first.");
    return res.redirect("/planner");
  }

  try {
    const pdfStream = pdfGenerator.generatePDF(itinerary);
    const filename = pdfGenerator.generateFilename(itinerary);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    pdfStream.pipe(res);
  } catch (error) {
    console.error("[PDFController] Error generating PDF:", error.message);
    req.flash("error", "Unable to generate PDF. Please try again.");
    res.redirect("/planner");
  }
};

/**
 * Download PDF from a saved trip (by trip ID).
 */
module.exports.downloadTripPDF = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      req.flash("error", "Trip not found.");
      return res.redirect("/planner/my-trips");
    }

    if (!trip.user.equals(req.user._id)) {
      req.flash("error", "You don't have permission to download this trip.");
      return res.redirect("/planner/my-trips");
    }

    const pdfStream = pdfGenerator.generatePDF(trip.itinerary);
    const filename = pdfGenerator.generateFilename(trip.itinerary);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    pdfStream.pipe(res);
  } catch (error) {
    console.error("[PDFController] Error generating trip PDF:", error.message);
    req.flash("error", "Unable to generate PDF. Please try again.");
    res.redirect("/planner/my-trips");
  }
};
