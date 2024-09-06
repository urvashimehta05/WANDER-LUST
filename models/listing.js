const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: String,
   },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
});
// listingSchema.post("")
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
