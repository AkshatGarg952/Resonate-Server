import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    console.log("Reached the middleware!");
    const token = req.cookies.authToken;
    
    if (!token){
        console.log("token nahi hai");
        return res.status(401).json({ message: "Login first" });
    }
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "Session expired" });
  }
};