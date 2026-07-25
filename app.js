const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const bodyParser = require("body-parser");
const categoryRoutes = require("./routes/v1/catagory.routes");
const authRoutes = require("./routes/v1/auth.routes");
const productRoutes = require("./routes/v1/product.routes");
const stockRoutes = require("./routes/v1/stock.routes");
const orderRoutes = require("./routes/v1/order.routes");
const issueRoutes = require("./routes/v1/issue.routes");
const notificationRoutes = require("./routes/v1/notification.routes");
const analyticsRoutes = require("./routes/v1/analytics.routes");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(compression());

// Request Body Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Routes placeholder
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/stocks", stockRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;