const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const plannerController = require("../controllers/plannerController");
const tripController = require("../controllers/tripController");
const pdfController = require("../controllers/pdfController");

// ── Planner ────────────────────────────────────────────────────────
router.get("/", plannerController.renderPlanner);
router.post("/", wrapAsync(plannerController.generateItinerary));

// ── PDF Download (from session) ────────────────────────────────────
router.get("/download", pdfController.downloadPDF);

// ── Save Trip (requires login) ─────────────────────────────────────
router.post("/save", isLoggedIn, wrapAsync(tripController.saveTrip));

// ── My Trips (requires login) ──────────────────────────────────────
router.get("/my-trips", isLoggedIn, wrapAsync(tripController.listTrips));
router.get("/my-trips/:id", isLoggedIn, wrapAsync(tripController.viewTrip));
router.delete("/my-trips/:id", isLoggedIn, wrapAsync(tripController.deleteTrip));
router.get("/my-trips/:id/download", isLoggedIn, wrapAsync(pdfController.downloadTripPDF));

module.exports = router;
