import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Sweet from "../models/Sweet.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sweetshop";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    // Create admin user
    const adminEmail = "admin@example.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash("admin123", 10);
      admin = new User({
        username: "admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });
      await admin.save();
      console.log("Created admin user: admin@example.com / admin123");
    } else {
      console.log("Admin user already exists");
    }

    // Seed sample sweets
    const samples = [
      {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.5,
        quantity: 100,
      },
      { name: "Gummy Bears", category: "Gummies", price: 1.75, quantity: 200 },
      { name: "Lollipop", category: "Hard Candy", price: 0.5, quantity: 150 },
    ];

    for (const s of samples) {
      const exists = await Sweet.findOne({ name: s.name });
      if (!exists) {
        await Sweet.create(s);
        console.log("Added sample sweet:", s.name);
      }
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
}

run();
