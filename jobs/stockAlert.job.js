const cron = require("node-cron");
const { checkLowStockAndNotify } = require("../service/stockAlert.service");

const startStockAlertJob = () => {
  cron.schedule("0 0 * * *", async () => { // every day at 12:00 AM
    console.log("Running Low Stock Check...");
    await checkLowStockAndNotify();
  });
};

module.exports = startStockAlertJob;