const express = require("express");
const userRouter = require("../app/modules/user/user.router");

const router = express.Router();

// Add this route to show a "Server is running" message on the root URL
router.get("/", (req, res) => {
  res.send("🎉Boom Server is running! 🔥");
});

// Define other routes
const routes = [
  {
    path: "/user",
    route: userRouter,
  },
];

// Register the routes
routes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
