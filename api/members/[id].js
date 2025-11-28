import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  const { id } = req.query;

  try {
    const member = await req.db
      .collection("members")
      .findOne({ memberId: id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).json({
      success: true,
      member
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
