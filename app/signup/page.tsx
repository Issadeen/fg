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

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) throw error

      toast({
        title: "Account Created Successfully",
        description: (
          <div className="flex flex-col gap-2">
            <p>Please check your email to verify your account.</p>
            <p className="text-sm text-muted-foreground">
              A verification link has been sent to {email}
            </p>
            <p className="text-sm text-muted-foreground">
              Check your spam folder if you don't see it in your inbox.
            </p>
          </div>
        ),
        duration: 10000,
      })
      
      // Redirect after a short delay to allow user to read the message
      setTimeout(() => router.push('/login'), 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Logo Section */}
      <div className="md:hidden w-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-900 p-6 text-center">
        <img 
          src="/feleg-energy-logo.png" 
          alt="FelegEnergy Logo" 
          className="w-32 mx-auto mb-2"
        />
      </div>

      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-900 items-center justify-center p-12 relative">
        <ThemeToggle />
        <div className="text-center">
          <img 
            src="/feleg-energy-logo.png" 
            alt="FelegEnergy Logo" 
            className="w-64 mb-8"
          />
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to FelegEnergy</h2>
          <p className="text-white/80">Powering the future with sustainable solutions</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-orange-50/50 dark:bg-gray-900 relative min-h-[calc(100vh-120px)] md:min-h-screen">
        <ThemeToggle />
        <Card className="w-full max-w-[400px] border-orange-200 dark:border-orange-900 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400">Create Account</CardTitle>
            <CardDescription className="dark:text-gray-400">Join FelegEnergy today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
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
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="dark:text-gray-400">Already have an account? <Link href="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline">Login</Link></p>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

