import { oauth2Client } from "../googleClient.js";
import { User } from "../models/User.js";
import express from 'express';
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { fetchSteps, parseSteps } from "../services/googleFitSteps.js";
import { fetchSleep, parseSleep } from "../services/googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "../services/googleFitWorkouts.js";

import { FitnessData } from "../models/FitnessData.js"; 


const router = express.Router();

router.get("/google", isAuthenticated, (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read"
    ],
    prompt: "consent",
    
    state: req.user.firebaseUid
  });
  
  res.redirect(url);
});


router.get("/google/callback", async (req, res) => {
  const { code, state: firebaseUid } = req.query;

  
    if (!code || !firebaseUid) {
      return res.status(400).send("Invalid OAuth callback");
    }
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(401).send("User not found");
    }

  user.googleFit = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date
  };

  await user.save();
  
  user.fitnessProvider = "google_fit";
  user.fitnessConnected = true;

  const stepBuckets = await fetchSteps(tokens.access_token);
  const stepsHistory  = parseSteps(stepBuckets);

  const sleepBuckets = await fetchSleep(tokens.access_token);
  const sleepHistory  = parseSleep(sleepBuckets);

  const workoutBuckets = await fetchWorkouts(tokens.access_token);
  const workoutHistory  = parseWorkouts(workoutBuckets);
  

    await FitnessData.findOneAndUpdate(
  {
    userId: user._id,
    provider: "google_fit"
  },
  {
    $set: {
      stepsHistory,
      sleepHistory,
      workoutHistory,
      lastSyncTime: new Date()
    }
  },
  {
    upsert: true,
    new: true
  }
);
  
  res.send("Google Fit connected successfully");
});

export default router;
