const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { User } = require("../models/sequelize");
const LoginActivity = require("../models/mongo/loginActivity.model");

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    user.save();
    return { accessToken, refreshToken };
};

exports.generateTokens = generateTokens;

exports.sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

exports.signup = async (data) => {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new Error("User already exists");

    const user = await User.create(data);
    return { message: "User created successfully", data: exports.sanitizeUser(user) };
};

exports.login = async ({ email, password }, meta = {}) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    LoginActivity.create({ userId: user.id, ip: meta.ip, device: meta.device })
        .catch((err) => console.error("Failed to record login activity:", err));

    const tokens = generateTokens(user);
    return { ...tokens, user: exports.sanitizeUser(user) };
};

exports.refreshToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) throw new Error("Invalid refresh token");

    return generateTokens(user);
};

exports.generateResetToken = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;

    await user.save();

    return resetToken;
};

exports.resetPassword = async (token, newPassword) => {
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpiry < Date.now()) {
        throw new Error("Invalid or expired token");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();
};
