import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const members = await req.db
      .collection("members")
      .find({})
      .sort({ renewalDate: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
