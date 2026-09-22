import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../api/_lib/db.js";
import { hashPassword } from "../api/_lib/auth.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

async function main() {
  await connectDB();

  const seedProducts = [
    // smartphone
    { name: "Nova X12", category: "smartphone", price: 24999, description: "A well-rounded everyday smartphone.", specs: { screenSize: "6.5\"", ram: "8GB", storage: "128GB", camera: "50MP", battery: "5000mAh" } },
    { name: "Pixel Edge 5G", category: "smartphone", price: 34999, description: "Flagship performance with a smooth 120Hz display.", specs: { screenSize: "6.7\"", ram: "12GB", storage: "256GB", camera: "64MP", battery: "5200mAh" } },
    { name: "Orion Lite", category: "smartphone", price: 14999, description: "Budget-friendly smartphone for daily use.", specs: { screenSize: "6.1\"", ram: "6GB", storage: "128GB", camera: "48MP", battery: "4800mAh" } },
    // tv
    { name: "Clarity 43 Smart TV", category: "tv", price: 27999, description: "Crisp Full HD smart display for compact living rooms.", specs: { screenSize: "43\"", resolution: "1920x1080", refreshRate: "60Hz", smartTV: "Yes" } },
    { name: "Clarity 55 UHD TV", category: "tv", price: 44999, description: "4K UHD television with built-in streaming apps.", specs: { screenSize: "55\"", resolution: "3840x2160", refreshRate: "60Hz", smartTV: "Yes" } },
    { name: "Clarity 65 Pro TV", category: "tv", price: 69999, description: "Large-format 4K TV with a 120Hz panel for smooth motion.", specs: { screenSize: "65\"", resolution: "3840x2160", refreshRate: "120Hz", smartTV: "Yes" } },
    // mobile_accessory
    { name: "SnapFit Phone Case", category: "mobile_accessory", price: 499, description: "Shock-absorbing case with a matte finish.", specs: { type: "Case", compatibility: "Universal 6.1\"-6.7\"", color: "Black" } },
    { name: "FastCharge 33W Adapter", category: "mobile_accessory", price: 999, description: "Compact fast charger for quick top-ups.", specs: { type: "Charger", compatibility: "USB-C phones", color: "White" } },
    { name: "ClearSound Earphones", category: "mobile_accessory", price: 1499, description: "Wired in-ear earphones with balanced sound.", specs: { type: "Earphones", compatibility: "3.5mm / USB-C", color: "Black" } },
    // common_accessory
    { name: "PowerBank 10000mAh", category: "common_accessory", price: 1299, description: "Slim portable battery pack for phones and small devices.", specs: { type: "Power bank", compatibility: "Universal", color: "Grey" } },
    { name: "Braided USB-C Cable", category: "common_accessory", price: 349, description: "Durable braided charging and data cable.", specs: { type: "Cable", compatibility: "Universal", color: "Black" } },
    { name: "Universal Remote", category: "common_accessory", price: 799, description: "Programmable remote that works across most TV brands.", specs: { type: "Remote", compatibility: "Universal", color: "Black" } },
    // tv_accessory: deliberately left empty — no products seeded, mirrors the
    // organic-store-wp site's empty-category edge case (Herbal Teas).
  ];

  for (const product of seedProducts) {
    await Product.findOneAndUpdate(
      { name: product.name },
      { $set: product },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`Upserted product: ${product.name}`);
  }

  const seedUserMobile = "9999900001";
  const seedUserPassword = "Test@1234";
  const existing = await User.findOne({ mobile: seedUserMobile });
  if (!existing) {
    await User.create({
      mobile: seedUserMobile,
      passwordHash: await hashPassword(seedUserPassword),
      firstName: "Test",
      lastName: "User",
    });
    console.log(`Created seed user: ${seedUserMobile} / ${seedUserPassword}`);
  } else {
    console.log(`Seed user already exists: ${seedUserMobile}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
