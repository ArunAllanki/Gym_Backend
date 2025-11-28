import { withDB } from "../lib/withDB.js";
import { v4 as uuid } from "uuid";

const PLAN_DURATION = {
  monthly: 30,
  quarterly: 90,
  halfYearly: 180,
  yearly: 365,
};

export default withDB(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, phone, planType, startDate, amount, notes } = req.body;

    if (!name || !phone || !planType || !startDate || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const memberId = uuid();

    const start = new Date(startDate);
    const renewalDate = new Date(start);
    renewalDate.setDate(start.getDate() + PLAN_DURATION[planType]);

    const newMember = {
      memberId,
      name,
      phone,
      planType,
      startDate: start,
      renewalDate,
      lastPaidDate: start,
      amount,
      paymentStatus: "paid",
      notes: notes || "",
      isActive: true,
      paymentHistory: [
        {
          date: start,
          amount,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await req.db.collection("members").insertOne(newMember);

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: newMember,
    });
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});
