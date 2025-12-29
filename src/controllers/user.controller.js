import { User } from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

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
      dateOfBirth,
      heightCm,
      weightKg,
      dietType,
      goals,
      hasMedicalCondition,
      medicalConditions,
      menstrualProfile,
    } = req.body;

    // Build update object safely
    const updatePayload = {
      name,
      gender,
      dietType,
      goals,
      hasMedicalCondition: !!hasMedicalCondition,
    };

    if (dateOfBirth) {
      updatePayload.dateOfBirth = new Date(dateOfBirth);
    }

    if (heightCm !== undefined) {
      updatePayload.heightCm = heightCm;
    }

    if (weightKg !== undefined) {
      updatePayload.weightKg = weightKg;
    }

    if (hasMedicalCondition) {
      updatePayload.medicalConditions = Array.isArray(medicalConditions)
        ? medicalConditions
        : [];
    } else {
      updatePayload.medicalConditions = [];
    }

    // Female-only menstrual profile
    if (
      gender === "female" &&
      menstrualProfile &&
      typeof menstrualProfile === "object"
    ) {
      updatePayload.menstrualProfile = {};

      if (menstrualProfile.cycleLengthDays) {
        updatePayload.menstrualProfile.cycleLengthDays =
          Number(menstrualProfile.cycleLengthDays);
      }

      if (menstrualProfile.lastPeriodDate) {
        updatePayload.menstrualProfile.lastPeriodDate = new Date(
          menstrualProfile.lastPeriodDate
        );
      }

      if (menstrualProfile.phase) {
        updatePayload.menstrualProfile.phase = menstrualProfile.phase;
      }
    }

    // If gender changed away from female → remove menstrual data
    if (gender && gender !== "female") {
      updatePayload.menstrualProfile = undefined;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatePayload,
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
