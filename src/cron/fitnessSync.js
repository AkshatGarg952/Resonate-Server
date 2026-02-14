import cron from "node-cron";
import { syncGoogleFitForAllUsers, pushDailyFitnessSummary } from "../services/googleFitSync.js";
import { User } from "../models/User.js";

let isRunning = false;

export function startFitnessSync() {
  // Run at 11:55 PM every day
  cron.schedule("55 23 * * *", async () => {
    if (isRunning) {
      console.warn("Fitness sync already running, skipping...");
      return;
    }

    isRunning = true;
    console.log("Starting Google Fit daily sync & memory push");

    try {
      // 1. Sync latest data from Google Fit
      await syncGoogleFitForAllUsers();

      // 2. Push daily summary to Memory
      const users = await User.find({
        fitnessProvider: "google_fit",
        fitnessConnected: true,
      }).select('_id firebaseUid');

      console.log(`Pushing daily summaries for ${users.length} users`);

      for (const user of users) {
        await pushDailyFitnessSummary(user._id, user.firebaseUid);
      }

      console.log("Google Fit sync & memory push completed");
    } catch (err) {
      console.error("Global fitness sync failed", err);
    } finally {
      isRunning = false;
    }
  });
}
