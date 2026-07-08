if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./MODELS/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const aiRouter = require("./routes/ai.js");
const pagesRouter = require("./routes/pages.js");

// ================= DB URL =================
const dbUrl =
  process.env.ATLASDB_URL ||
  "mongodb://127.0.0.1:27017/wanderlust";

// ================= DB CONNECT =================
// ================= DB CONNECT =================
async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
    // Removed the automated dropping loop-breaker line completely!
  } catch (err) {
    console.log("DB connection error:", err);
  }
}
connectDB();

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.disable('view cache');

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION STORE =================
// ================= SESSION STORE =================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  // Removing the strict crypto block avoids the complex 32-byte key hashing rule,
  // while letting connect-mongo handle your session strings perfectly.
  touchAfter: 24 * 3600,
  stringify: true
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

// ================= SESSION OPTIONS =================
const sessionOptions = {
  store: store,
  secret: "abcdefghijklmnopqrstuvwxyz123456", // <-- Hardcode this string here too!
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT CONFIG (ONLY ONCE) =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success") || "";
  res.locals.error = req.flash("error") || "";
  next();
});

// ================= LOCALS =================
// Make sure this sits AFTER your app.use(passport.session()) configuration


// ================= ROUTES =================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/planner", aiRouter);
app.use("/", pagesRouter);
app.use("/", userRouter);

// ================= 404 =================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR HANDLER =================
// app.use((err, req, res, next) => {
//   const statusCode =
//     err.statusCode && Number.isInteger(err.statusCode)
//       ? err.statusCode
//       : 500;

//   res.status(statusCode).render("error.ejs", {
//     message: err.message || "Something went wrong",
//   });
// });

app.use((err, req, res, next) => {
  console.error("========= ERROR =========");
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).render("error.ejs", {
    message: err.message || "Something went wrong",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
