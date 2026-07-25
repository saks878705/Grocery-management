const Stock = require("../models/sequelize/stock.model");
const Product = require("../models/sequelize/product.model");
const Category = require("../models/sequelize/category.model");
const { sendMail } = require("../utils/mailer");
const { getAdminUsers } = require("../utils/adminUsers.util");
const Notification = require("../models/mongo/notification.model");

const { Op, col } = require("sequelize");

exports.checkLowStockAndNotify = async () => {
  try {
    const lowStockItems = await Stock.findAll({
      where: {
        quantity: {
          [Op.lt]: col("lowStockThreshold"),
        },
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!lowStockItems.length) {
      console.log("No low stock items");
      return;
    }

    const admins = await getAdminUsers();
    const adminEmails = admins.map((a) => a.email);

    const productListHTML = lowStockItems.map((item) => {
      return `
        <li>
          <b>${item.product.name}</b> (${item.product.category.name})
          - Remaining: ${item.quantity}, Threshold: ${item.lowStockThreshold}
        </li>
      `;
    }).join("");

    const html = `
      <h2>Low Stock Alert</h2>
      <p>The following products are running low:</p>
      <ul>${productListHTML}</ul>
    `;

    if (adminEmails.length) {
      try {
        await sendMail({
          to: adminEmails.join(","),
          subject: "Low Stock Alert",
          html,
        });
        console.log("Email sent to admins");
      } catch (mailError) {
        console.error("Failed to send low stock email:", mailError.message);
      }
    }

    const notifications = [];

    for (const admin of admins) {
      for (const item of lowStockItems) {
        notifications.push({
          userId: admin.id,
          type: "LOW_STOCK",
          userType: "ADMIN",
          message: `Low stock: ${item.product.name} (${item.product.category.name}) - Remaining ${item.quantity}`,
        });
      }
    }

    if (notifications.length) {
      await Notification.insertMany(notifications);
      console.log("Notifications stored in MongoDB");
    }

  } catch (error) {
    console.error("Error in low stock job:", error.message);
  }
};
