import { WaterIntake } from "../models/WaterIntake.js";

const getTodayDate = () =>
  new Date().toISOString().split("T")[0];


export const getTodayWaterIntake = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    const date = getTodayDate();

    let intake = await WaterIntake.findOne({ userId, date });

    if (!intake) {
      intake = await WaterIntake.create({ userId, date });
    }

    res.json(intake);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch water intake" });
  }
};


export const addWaterEntry = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    const { amountMl } = req.body;

    if (!amountMl || amountMl <= 0) {
      return res.status(400).json({ message: "Invalid water amount" });
    }

    const date = getTodayDate();

    const intake = await WaterIntake.findOneAndUpdate(
      { userId, date },
      {
        $inc: { consumedMl: amountMl },
        $push: { entries: { amountMl } },
      },
      { upsert: true, new: true }
    );

    res.status(201).json(intake);
  } catch (err) {
    res.status(500).json({ message: "Failed to log water intake" });
  }
};


export const updateWaterGoal = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    const { goalMl } = req.body;

    if (!goalMl || goalMl < 500) {
      return res.status(400).json({ message: "Invalid goal" });
    }

    const date = getTodayDate();

    const intake = await WaterIntake.findOneAndUpdate(
      { userId, date },
      { goalMl },
      { upsert: true, new: true }
    );

    res.json(intake);
  } catch (err) {
    res.status(500).json({ message: "Failed to update goal" });
  }
};
