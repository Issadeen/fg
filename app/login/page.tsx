"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const resendVerificationEmail = async () => {
    try {
      setIsResending(true)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })

      if (error) throw error

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      console.log('🔐 Login attempt result:', { data, error })

      if (error) throw error

      if (data.session) {
        // Set the session in localStorage and cookie
        localStorage.setItem('supabase.auth.token', data.session.access_token)
        document.cookie = `supabase.auth.token=${data.session.access_token}; path=/; max-age=31536000; secure`

        await supabase.auth.setSession(data.session)
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        })

        // Force a full page refresh to ensure session is recognized
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Mobile Logo Section */}
      <div className="md:hidden w-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-900 p-6 text-center">
        <img 
          src="/feleg-energy-logo.png" 
          alt="FelegEnergy Logo" 
          className="w-32 mx-auto mb-2"
        />
      </div>

      {/* Desktop Logo Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-900 items-center justify-center p-12 relative">
        <ThemeToggle />
        <div className="text-center">
          <img 
            src="/feleg-energy-logo.png" 
            alt="FelegEnergy Logo" 
            className="w-64 mb-8"
          />
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-white/80">Access your FelegEnergy account</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-orange-50/50 dark:bg-gray-900 relative min-h-[calc(100vh-120px)] md:min-h-screen">
        <ThemeToggle />
        <Card className="w-full max-w-[400px] border-orange-200 dark:border-orange-900 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400">Login</CardTitle>
            <CardDescription className="dark:text-gray-400">Access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="dark:text-gray-400">Don't have an account? <Link href="/signup" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline">Sign up</Link></p>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

