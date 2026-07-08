const Listing = require("../MODELS/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

const getLocationKey = (listingData) => {
  return [listingData.location, listingData.country]
    .filter(Boolean)
    .map((value) => value.trim().toLowerCase())
    .join("|");
};

const getLocationQuery = (listingData) => {
  const location = listingData.location?.trim();
  const country = listingData.country?.trim();

  if (!location) return country || "";
  if (!country) return location;

  return location.toLowerCase().includes(country.toLowerCase())
    ? location
    : `${location}, ${country}`;
};

const getGeometryFromListing = async (listingData) => {
  const locationQuery = getLocationQuery(listingData);

  if (!locationQuery) return null;

  const response = await geocodingClient
    .forwardGeocode({
      query: locationQuery,
      limit: 1,
    })
    .send();

  return response.body.features[0]?.geometry || null;
};

const syncListingGeometry = async (listing) => {
  const currentLocationKey = getLocationKey(listing);
  const needsGeometryRefresh =
    !listing.geometry?.coordinates?.length ||
    listing.mapLocationKey !== currentLocationKey;

  if (!needsGeometryRefresh) return;

  const geometry = await getGeometryFromListing(listing);
  if (geometry) {
    listing.geometry = geometry;
    listing.mapLocationKey = currentLocationKey;
    await listing.save();
  }
};

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  await syncListingGeometry(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  }
  const geometry = await getGeometryFromListing(req.body.listing);
  if (!geometry) {
    req.flash("error", "Could not find this location on the map");
    return res.redirect("/listings/new");
  }
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = geometry;
  newListing.mapLocationKey = getLocationKey(req.body.listing);
  newListing.image = { url, filename };
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  
  // Safe extraction with a fallback string so it never passes a raw un-parseable object
  let originalImageUrl = (listing.image && listing.image.url) ? listing.image.url : "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  }
  
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  const geometry = await getGeometryFromListing(req.body.listing);
  if (geometry) {
    listing.geometry = geometry;
    listing.mapLocationKey = getLocationKey(req.body.listing);
  }
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};


