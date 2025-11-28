import clientPromise from "./db.js";
import { verifyToken } from "./jwt.js";

export function withDB(handler) {
  return async (req, res) => {
    try {
      const auth = req.headers.authorization;

      if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No authorization token" });
      }

      const token = auth.split(" ")[1];
      const decoded = verifyToken(token);

      const client = await clientPromise;

      // choose correct DB based on databaseName from JWT
      req.db = client.db(decoded.databaseName);
      req.gymInfo = decoded;

      return handler(req, res);

    } catch (err) {
      console.error("AUTH ERROR:", err);
      return res.status(401).json({ message: "Invalid token", error: err.message });
    }
  };
}
