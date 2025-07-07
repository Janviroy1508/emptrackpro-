import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/Admin"
import Employee from "@/models/Employee"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, userType } = await request.json()

    let user
    if (userType === "admin") {
      user = await Admin.findOne({ email })
      if (!user) {
        return NextResponse.json({ message: "Admin not found" }, { status: 401 })
      }
    } else {
      user = await Employee.findOne({ email })
      if (!user) {
        return NextResponse.json(
          { message: "Employee not found. Contact admin to add your email first." },
          { status: 401 },
        )
      }

      // Check if employee has registered (has password)
      if (!user.password) {
        return NextResponse.json({ message: "Please register first before logging in." }, { status: 401 })
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user._id, userType, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    return NextResponse.json({
      token,
      userType,
      userId: user._id,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}