require("dotenv").config();
const express = require("express");
const passport = require("../../config/passport");
const authController = require("../../controller/auth.controller");

const router = express.Router();

// Normal Auth
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        res.json({ message: "Google login success", user: req.user });
    }
);

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",
    passport.authenticate("github", { session: false }),
    (req, res) => {
        res.json({ message: "GitHub login success", user: req.user });
    }
);

module.exports = router;
