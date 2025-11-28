import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));

    const payments = await req.db
      .collection("payments")
      .find({ paidDate: { $gte: start, $lte: end } })
      .sort({ paidDate: -1 })
      .toArray();

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      totalAmount,
      count: payments.length,
      payments,
    });
  } catch (err) {
    console.error("PAYMENTS TODAY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
