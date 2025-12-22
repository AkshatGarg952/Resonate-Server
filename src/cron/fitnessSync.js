import cron from "node-cron";
import { syncGoogleFitForAllUsers } from "../services/googleFitSync.js";

export function startFitnessSync() {
  cron.schedule("0 6,18 * * *", async () => {
    console.log("⏳ Running fitness auto-sync...");
    await syncGoogleFitForAllUsers();
  });
}
