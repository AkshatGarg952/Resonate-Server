// services/googleFitSync.js
import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js";
import { oauth2Client } from "../googleClient.js";

import { fetchSteps, parseSteps } from "./googleFitSteps.js";
import { fetchSleep, parseSleep } from "./googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "./googleFitWorkouts.js";

// 🔥 IMPORT NORMALIZERS
import {
  normalizeLast7Days,
  normalizeWorkoutLast7Days,
} from "../utils/normalizeLast7Days.js";

/* ------------------ ENTRY ------------------ */

export async function syncGoogleFitForAllUsers() {
  const users = await User.find({
    fitnessProvider: "google_fit",
    fitnessConnected: true,
  });

  for (const user of users) {
    try {
      await syncSingleUser(user);
    } catch (err) {
      console.error(`❌ Sync failed for user ${user._id}`, err.message);
    }
  }
}

/* ------------------ PER USER ------------------ */

async function syncSingleUser(user) {
  oauth2Client.setCredentials({
    access_token: user.googleFit.accessToken,
    refresh_token: user.googleFit.refreshToken,
    expiry_date: user.googleFit.expiryDate,
  });

  // 🔁 Refresh token if expired
  if (Date.now() >= user.googleFit.expiryDate) {
    const { credentials } = await oauth2Client.refreshAccessToken();

    oauth2Client.setCredentials(credentials);

    user.googleFit.accessToken = credentials.access_token;
    user.googleFit.expiryDate = credentials.expiry_date;

    await user.save();
  }

  await fetchAndSaveFitnessData(user);
}

/* ------------------ CORE ------------------ */

async function fetchAndSaveFitnessData(user) {
  // 1️⃣ Fetch raw data
  const stepsBuckets = await fetchSteps();
  const sleepBuckets = await fetchSleep();
  const workoutBuckets = await fetchWorkouts();

  // 2️⃣ Parse raw data
  const parsedSteps = parseSteps(stepsBuckets);
  const parsedSleep = parseSleep(sleepBuckets);
  const parsedWorkouts = parseWorkouts(workoutBuckets);

  // 3️⃣ 🔥 NORMALIZE TO EXACT 7 DAYS
  const stepsHistory = normalizeLast7Days(parsedSteps, "steps");
  const sleepHistory = normalizeLast7Days(parsedSleep, "sleepHours");
  const workoutHistory = normalizeWorkoutLast7Days(parsedWorkouts);

  // 4️⃣ Save
  await FitnessData.findOneAndUpdate(
    {
      userId: user._id,
      provider: "google_fit",
    },
    {
      $set: {
        stepsHistory,
        sleepHistory,
        workoutHistory,
        lastSyncTime: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  console.log("Job Completed!");
}
