const Stock = require("../models/sequelize/stock.model");
const Product = require("../models/sequelize/product.model");
const Category = require("../models/sequelize/category.model");
const User = require("../models/sequelize/user.model");
const { sendMail } = require("../utils/mailer");
const Notification = require("../models/mongo/notification.model"); // 👈 adjust path

const { Op, col } = require("sequelize");

exports.checkLowStockAndNotify = async () => {
  try {
    // 🔍 Find low stock products
    const lowStockItems = await Stock.findAll({
      where: {
        quantity: {
          [Op.lt]: col("threshold"),
        },
      },
      include: [
        {
          model: Product,
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!lowStockItems.length) {
      console.log("  No low stock items");
      return;
    }

    // 📧 Get all admins
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "email"],
    });

    const adminEmails = admins.map((a) => a.email);

    // 🧾 Prepare message content
    const productListText = lowStockItems.map((item) => {
      return `${item.Product.name} (${item.Product.Category.name}) → Remaining: ${item.quantity}, Threshold: ${item.threshold}`;
    });

    const productListHTML = lowStockItems.map((item) => {
      return `
        <li>
          <b>${item.Product.name}</b> (${item.Product.Category.name}) 
          → Remaining: ${item.quantity}, Threshold: ${item.threshold}
        </li>
      `;
    }).join("");

    const html = `
      <h2>⚠️ Low Stock Alert</h2>
      <p>The following products are running low:</p>
      <ul>${productListHTML}</ul>
    `;

    // 📤 Send email
    await sendMail({
      to: adminEmails.join(","),
      subject: "Low Stock Alert",
      html,
    });

    console.log("📧 Email sent to admins");

    // 🗄️ CREATE NOTIFICATIONS IN MONGODB
    const notifications = [];

    for (const admin of admins) {
      for (const item of lowStockItems) {
        notifications.push({
          userId: admin.id,
          type: "LOW_STOCK",
          userType: "ADMIN",
          message: `Low stock: ${item.Product.name} (${item.Product.Category.name}) - Remaining ${item.quantity}`,
        });
      }
    }

    // 🔥 Bulk insert (optimized)
    await Notification.insertMany(notifications);

    console.log("🔔 Notifications stored in MongoDB");

  } catch (error) {
    console.error("❌ Error in low stock job:", error.message);
  }
};