const jwt = require("jsonwebtoken");
const { User } = require("../models/sequelize");

//   AUTH PROTECT MIDDLEWARE
exports.protect = async (req, res, next) => {
    try {
        let token;

        // 🔐 Extract token
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, token missing" });
        }

        // 🔍 Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 👤 Check user exists
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // 🚀 Attach user to request
        req.user = {
            id: user.id,
            role: user.role
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied (Admin only)" });
    }
    next();
};