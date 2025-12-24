import cron from "node-cron";
import { syncGoogleFitForAllUsers } from "../services/googleFitSync.js";

export function startFitnessSync() {
  console.log("doing the job!");
  cron.schedule("* * * * *", async () => {
    console.log("Running fitness auto-sync...");
    await syncGoogleFitForAllUsers();
  });
}
