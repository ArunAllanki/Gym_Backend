import clientPromise from "../lib/db.js";
import { verifyPassword } from "../lib/hash.js";
import { signToken } from "../lib/jwt.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const client = await clientPromise;
    const masterDB = client.db("global_master_db");

    const gym = await masterDB.collection("gyms").findOne({ email });

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const isValid = await verifyPassword(password, gym.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      ownerId: gym._id,
      gymId: gym.gymId,
      databaseName: gym.databaseName,
      email: gym.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      gym: {
        gymId: gym.gymId,
        gymName: gym.gymName,
        databaseName: gym.databaseName,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}
