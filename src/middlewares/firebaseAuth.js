import admin from "firebase-admin";
import fs from "fs";
import { getStorage } from "firebase-admin/storage"; 


const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-adminsdk.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "resonate-client.appspot.com", 
});


export const storage = getStorage().bucket("gs://resonate-client.appspot.com");



export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};
