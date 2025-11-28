import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const now = new Date();

    // Day boundaries for accurate calendar grouping
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const tomorrowStart = new Date(todayEnd.getTime() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const day2Start = new Date(tomorrowEnd.getTime() + 1);
    const day2End = new Date(day2Start);
    day2End.setHours(23, 59, 59, 999);

    const members = req.db.collection("members");

    const totalMembers = await members.countDocuments({});
    const dueToday = await members.countDocuments({
      renewalDate: { $gte: todayStart, $lte: todayEnd },
    });
    const dueTomorrow = await members.countDocuments({
      renewalDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
    });
    const dueDayAfterTomorrow = await members.countDocuments({
      renewalDate: { $gte: day2Start, $lte: day2End },
    });
    const overdue = await members.countDocuments({
      renewalDate: { $lt: todayStart },
      paymentStatus: "unpaid",
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalMembers,
        dueToday,
        dueTomorrow,
        dueDayAfterTomorrow,
        overdue,
      },
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
