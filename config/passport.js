const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/sequelize");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ where: { email: profile.emails[0].value } });

    if (!user) {
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "oauth",
        });
    }

    done(null, user);
}));

module.exports = passport;
