const authService = require("../service/auth.service");

exports.signup = async (req, res) => {
    try {
        if(!req.body){
            return res.status(400).json({
                message:"Request body is required",
            })
        }
        const response = await authService.signup(req.body);
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        if(!req.body.email || !req.body.password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const tokens = await authService.login(req.body, {
            ip: req.ip,
            device: req.headers["user-agent"],
        });
        res.json(tokens);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        if(!req.body.refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        const tokens = await authService.refreshToken(req.body.refreshToken);
        res.json(tokens);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const token = await authService.generateResetToken(req.body.email);
        res.json({ message: "Reset token generated", token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body.token, req.body.password);
        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
