const { User } = require("../models/sequelize");

exports.getAdminUsers = () =>
  User.findAll({ where: { role: "ADMIN" }, attributes: ["id", "email"] });
