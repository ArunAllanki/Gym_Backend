import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const year = new Date().getFullYear();

    const payments = await req.db
      .collection("payments")
      .aggregate([
        {
          $match: {
            paidDate: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$paidDate" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.month": 1 },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      year,
      data: payments,
    });
  } catch (err) {
    console.error("PAYMENTS MONTHLY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
