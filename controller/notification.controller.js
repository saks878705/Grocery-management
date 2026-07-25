const notificationService = require("../service/notification.service");

exports.getAll = async (req, res) => {
    try {
        const data = await notificationService.getUserNotifications(req.user.id, req.query);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        res.json(notification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
