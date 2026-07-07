const PDFDocument = require("pdfkit");

/**
 * Generates professional travel itinerary PDFs.
 * Adapted from TripMind's PDFService, integrated into WanderLust.
 */
class PDFGenerator {
  constructor() {
    this.currentPage = 1;
  }

  /**
   * Creates a PDF document stream from an itinerary object.
   * @param {Object} itinerary - The itinerary data.
   * @returns {PDFKit.PDFDocument} PDF document stream.
   */
  generatePDF(itinerary) {
    this.currentPage = 1;
    const doc = new PDFDocument({ margin: 50 });

    doc.font("Helvetica").fontSize(12).fillColor("#333333");

    this._writeTitle(doc);
    this._writeTripSummary(doc, itinerary.tripSummary);
    this._writeDestinationOverview(doc, itinerary.destinationOverview);
    this._writeWeatherGuide(doc, itinerary.weatherGuide);
    this._writeDailyPlan(doc, itinerary.dailyPlan);
    this._writeBudgetBreakdown(doc, itinerary.budgetBreakdown);
    this._writeAccommodationSuggestions(doc, itinerary.accommodationSuggestions);
    this._writeTransportationPlan(doc, itinerary.transportationPlan);
    this._writeFoodRecommendations(doc, itinerary.foodRecommendations);
    this._writePackingChecklist(doc, itinerary.packingChecklist);
    this._writeClothingRecommendations(doc, itinerary.clothingRecommendations);
    this._writePhotoSpots(doc, itinerary.photoSpots);
    this._writeHiddenGems(doc, itinerary.hiddenGems);
    this._writeBulletList(doc, "Travel Tips", itinerary.travelTips);
    this._writeBulletList(doc, "Safety Tips", itinerary.safetyTips);
    this._writeEmergencyInformation(doc, itinerary.emergencyInformation);

    doc.end();
    return doc;
  }

  /**
   * Generates a filename for the PDF.
   * @param {Object} itinerary - The itinerary data.
   * @returns {string} Sanitized filename.
   */
  generateFilename(itinerary) {
    const dest = itinerary.tripSummary.destination.replace(/[^a-zA-Z0-9]/g, "-");
    return `WanderLust-${dest}-${itinerary.tripSummary.startDate}.pdf`;
  }

  // -------------------------------------------------------------------------
  // Section Writers
  // -------------------------------------------------------------------------

  _writeTitle(doc) {
    doc.moveDown(1);
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#171412")
      .text("WanderLust AI", { align: "center" });
    doc
      .fontSize(16)
      .text("AI Travel Itinerary", { align: "center" });
    doc.font("Helvetica").fontSize(12).fillColor("#333333");
    doc.moveDown(1.5);
  }

  _writeHeading(doc, title) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#171412")
      .text(title, { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(12).fillColor("#333333");
  }

  _writeTripSummary(doc, tripSummary) {
    this._writeHeading(doc, "Trip Summary");
    doc.text(`Destination: ${tripSummary.destination}`);
    doc.text(`Dates: ${tripSummary.startDate} - ${tripSummary.endDate}`);
    doc.text(`Duration: ${tripSummary.duration} days`);
    doc.text(`Travelers: ${tripSummary.travelers}`);
    doc.text(`Budget: ${tripSummary.budgetTier}`);
    doc.text(`Travel Style: ${tripSummary.travelStyle}`);
    doc.moveDown(0.5);
    doc.text(`Overview: ${tripSummary.overallDescription}`);
    doc.moveDown(1);
  }

  _writeDestinationOverview(doc, overview) {
    this._writeHeading(doc, "Destination Overview");
    doc.text(`Description: ${overview.description}`);
    doc.moveDown(0.3);
    doc.text(`Best Time to Visit: ${overview.bestTimeToVisit}`);
    doc.moveDown(0.3);
    doc.text(`Local Customs: ${overview.localCustoms}`);
    doc.moveDown(1);
  }

  _writeWeatherGuide(doc, weather) {
    this._writeHeading(doc, "Weather Guide");
    doc.text(`Typical Weather: ${weather.typicalWeather}`);
    doc.moveDown(0.3);
    doc.text(`Temperature Range: ${weather.temperatureRange}`);
    doc.moveDown(0.3);
    doc.text(`Precipitation: ${weather.precipitation}`);
    doc.moveDown(0.3);
    doc.text(`Advice: ${weather.advice}`);
    doc.moveDown(1);
  }

  _writeDailyPlan(doc, dailyPlan) {
    this._writeHeading(doc, "Daily Itinerary");
    dailyPlan.forEach((day) => {
      doc.moveDown(0.3);
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(`Day ${day.day}: ${day.date}`);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");

      // Morning
      doc.font("Helvetica-Bold").text("Morning");
      doc.font("Helvetica").text(`Activity: ${day.morning.activity}`);
      doc.text(`Location: ${day.morning.location}`);
      doc.moveDown(0.2);

      // Afternoon
      doc.font("Helvetica-Bold").text("Afternoon");
      doc.font("Helvetica").text(`Activity: ${day.afternoon.activity}`);
      doc.text(`Location: ${day.afternoon.location}`);
      doc.moveDown(0.2);

      // Evening
      doc.font("Helvetica-Bold").text("Evening");
      doc.font("Helvetica").text(`Activity: ${day.evening.activity}`);
      doc.text(`Location: ${day.evening.location}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  _writeBudgetBreakdown(doc, budget) {
    this._writeHeading(doc, "Budget Breakdown");
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1f7a68")
      .text(`Total: ${budget.totalEstimate}`);
    doc.font("Helvetica").fontSize(12).fillColor("#333333");
    doc.moveDown(0.2);
    doc.text(`Accommodation: ${budget.accommodation}`);
    doc.text(`Food: ${budget.food}`);
    doc.text(`Transportation: ${budget.transportation}`);
    doc.text(`Activities: ${budget.activities}`);
    doc.text(`Miscellaneous: ${budget.miscellaneous}`);
    doc.moveDown(1);
  }

  _writeAccommodationSuggestions(doc, accommodations) {
    this._writeHeading(doc, "Accommodation Suggestions");
    accommodations.forEach((acc) => {
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(acc.name);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");
      doc.text(`Location: ${acc.location}`);
      doc.text(`Type: ${acc.type}`);
      doc.text(`Price Range: ${acc.priceRange}`);
      doc.text(`Description: ${acc.description}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  _writeTransportationPlan(doc, transport) {
    this._writeHeading(doc, "Transportation Plan");
    doc.text(`Arrival: ${transport.arrival}`);
    doc.moveDown(0.3);
    doc.text(`Getting Around: ${transport.gettingAround}`);
    doc.moveDown(0.3);
    doc.text(`Departure: ${transport.departure}`);
    doc.moveDown(1);
  }

  _writeFoodRecommendations(doc, food) {
    this._writeHeading(doc, "Food Recommendations");
    doc.text("Must Try Foods:");
    food.mustTry.forEach((item) => {
      doc.text(`- ${item}`);
    });
    doc.moveDown(0.5);
    food.restaurants.forEach((restaurant) => {
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(restaurant.name);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");
      doc.text(`Cuisine: ${restaurant.cuisine}`);
      doc.text(`Location: ${restaurant.location}`);
      doc.text(`Price: ${restaurant.priceRange}`);
      doc.text(`Description: ${restaurant.description}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  _writePackingChecklist(doc, checklist) {
    this._writeHeading(doc, "Packing Checklist");
    const categories = [
      { name: "Clothing", items: checklist.clothing },
      { name: "Toiletries", items: checklist.toiletries },
      { name: "Electronics", items: checklist.electronics },
      { name: "Documents", items: checklist.documents },
      { name: "Miscellaneous", items: checklist.miscellaneous },
    ];
    categories.forEach((category) => {
      doc.moveDown(0.2);
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(category.name);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");
      category.items.forEach((item) => {
        doc.text(`- ${item}`);
      });
      doc.moveDown(0.2);
    });
    doc.moveDown(1);
  }

  _writeClothingRecommendations(doc, clothing) {
    this._writeHeading(doc, "Clothing Recommendations");
    doc.text(`Daywear: ${clothing.daywear}`);
    doc.moveDown(0.3);
    doc.text(`Eveningwear: ${clothing.eveningwear}`);
    doc.moveDown(0.3);
    doc.text(`Footwear: ${clothing.footwear}`);
    doc.moveDown(1);
  }

  _writePhotoSpots(doc, spots) {
    this._writeHeading(doc, "Photo Spots");
    spots.forEach((spot) => {
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(spot.name);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");
      doc.text(`Location: ${spot.location}`);
      doc.text(`Best Time: ${spot.bestTime}`);
      doc.text(`Description: ${spot.description}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  _writeHiddenGems(doc, gems) {
    this._writeHeading(doc, "Hidden Gems");
    gems.forEach((gem) => {
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#171412")
        .text(gem.name);
      doc.font("Helvetica").fontSize(12).fillColor("#333333");
      doc.text(`Location: ${gem.location}`);
      doc.text(`Description: ${gem.description}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  _writeBulletList(doc, title, items) {
    this._writeHeading(doc, title);
    items.forEach((item) => {
      doc.text(`- ${item}`);
    });
    doc.moveDown(1);
  }

  _writeEmergencyInformation(doc, emergency) {
    this._writeHeading(doc, "Emergency Information");
    doc.text(`Police: ${emergency.police}`);
    doc.text(`Ambulance: ${emergency.ambulance}`);
    doc.text(`Fire: ${emergency.fire}`);
    doc.text(`Embassy: ${emergency.embassy}`);
    doc.text("Local Emergency Contacts:");
    emergency.localEmergencyContacts.forEach((contact) => {
      doc.text(`- ${contact}`);
    });
  }
}

module.exports = new PDFGenerator();
