const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const plannerController = require("../controllers/plannerController");
const tripController = require("../controllers/tripController");
const pdfController = require("../controllers/pdfController");

// ── Planner ────────────────────────────────────────────────────────
router.get("/", plannerController.renderPlanner);
router.post("/", plannerController.generateItinerary);

// ── PDF Download (from session) ────────────────────────────────────
router.get("/download", pdfController.downloadPDF);

// ── Save Trip (requires login) ─────────────────────────────────────
router.post("/save", isLoggedIn, tripController.saveTrip);

// ── My Trips (requires login) ──────────────────────────────────────
router.get("/my-trips", isLoggedIn, tripController.listTrips);
router.get("/my-trips/:id", isLoggedIn, tripController.viewTrip);
router.delete("/my-trips/:id", isLoggedIn, tripController.deleteTrip);
router.get("/my-trips/:id/download", isLoggedIn, pdfController.downloadTripPDF);

module.exports = router;
