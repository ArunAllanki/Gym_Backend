import { withDB } from "../../lib/withDB.js";

export default withDB(async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const updates = req.body;

    updates.updatedAt = new Date();

    await req.db
      .collection("members")
      .updateOne({ memberId: id }, { $set: updates });

    return res.status(200).json({
      success: true,
      message: "Member updated",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
