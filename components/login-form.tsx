"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authenticate } from "@/lib/auth"
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles, Shield } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState({ username: false, password: false })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = authenticate(username, password)
      if (user) {
        router.push("/dashboard")
      } else {
        setError("Credenciales incorrectas. Usa USBBOG y usb123#")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 relative group">
              <Shield className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Sistema de Inventarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Accede a tu panel de control
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-gray-500 dark:text-gray-500">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>Gestión inteligente de inventarios</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="relative group animate-fade-in-up animation-delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl p-8">
              {/* Card Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Usuario
                  </Label>
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity ${isFocused.username ? 'opacity-30' : ''}`}></div>
                    <div className="relative flex items-center">
                      <User className={`absolute left-4 h-5 w-5 transition-colors z-10 ${isFocused.username ? 'text-blue-500' : 'text-gray-400'}`} />
                      <Input
                        id="username"
                        type="text"
                        placeholder="USBBOG"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, username: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, username: false }))}
                        className="pl-12 pr-4 py-3 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity ${isFocused.password ? 'opacity-30' : ''}`}></div>
                    <div className="relative flex items-center">
                      <Lock className={`absolute left-4 h-5 w-5 transition-colors z-10 ${isFocused.password ? 'text-blue-500' : 'text-gray-400'}`} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="usb123#"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                        className="pl-12 pr-12 py-3 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="animate-shake">
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 rounded-xl">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Credenciales de prueba
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-mono text-blue-600 dark:text-blue-400">Usuario: USBBOG</p>
                    <p className="font-mono text-blue-600 dark:text-blue-400">Contraseña: usb123#</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
