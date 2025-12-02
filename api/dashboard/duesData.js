import { withDB } from "../lib/withDB.js";

export default withDB(async function handler(req, res) {
  try {
    const now = new Date();

    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const tomorrowStart = new Date(todayEnd.getTime() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const day2Start = new Date(tomorrowEnd.getTime() + 1);
    const day2End = new Date(day2Start);
    day2End.setHours(23, 59, 59, 999);

    const members = req.db.collection("members");

    const dueToday = await members
      .find({ renewalDate: { $gte: todayStart, $lte: todayEnd } })
      .sort({ renewalDate: 1 })
      .toArray();

    const dueTomorrow = await members
      .find({
        isActive: true,
        renewalDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      })
      .sort({ renewalDate: 1 })
      .toArray();

    const dueDayAfterTomorrow = await members
      .find({ isActive: true, renewalDate: { $gte: day2Start, $lte: day2End } })
      .sort({ renewalDate: 1 })
      .toArray();

    const overdue = await members
      .find({
        isActive: true,
        renewalDate: { $lt: todayStart },
        paymentStatus: "unpaid",
      })
      .sort({ renewalDate: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      dueTodayCount: dueToday.length,
      dueTomorrowCount: dueTomorrow.length,
      dueDayAfterTomorrowCount: dueDayAfterTomorrow.length,
      overdueCount: overdue.length,
      dueToday,
      dueTomorrow,
      dueDayAfterTomorrow,
      overdue,
    });
  } catch (err) {
    console.error("REMINDERS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
