import { withDB } from "../../lib/withDB.js";

const PLAN_DURATION = {
  monthly: 30,
  quarterly: 90,
  halfYearly: 180,
  yearly: 365,
};

export default withDB(async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const member = await req.db.collection("members").findOne({ memberId: id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const today = new Date();
    const newRenewal = new Date(today);
    newRenewal.setDate(today.getDate() + PLAN_DURATION[member.planType]);

    const paymentRecord = {
      date: today,
      amount: member.amount,
    };

    await req.db.collection("members").updateOne(
      { memberId: id },
      {
        $set: {
          lastPaidDate: today,
          renewalDate: newRenewal,
          paymentStatus: "paid",
          updatedAt: new Date(),
        },
        $push: { paymentHistory: paymentRecord },
      }
    );

    await req.db.collection("payments").insertOne({
      memberId: member.memberId,
      name: member.name,
      amount: member.amount,
      paidDate: today,
      renewalDate: newRenewal,
    });

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
