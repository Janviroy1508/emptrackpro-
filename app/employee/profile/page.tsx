"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LogOut, User, Mail, Phone, Calendar, MapPin, Briefcase, Heart, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")
    const userId = localStorage.getItem("userId")

    if (!token || userType !== "employee") {
      router.push("/")
      return
    }

    fetchEmployeeProfile(userId!)
  }, [router])

  const fetchEmployeeProfile = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/employees/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmployee(data)
      } else {
        alert("Failed to fetch profile")
      }
    } catch (error) {
      alert("Error fetching profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("userId")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Employee not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded px-3 py-1">
                <span className="text-red-600 font-bold text-lg italic">Bata</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Employee Profile</h1>
                <p className="text-gray-400">Welcome back, {employee.name}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={employee.photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-red-600 text-white text-2xl">
                    {employee.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">{employee.name}</h2>
                  <p className="text-xl text-red-400 mb-4">{employee.designation}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {employee.experience && (
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        {employee.experience} Experience
                      </Badge>
                    )}
                    {employee.bloodGroup && (
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {employee.bloodGroup}
                      </Badge>
                    )}
                    {employee.gender && (
                      <Badge variant="outline" className="border-blue-600 text-blue-400">
                        {employee.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-red-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{employee.email}</p>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{employee.phone}</p>
                  </div>
                </div>
                {employee.alternatePhone && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Alternate Phone</p>
                        <p className="text-white">{employee.alternatePhone}</p>
                      </div>
                    </div>
                  </>
                )}
                {employee.address && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="text-white">{employee.address}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-red-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.dateOfBirth && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Date of Birth</p>
                        <p className="text-white">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                  </>
                )}
                {employee.dateOfJoining && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Date of Joining</p>
                        <p className="text-white">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                  </>
                )}
                {employee.bloodGroup && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Blood Group</p>
                        <p className="text-white">{employee.bloodGroup}</p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                  </>
                )}
                {employee.gender && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Gender</p>
                      <p className="text-white">{employee.gender}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Work Information */}
          {(employee.designation || employee.experience || employee.dateOfJoining) && (
            <Card className="bg-gray-800/50 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-red-400" />
                  Work Information
                </CardTitle>
                <CardDescription className="text-gray-400">Your current role and experience details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {employee.designation && (
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <Briefcase className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Designation</p>
                      <p className="text-lg font-semibold text-white">{employee.designation}</p>
                    </div>
                  )}
                  {employee.experience && (
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Experience</p>
                      <p className="text-lg font-semibold text-white">{employee.experience}</p>
                    </div>
                  )}
                  {employee.dateOfJoining && (
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Years at Bata</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date().getFullYear() - new Date(employee.dateOfJoining).getFullYear()} Years
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
