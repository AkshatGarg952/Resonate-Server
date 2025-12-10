import { User } from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const { age, weight, goal, phone } = req.body;  
    console.log(req.user)

    let user = await User.findOne({ firebaseUid: uid });
  
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        phone,
        age,
        weight,
        goals:goal
      });

      return res.json({ message: "User Registered", user });
    }

    return res.json({ message: "User already registered!"});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    console.log(user)
    if (!user) {
      console.log("hhh")
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Login Success", user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
