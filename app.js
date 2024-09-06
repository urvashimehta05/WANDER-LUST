
const express = require("express");
const app = express();
const Listing = require("./models/listing.js");
app.set('layout', 'layouts/boilerplate');
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
const Review = require("./models/review.js");
const mongoose = require("mongoose");
app.use(express.static('public'));
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
app.use('/uploads', express.static('uploads'));
const methodOverride = require("method-override");
const { listingSchema, reviewSchema } = require('./schema.js');
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderLust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});
// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (result.error) {
//     throw new ExpressError(400, error.details.map(el => el.message).join(', '))
//   }
//   else {
//     next();
//   }
// }
app.get("/user/login", (req, res) => {
  res.render("users/login.ejs");
});
app.post('/user/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Username: ${username}, Password: ${password}`);
  res.send('Form submitted successfully');
});
app.get("/user/signup", (req,res)=>{
  res.render("users/signup.ejs");
})
//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/show", { listing })
}));
  
//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const { comments, rating } = req.body.review;

  let newReview = new Review({ comments, rating });
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  console.log("New review saved");
  res.redirect(`/listings/${listing._id}`);
}));
app.delete("/listing/:id/reviews/:reviewId",
  wrapAsync(async (req,res)=>{
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findById(reviewId);
    res.redirect(`/listings/${id}`);
  })
)

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });/*
app.all("*", (req, res, next)=>{
next(new ExpressError(404, "Page not found!"));
})
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(3000, () => {
  console.log("server is listening to port 8080");
});
