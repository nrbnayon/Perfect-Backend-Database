/* eslint-disable node/no-extraneous-require */
const express = require("express");
const passport = require("passport");
const router = express.Router();

//   for google authentication using O auth2.0 with passport js
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/error",
    failureMessage: true,
  }),
  function (req, res) {
    //failure message
   
    // Successful authentication, redirect success.
    // res.redirect(
    //   "https://traveller-system-mern-eta.vercel.app/verification-success/" //demo url like frontend url
    // );
  }
);

// Route that logs out the authenticated user
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error while destroying session:", err);
    } else {
      req.logout(() => {
        // console.log("You are logged out");
        res.redirect("/home");
      });
    }
  });
});

router.get("/success", function (req, res) {
  // Successful authentication, redirect success.
  // console.log("success", { req: req.user, res: res.user });
});

router.get("/error", function (req, res) {
  // error in authentication, redirect success.
  console.log("error", { req, res });
});

const googleauthRouter = router;

module.exports = googleauthRouter;
