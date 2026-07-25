const issueService = require("../service/issue.service");

exports.create = async (req, res) => {
    try {
        const issue = await issueService.createIssue(req.user.id, req.body);
        res.status(201).json(issue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const data = req.user.role === "ADMIN"
            ? await issueService.getAllIssues(req.query)
            : await issueService.getUserIssues(req.user.id, req.query);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const issue = await issueService.updateIssueStatus(req.params.id, req.body.status);
        res.json(issue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
