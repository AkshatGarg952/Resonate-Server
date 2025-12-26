import cron from "node-cron";
import { syncGoogleFitForAllUsers } from "../services/googleFitSync.js";

let isRunning = false;

export function startFitnessSync() {
  cron.schedule("0 2 * * *", async () => {
    if (isRunning) {
      console.warn("⚠️ Fitness sync already running, skipping...");
      return;
    }

    isRunning = true;
    console.log("🚀 Starting Google Fit daily sync");

    try {
      await syncGoogleFitForAllUsers();
      console.log("✅ Google Fit sync completed");
    } catch (err) {
      console.error("❌ Global fitness sync failed", err);
    } finally {
      isRunning = false;
    }
  });
}
