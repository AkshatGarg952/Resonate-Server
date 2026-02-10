import dotenv from 'dotenv';
dotenv.config();

export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.error("ADMIN_EMAIL not set in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }

        if (req.user.email !== adminEmail) {
            console.warn(`Unauthorized admin access attempt by: ${req.user.email}`);
            return res.status(403).json({ message: "Access denied: Admin privileges required" });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
