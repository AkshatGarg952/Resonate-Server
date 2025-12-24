import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper to generate a long-lived token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const { age, weight, goal, phone } = req.body;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        phone,
        age,
        weight,
        goals: goal,
      });

      // 3. Generate YOUR OWN token
      const token = generateToken(user._id);

      // 4. Set cookie with YOUR token, not Firebase's
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "User Registered", user });
    }

    // 🛑 Logic Gap: If user exists, you returned JSON but DID NOT set the cookie.
    // Usually, you want to log them in even if they hit register again.
    // If you don't do this, a user who tries to register twice won't get logged in the second time.
    
    const token = generateToken(user._id);
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.json({ message: "User already registered, logged in successfully", user });

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

    // 5. Same fix here: Use your own long-lived token
    const token = generateToken(user._id);

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    
    return res.json({ message: "Login Success", user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};


// import { User } from "../models/User.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { uid, email, name } = req.user;
//     const { age, weight, goal, phone } = req.body;  

//     let user = await User.findOne({ firebaseUid: uid });
    
//     if (!user) {
//       user = await User.create({
//         firebaseUid: uid,
//         email,
//         name,
//         phone,
//         age,
//         weight,
//         goals:goal
//       });

//       res.cookie("firebaseToken", req.idToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });

//       return res.json({ message: "User Registered", user });
//     }
    
//     return res.json({ message: "User already registered!"});
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { uid } = req.user;
//     const user = await User.findOne({ firebaseUid: uid });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//     res.cookie("firebaseToken", req.idToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });
//     return res.json({ message: "Login Success", user });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };





