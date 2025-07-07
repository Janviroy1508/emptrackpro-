import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/Admin"
import Employee from "@/models/Employee"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, userType } = await request.json()

    if (userType === "admin") {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email })
      if (existingAdmin) {
        return NextResponse.json({ message: "Admin already exists" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const admin = new Admin({
        email,
        password: hashedPassword,
      })
      await admin.save()

      return NextResponse.json({ message: "Admin registration successful" })
    } else {
      // Employee registration
      // Check if employee exists and doesn't have password yet
      const existingEmployee = await Employee.findOne({ email })

      if (!existingEmployee) {
        return NextResponse.json(
          {
            message: "Email not found. Please contact admin to add your email first.",
          },
          { status: 400 },
        )
      }

      // Check if employee already has password (already registered)
      if (existingEmployee.password) {
        return NextResponse.json(
          {
            message: "Employee already registered. Please login instead.",
          },
          { status: 400 },
        )
      }

      // Update existing employee record with password
      const hashedPassword = await bcrypt.hash(password, 12)
      await Employee.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true })

      return NextResponse.json({ message: "Employee registration successful" })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}