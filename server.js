require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/mongo");
const { sequelize } = require("./models/sequelize");
const startStockAlertJob = require("./jobs/stockAlert.job");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // DB Connections
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
    // for syncing models with the database if there are any changes.
    await sequelize.sync({ alter: true });
    // await sequelize.sync();

    await connectMongo();

    // Start Cron Job
    startStockAlertJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup Error:", error);
    process.exit(1);
  }
};

startServer();