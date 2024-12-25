/* eslint-disable node/no-extraneous-require */
const passport = require("passport");
const config = require("../../../../config/config");
const UserModel = require("../../user/user.model");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientID,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackURL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // console.log("done", done);

        const { name, email, picture } = done._json;

        // Check if the user already exists in the database
        const existUser = await UserModel.findOne({ email });

        if (existUser) {
          return done(null, existUser);
        } else {
          // Create a new user in the database
          const newUser = new UserModel({
            fullname: name,
            email,
            image: picture,
            provider: profile.provider,
            password: email,
          });

          const savedUser = await newUser.save();
          return done(null, savedUser);
        }
      } catch (error) {
        console.error(`Error: ${error}`);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
