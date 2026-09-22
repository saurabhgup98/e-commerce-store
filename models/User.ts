import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default models.User || model("User", userSchema);
