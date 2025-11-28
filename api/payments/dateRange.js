import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ message: "from and to dates required" });
    }

    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const payments = await req.db
      .collection("payments")
      .find({
        paidDate: { $gte: start, $lte: end },
      })
      .sort({ paidDate: -1 })
      .toArray();

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      from,
      to,
      count: payments.length,
      totalAmount,
      payments,
    });
  } catch (err) {
    console.error("PAYMENTS RANGE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
