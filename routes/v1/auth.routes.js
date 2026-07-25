require("dotenv").config();
const express = require("express");
const { body } = require("express-validator");
const passport = require("../../config/passport");
const authController = require("../../controller/auth.controller");
const authService = require("../../service/auth.service");
const LoginActivity = require("../../models/mongo/loginActivity.model");
const { validate } = require("../../middleware/validate.middleware");
const { authLimiter } = require("../../middleware/rateLimit.middleware");

const router = express.Router();

router.post(
    "/signup",
    authLimiter,
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    validate,
    authController.signup
);
router.post(
    "/login",
    authLimiter,
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validate,
    authController.login
);
router.post("/refresh", authController.refresh);
router.post(
    "/forgot-password",
    authLimiter,
    [body("email").isEmail().withMessage("Valid email is required")],
    validate,
    authController.forgotPassword
);
router.post("/reset-password", authController.resetPassword);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        LoginActivity.create({
            userId: req.user.id,
            ip: req.ip,
            device: req.headers["user-agent"],
        }).catch((err) => console.error("Failed to record login activity:", err));

        const { accessToken, refreshToken } = authService.generateTokens(req.user);
        res.json({
            message: "Google login success",
            accessToken,
            refreshToken,
            user: authService.sanitizeUser(req.user),
        });
    }
);

module.exports = router;
