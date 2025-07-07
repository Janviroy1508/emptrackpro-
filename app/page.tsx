"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ email: "", password: "", confirmPassword: "" })
  const [userType, setUserType] = useState<"admin" | "employee">("admin")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginData, userType }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("userType", data.userType)
        localStorage.setItem("userId", data.userId)

        if (data.userType === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/employee/profile")
        }
      } else {
        alert(data.message || "Login failed")
      }
    } catch (error) {
      alert("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registerData, userType }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Registration successful! Please login.")
        setRegisterData({ email: "", password: "", confirmPassword: "" })
      } else {
        alert(data.message || "Registration failed")
      }
    } catch (error) {
      alert("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-lg px-6 py-3 mb-4">
            <span className="text-red-600 font-bold text-2xl italic">Bata</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EmpTrackPro</h1>
          <p className="text-red-400 text-lg">Bata Employee Management System</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <Tabs
              value={userType}
              onValueChange={(value) => setUserType(value as "admin" | "employee")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="admin" className="data-[state=active]:bg-red-600">
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" className="data-[state=active]:bg-red-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Employee
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-red-600">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-red-600">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">How to Login:</p>
                    <p className="text-xs text-gray-400">
                      <strong>Admin:</strong> Register as admin first, then login
                    </p>
                    <p className="text-xs text-gray-400">
                      <strong>Employee:</strong> Admin must add your email first, then you can register and login
                    </p>
                    <div className="mt-2 p-2 bg-blue-600/20 rounded">
                      <p className="text-xs text-blue-300">
                        <strong>Process:</strong> Admin adds employee email → Employee registers → Employee login
                      </p>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-white">
                      Password *
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Enter your password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  {userType === "employee" && (
                    <div className="mt-2 p-3 bg-blue-600/20 rounded">
                      <p className="text-xs text-blue-300 font-semibold mb-1">Employee Registration Steps:</p>
                      <p className="text-xs text-blue-300">1. Admin must add your email first</p>
                      <p className="text-xs text-blue-300">2. Then you can register with that email</p>
                      <p className="text-xs text-blue-300">3. After registration, you can login</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}