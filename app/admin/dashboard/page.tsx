"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Edit, Trash2, Download, LogOut, Search, Eye, Calendar, Phone, Mail } from "lucide-react"
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

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "admin") {
      router.push("/")
      return
    }

    fetchEmployees()
  }, [router])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        alert("Failed to fetch employees")
      }
    } catch (error) {
      alert("Error fetching employees")
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

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setEmployees(employees.filter((emp) => emp._id !== id))
        alert("Employee deleted successfully")
      } else {
        alert("Failed to delete employee")
      }
    } catch (error) {
      alert("Error deleting employee")
    }
  }

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Alt Phone",
      "DOB",
      "DOJ",
      "Blood Group",
      "Experience",
      "Gender",
      "Designation",
      "Address",
    ]

    const csvContent = [
      headers.join(","),
      ...employees.map((emp) =>
        [
          emp.name,
          emp.email,
          emp.phone,
          emp.alternatePhone || "",
          emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : "",
          emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : "",
          emp.bloodGroup,
          emp.experience,
          emp.gender,
          emp.designation,
          `"${emp.address}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded px-3 py-1">
                <span className="text-red-600 font-bold text-lg italic">Bata</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Employee Management System</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employees.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Registered</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employees.filter((emp) => emp.password).length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Registration</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employees.filter((emp) => !emp.password).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/add-employee">
              <Button className="bg-red-600 hover:bg-red-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </Link>
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Employees Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">All Employees</CardTitle>
            <CardDescription className="text-gray-400">Manage your employee database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No employees found. Add some employees to get started.
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.photo || "/placeholder.svg"} />
                        <AvatarFallback className="bg-red-600 text-white">
                          {employee.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white">{employee.name}</h3>
                        <p className="text-sm text-gray-400">{employee.designation}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-400">
                            <Mail className="w-3 h-3 mr-1" />
                            {employee.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Phone className="w-3 h-3 mr-1" />
                            {employee.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {employee.experience && (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                          {employee.experience}
                        </Badge>
                      )}
                      {employee.bloodGroup && (
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {employee.bloodGroup}
                        </Badge>
                      )}
                      <div className="flex space-x-1">
                        <Link href={`/admin/employee/${employee._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/edit-employee/${employee._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEmployee(employee._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
