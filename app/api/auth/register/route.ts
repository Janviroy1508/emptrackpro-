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
      // 🔒 ADMIN RESTRICTION: Check current admin count
      const adminCount = await Admin.countDocuments()
      console.log(`Current admin count: ${adminCount}`)

      if (adminCount >= 2) {
        return NextResponse.json(
          {
            message: "⚠️ Maximum admin limit reached! Only 2 admins are allowed in this system.",
            currentAdmins: adminCount,
            maxAllowed: 2,
          },
          { status: 403 },
        )
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email })
      if (existingAdmin) {
        return NextResponse.json({ message: "Admin with this email already exists" }, { status: 400 })
      }

      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 12)
      const admin = new Admin({
        email,
        password: hashedPassword,
      })
      await admin.save()

      const newAdminCount = await Admin.countDocuments()
      console.log(`New admin created. Total admins: ${newAdminCount}`)

      return NextResponse.json({
        message: "✅ Admin registration successful!",
        totalAdmins: newAdminCount,
        remainingSlots: 2 - newAdminCount,
      })
    } else {
      // Employee registration (unchanged)
      const existingEmployee = await Employee.findOne({ email })

      if (!existingEmployee) {
        return NextResponse.json(
          {
            message: "Email not found. Please contact admin to add your email first.",
          },
          { status: 400 },
        )
      }

      if (existingEmployee.password) {
        return NextResponse.json(
          {
            message: "Employee already registered. Please login instead.",
          },
          { status: 400 },
        )
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      await Employee.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true })

      return NextResponse.json({ message: "Employee registration successful" })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
