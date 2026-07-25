const { Issue } = require("../models/sequelize");
const Notification = require("../models/mongo/notification.model");
const { getAdminUsers } = require("../utils/adminUsers.util");

exports.createIssue = async (userId, { orderId, description }) => {
    if (!description) throw new Error("Description is required");

    const issue = await Issue.create({ userId, orderId, description });

    const admins = await getAdminUsers();
    if (admins.length) {
        await Notification.insertMany(admins.map((admin) => ({
            userId: admin.id,
            type: "ISSUE",
            userType: "ADMIN",
            message: `New issue reported on order ${orderId || "N/A"}: ${description}`,
        })));
    }

    return issue;
};

exports.getAllIssues = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await Issue.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
    });

    return {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        data: rows,
    };
};

exports.getUserIssues = async (userId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await Issue.findAndCountAll({
        where: { userId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
    });

    return {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        data: rows,
    };
};

exports.updateIssueStatus = async (id, status) => {
    const allowed = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    if (!allowed.includes(status)) throw new Error("Invalid status");

    const issue = await Issue.findByPk(id);
    if (!issue) throw new Error("Issue not found");

    issue.status = status;
    await issue.save();

    return issue;
};
