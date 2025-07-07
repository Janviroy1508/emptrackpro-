"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Employee {
  _id: string
  name: string
  email: string
  phone: string
  alternatePhone?: string
  dateOfBirth: string
  dateOfJoining: string
  bloodGroup: string
  experience: string
  gender: string
  designation: string
  address: string
  photo?: string
}

export default function EditEmployee({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    dateOfBirth: "",
    dateOfJoining: "",
    bloodGroup: "",
    experience: "",
    gender: "",
    designation: "",
    address: "",
    photo: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "admin") {
      router.push("/")
      return
    }

    fetchEmployee()
  }, [params.id, router])

  const fetchEmployee = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/employees/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const employee: Employee = await response.json()
        setFormData({
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          alternatePhone: employee.alternatePhone || "",
          dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
          dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split("T")[0] : "",
          bloodGroup: employee.bloodGroup || "",
          experience: employee.experience || "",
          gender: employee.gender || "",
          designation: employee.designation || "",
          address: employee.address || "",
          photo: employee.photo || "",
        })
        setPhotoPreview(employee.photo || "")
      } else {
        alert("Failed to fetch employee details")
      }
    } catch (error) {
      alert("Error fetching employee details")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview("")
    setFormData((prev) => ({ ...prev, photo: "" }))
  }

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return formData.photo

    const formDataUpload = new FormData()
    formDataUpload.append("photo", photoFile)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        throw new Error("Photo upload failed")
      }
    } catch (error) {
      console.error("Photo upload error:", error)
      return formData.photo
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      let photoUrl = formData.photo
      if (photoFile) {
        photoUrl = await uploadPhoto()
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, photo: photoUrl }),
      })

      if (response.ok) {
        alert("Employee updated successfully!")
        router.push("/admin/dashboard")
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update employee")
      }
    } catch (error) {
      alert("Error updating employee")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Employee</h1>
              <p className="text-gray-400">Update employee details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Employee Information</CardTitle>
            <CardDescription className="text-gray-400">Update employee details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="space-y-4">
                <Label className="text-white">Employee Photo</Label>
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || "/placeholder.svg"} />
                    <AvatarFallback className="bg-red-600 text-white text-xl">
                      {formData.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-gray-700 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                      />
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removePhoto}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Upload JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-white">
                    Alternate Phone
                  </Label>
                  <Input
                    id="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining" className="text-white">
                    Date of Joining
                  </Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-white">
                    Blood Group
                  </Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white">
                    Experience
                  </Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 2 Years"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-white">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange("designation", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/admin/dashboard">
                  <Button type="button" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
