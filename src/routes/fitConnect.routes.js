import { oauth2Client } from "../googleClient.js";
import express from 'express';
import { fetchSteps, parseSteps } from "../services/googleFitSteps.js";
import { fetchSleep, parseSleep } from "../services/googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "../services/googleFitWorkouts.js";



const router = express.Router();

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read"
    ],
    prompt: "consent"
  });

  res.redirect(url);
});


router.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const stepBuckets = await fetchSteps(tokens.access_token);
  const stepsData = parseSteps(stepBuckets);

  console.log("Steps", stepsData);

  const sleepBuckets = await fetchSleep(tokens.access_token);
  const sleepData = parseSleep(sleepBuckets);

  console.log("Sleep", sleepData);

  const workoutBuckets = await fetchWorkouts(tokens.access_token);
  const workoutData = parseWorkouts(workoutBuckets);
  
  console.log("Workouts", workoutData);
  console.log(tokens);
  
  res.send("Google Fit connected successfully");
});

export default router;
