import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: isProd,                 
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


export const registerUser = async (req, res) => {
  try {
    const { uid, email } = req.user;
    
    const {
      name,
      gender,
      dateOfBirth,
      heightCm,
      weightKg,
      dietType,
      goals,
      phone,
      hasMedicalCondition,
      medicalConditions,
      menstrualProfile,
    } = req.body;

    const existingUser = await User.findOne({ firebaseUid: uid });
    if (existingUser) {
      return res.json({ message: "User already registered!" });
    }

    // Build user object safely
    const userPayload = {
      firebaseUid: uid,
      email,
      name,
      gender,
      phone,
      dateOfBirth,
      heightCm,
      weightKg,
      dietType,
      goals,
      hasMedicalCondition: !!hasMedicalCondition,
    };

    if (
      hasMedicalCondition &&
      Array.isArray(medicalConditions) &&
      medicalConditions.length > 0
    ) {
      userPayload.medicalConditions = medicalConditions;
    }

    // Menstrual profile (female only)
    if (
      gender === "female" &&
      menstrualProfile &&
      typeof menstrualProfile === "object"
    ) {
      userPayload.menstrualProfile = {};

      if (menstrualProfile.cycleLengthDays) {
        userPayload.menstrualProfile.cycleLengthDays =
          Number(menstrualProfile.cycleLengthDays);
      }

      if (menstrualProfile.lastPeriodDate) {
        userPayload.menstrualProfile.lastPeriodDate = new Date(
          menstrualProfile.lastPeriodDate
        );
      }

      if (menstrualProfile.phase) {
        userPayload.menstrualProfile.phase = menstrualProfile.phase;
      }
    }

    const user = await User.create(userPayload);

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({ message: "User Registered", user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({ message: "Login Success", user });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
};

