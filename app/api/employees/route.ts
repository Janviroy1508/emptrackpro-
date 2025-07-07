import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Employee from "@/models/Employee"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const employees = await Employee.find({}).select("-password")

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Get employees error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const employeeData = await request.json()

    const employee = new Employee(employeeData)
    await employee.save()

    return NextResponse.json({ message: "Employee added successfully", employee })
  } catch (error) {
    console.error("Add employee error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
