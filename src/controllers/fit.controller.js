import { oauth2Client } from "../googleClient.js";
import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js";

import { fetchSteps, parseSteps } from "../services/googleFitSteps.js";
import { fetchSleep, parseSleep } from "../services/googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "../services/googleFitWorkouts.js";

/**
 * Redirect user to Google Fit OAuth consent screen
 */
export const redirectToGoogleFit = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
    ],
    prompt: "consent",
    state: req.user.firebaseUid,
  });

  res.redirect(url);
};

/**
 * Handle Google Fit OAuth callback
 */
export const handleGoogleFitCallback = async (req, res) => {
  try {
    const { code, state: firebaseUid } = req.query;

    if (!code || !firebaseUid) {
      return res.status(400).send("Invalid OAuth callback");
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Find user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(401).send("User not found");
    }

    // Save Google Fit credentials
    user.googleFit = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
    user.fitnessProvider = "google_fit";
    user.fitnessConnected = true;

    await user.save();

    // Fetch + parse fitness data
    const stepBuckets = await fetchSteps(tokens.access_token);
    const stepsHistory = parseSteps(stepBuckets);

    const sleepBuckets = await fetchSleep(tokens.access_token);
    const sleepHistory = parseSleep(sleepBuckets);

    const workoutBuckets = await fetchWorkouts(tokens.access_token);
    const workoutHistory = parseWorkouts(workoutBuckets);

    // Store in FitnessData
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
      {
        upsert: true,
        new: true,
      }
    );

    // res.send("Google Fit connected successfully");
    return res.redirect(
      `${process.env.CLIENT_URL}/dashboard`
    );
  } catch (error) {
    console.error("Google Fit OAuth error:", error);
    res.status(500).send("Failed to connect Google Fit");
  }
};

export const getGoogleFitData = async(req, res) => {

    try{
        if (!req.user) return res.status(404).json({ message: "User not found" });

        const userId = req.user._id;

        const fitness = await FitnessData.findOne( 
            { userId, provider: "google_fit" },
            {
                _id: 0,
                stepsHistory: 1,
                sleepHistory: 1,
                workoutHistory: 1,
                lastSyncTime: 1
            }
        );

        console.log(fitness);
        return res.json(fitness);
    }

    catch(error){
        return res.status(500).json({ error: error.message });
    }
}
