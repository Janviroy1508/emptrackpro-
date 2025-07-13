import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { verifyToken } from "@/lib/auth"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    console.log("=== UPLOAD API CALLED ===")

    const user = await verifyToken(request)
    if (!user || user.userType !== "admin") {
      console.log("Unauthorized upload attempt")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get("photo") as unknown as File

    if (!file) {
      console.log("No file in request")
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    console.log("File received:", file.name, file.size, file.type)

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size too large. Max 5MB allowed." }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const filename = `${timestamp}-employee.${fileExtension}`

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads")
    console.log("Uploads directory:", uploadsDir)

    if (!existsSync(uploadsDir)) {
      console.log("Creating uploads directory...")
      await mkdir(uploadsDir, { recursive: true })
    }

    const filePath = join(uploadsDir, filename)
    console.log("Saving file to:", filePath)

    await writeFile(filePath, buffer)
    console.log("File saved successfully!")

    const url = `/uploads/${filename}`
    console.log("File URL:", url)

    return NextResponse.json({
      url,
      message: "File uploaded successfully",
      filename,
      size: file.size,
    })
  } catch (error) {
    console.error("=== UPLOAD ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
