import clientPromise from "../lib/db.js";
import { hashPassword } from "../lib/hash.js";
import { v4 as uuid } from "uuid";

function gymNameToDbName(gymName) {
  return (
    gymName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_") + "_db"
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;

    const { gymName, ownerName, email, password } = req.body;

    if (!gymName || !ownerName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const masterDB = client.db("global_master_db");

    // check email unique
    const existing = await masterDB.collection("gyms").findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // generate db name FROM gym name
    let dbName = gymNameToDbName(gymName);

    // ensure unique (if gym with same name exists)
    const existingDB = await masterDB
      .collection("gyms")
      .findOne({ databaseName: dbName });
    if (existingDB) {
      dbName = dbName + "_" + uuid().slice(0, 4); // append small ID
    }

    const gymId = "gym_" + uuid().replace(/-/g, "").slice(0, 8);

    // create DB + collections
    const gymDB = client.db(dbName);

    await gymDB.createCollection("members");
    await gymDB.createCollection("payments");
    await gymDB.createCollection("logs");
    await gymDB.createCollection("settings");

    await gymDB.collection("settings").insertOne({
      gymName,
      ownerName,
      reminderConfig: {
        beforeDays: 2,
        sendOverdueReminder: true,
      },
      createdAt: new Date(),
    });

    const hashed = await hashPassword(password);

    await masterDB.collection("gyms").insertOne({
      gymId,
      gymName,
      ownerName,
      email,
      passwordHash: hashed,
      databaseName: dbName,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Gym created",
      gymId,
      databaseName: dbName,
    });
  } catch (err) {
    console.error("ADD GYM ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
