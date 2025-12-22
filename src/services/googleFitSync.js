import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js"; 
import { oauth2Client } from "../googleClient.js";

import { fetchSteps, parseSteps } from "./googleFitSteps.js";
import { fetchSleep, parseSleep } from "./googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "./googleFitWorkouts.js";


export async function syncGoogleFitForAllUsers() {
  const users = await User.find({
    fitnessProvider: "google_fit",
    fitnessConnected: true,
  });

  for (const user of users) {
    try {
      await syncSingleUser(user);
    } catch (err) {
      console.error(`Sync failed for user ${user._id}`, err.message);
    }
  }
}


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


async function fetchAndSaveFitnessData(user) {
  const stepsBuckets = await fetchSteps();
  const sleepBuckets = await fetchSleep();
  const workoutBuckets = await fetchWorkouts();

  const stepsData = parseSteps(stepsBuckets);
  const sleepData = parseSleep(sleepBuckets);
  const workoutData = parseWorkouts(workoutBuckets);

  const date = stepsData.date;

  await FitnessData.findOneAndUpdate(
    {
      userId: user._id,
      provider: "google_fit",
      date
    },
    {
      steps: stepsData.steps,
      sleepHours: sleepData.sleepHours,
      workouts: workoutData.workouts,
      lastSyncTime: new Date()
    },
    { upsert: true, new: true }
  );
}

