import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js";
import { oauth2Client } from "../googleClient.js";

import { fetchSteps, parseSteps } from "./googleFitSteps.js";
import { fetchSleep, parseSleep } from "./googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "./googleFitWorkouts.js";

import {
  normalizeLast7Days,
  normalizeWorkoutLast7Days,
} from "../utils/normalizeLast7Days.js";

/* ------------------ ENTRY ------------------ */

export async function syncGoogleFitForAllUsers() {
  const users = await User.find({
    fitnessProvider: "google_fit",
    fitnessConnected: true,
  }).lean();

  console.log(`👥 Syncing ${users.length} Google Fit users`);

  for (const user of users) {
    await syncUserSafely(user);
  }
}

/* ------------------ SAFE PER USER ------------------ */

async function syncUserSafely(user) {
  try {
    await syncSingleUser(user);
    console.log(`✅ Synced user ${user._id}`);
  } catch (err) {
    console.error(`❌ User ${user._id} sync failed:`, err.message);
  }
}


async function syncSingleUser(user) {
  oauth2Client.setCredentials({
    access_token: user.googleFit.accessToken,
    refresh_token: user.googleFit.refreshToken,
    expiry_date: user.googleFit.expiryDate,
  });

  // 🔁 Refresh token safely
  if (Date.now() >= user.googleFit.expiryDate - 60_000) {
    const { credentials } = await oauth2Client.refreshAccessToken();

    oauth2Client.setCredentials(credentials);

    await User.updateOne(
      { _id: user._id },
      {
        "googleFit.accessToken": credentials.access_token,
        "googleFit.expiryDate": credentials.expiry_date,
      }
    );
  }

  await fetchAndSaveFitnessData(user);
}


async function fetchAndSaveFitnessData(user) {
  const [stepsBuckets, sleepBuckets, workoutBuckets] =
    await Promise.allSettled([
      fetchSteps(),
      fetchSleep(),
      fetchWorkouts(),
    ]);

  const parsedSteps =
    stepsBuckets.status === "fulfilled"
      ? parseSteps(stepsBuckets.value)
      : [];

  const parsedSleep =
    sleepBuckets.status === "fulfilled"
      ? parseSleep(sleepBuckets.value)
      : [];

  const parsedWorkouts =
    workoutBuckets.status === "fulfilled"
      ? parseWorkouts(workoutBuckets.value)
      : [];

  const stepsHistory = normalizeLast7Days(parsedSteps, "steps");
  const sleepHistory = normalizeLast7Days(parsedSleep, "sleepHours");
  const workoutHistory = normalizeWorkoutLast7Days(parsedWorkouts);

  await FitnessData.updateOne(
    { userId: user._id, provider: "google_fit" },
    {
      $set: {
        stepsHistory,
        sleepHistory,
        workoutHistory,
        lastSyncTime: new Date(),
      },
    },
    { upsert: true }
  );
}
