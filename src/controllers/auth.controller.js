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
    const { uid, email, name } = req.user;
    const { age, weight, goal, phone } = req.body;

    const existingUser = await User.findOne({ firebaseUid: uid });
    if (existingUser) {
      return res.json({ message: "User already registered!" });
    }

    const user = await User.create({
      firebaseUid: uid,
      email,
      name,
      phone,
      age,
      weight,
      goals: goal,
    });

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
