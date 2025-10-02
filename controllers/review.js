const Review = require("../MODELS/review.js");
const Listing = require("../MODELS/listing.js");

module.exports.createReview = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success"," New Review Created!");

    res.redirect(`/listings/${listing._id}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error saving review");
  }
};

module.exports.destroyReview = async (req,res)=>{
  let {id , reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // JO BHI REVIEW REVIEWID SE MATCH HOGA VO DELETE HOJAYEGA
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted!");
  res.redirect(`/listings/${id}`);
};