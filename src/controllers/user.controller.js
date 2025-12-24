import { User } from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });
    
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      gender,
      age,
      height,
      weight,
      dietType,
      goals,
      hasMedicalCondition,
      medicalConditions,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        gender,
        age,
        height,
        weight,
        dietType,
        goals,
        hasMedicalCondition,
        medicalConditions,
      },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
