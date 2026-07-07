const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
    },
    travelers: {
      type: String,
    },
    budget: {
      type: String,
    },
    travelStyle: {
      type: String,
    },
    itinerary: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
