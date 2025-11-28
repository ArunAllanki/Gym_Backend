import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  const members = await req.db.collection("members").find().toArray();

  return res.status(200).json({
    success: true,
    count: members.length,
    gymInfo: req.gymInfo,
  });
});
