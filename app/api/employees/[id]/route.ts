import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Employee from "@/models/Employee"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const employee = await Employee.findById(params.id).select("-password")

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Employees can only view their own profile
    if (user.userType === "employee" && user.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Get employee error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const updateData = await request.json()

    const employee = await Employee.findByIdAndUpdate(params.id, updateData, { new: true }).select("-password")

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee updated successfully", employee })
  } catch (error) {
    console.error("Update employee error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const employee = await Employee.findByIdAndDelete(params.id)

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Delete employee error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
