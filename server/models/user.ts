import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import type { User as UserType } from "~/types/auth";

export interface IUserDocument extends Document, Omit<UserType, "id"> {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    default: "",
  },
  is_staff: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
