import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({
                    error: "Authentication required. Invalid or missing token.",
                });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired." });
        }
        return res.status(401).json({ error: "Invalid token." });
    }
};

export default authMiddleware;
