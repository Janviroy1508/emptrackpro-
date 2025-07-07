import mongoose from "mongoose"

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      // Not required initially - set when employee registers
    },
    phone: {
      type: String,
      required: true,
    },
    alternatePhone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    dateOfJoining: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    experience: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    designation: {
      type: String,
    },
    address: {
      type: String,
    },
    photo: {
      type: String, // URL to uploaded photo
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema)
