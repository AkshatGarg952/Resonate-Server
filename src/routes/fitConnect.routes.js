import { oauth2Client } from "../googleClient.js";
import express from 'express';

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
  
  console.log(tokens);
  
  res.send("Google Fit connected successfully");
});

export default router;
