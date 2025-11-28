import { withDB } from "../lib/withDB.js";
import { verifyToken } from "../lib/auth.js";

export default withDB(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = verifyToken(req, res);
    if (!user) return;

    const { memberId, isActive } = req.body;

    if (!memberId || typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "memberId and isActive boolean required" });
    }

    await req.db
      .collection("members")
      .updateOne({ memberId }, { $set: { isActive } });

    return res.status(200).json({
      success: true,
      message: `Member updated → ${isActive ? "Active" : "Inactive"}`,
    });
  } catch (err) {
    console.error("TOGGLE ACTIVE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
