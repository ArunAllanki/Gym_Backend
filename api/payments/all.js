import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const payments = await req.db
      .collection("payments")
      .find({})
      .sort({ paidDate: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err) {
    console.error("PAYMENTS ALL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
