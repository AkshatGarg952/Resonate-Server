import { User } from "../models/User.js";
import { MemoryService } from "../services/memory.service.js";

const memoryService = new MemoryService();

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

export const getMemories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { category } = req.query;

    // Map client categories to Mem0 specific categories
    const categoryMap = {
      'workout': 'fitness.training',
      'diet': 'nutrition.intake',
      'health': 'diagnostics.blood', // Defaulting to blood for now, could be improved
      'recovery': 'recovery.sleep',
      // 'gym' -> 'fitness.training' ?
    };

    const mappedCategory = categoryMap[category] || category;

    console.log(`[getMemories] Fetching memories for user ${req.user.firebaseUid}. Category: ${category} -> ${mappedCategory}`);

    const memories = await memoryService.getAllMemories(req.user.firebaseUid, { category: mappedCategory });

    return res.json(memories);
  } catch (error) {
    console.error("Get Memories Error:", error);
    return res.status(500).json({ message: "Failed to fetch memories" });
  }
};
