import { User } from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });

    if (!user) return res.status(404).json({ message: "User not found" });
    
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, gender, age, height, weight, dietType, goals, hasMedicalCondition, medicalConditions} = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { name, gender, age, height, weight, dietType, goals, hasMedicalCondition, medicalConditions },
      { new: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
