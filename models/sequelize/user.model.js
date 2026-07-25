const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("ADMIN", "CUSTOMER"), defaultValue: "CUSTOMER" },
    refreshToken: { type: DataTypes.STRING },
    accessToken: { type: DataTypes.STRING },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
        },
    }
});

module.exports = User;