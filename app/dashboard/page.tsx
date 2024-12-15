'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ModeToggle } from '@/components/mode-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { Truck, Briefcase, Plus, Wallet, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ParticlesBackground } from '@/components/particles-background'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'

const fadeIn = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    y: 0 
  },
  transition: { 
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth easing
  }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    }
  }
}

const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

export default function Dashboard() {
  const [userSession, setUserSession] = useState<Session | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Add idle timeout
  useIdleTimeout()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('🔐 Error fetching session:', error)
      }
      if (!session) {
        console.log('⚠️ No session found, redirecting to login')
        router.replace('/login')
      } else {
        console.log('✅ Session found:', session.user.email)
        setUserSession(session)
      }
    }

    checkSession()
  }, [router])

  if (!userSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-background dark:bg-black flex flex-col relative"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <ParticlesBackground />
      
      <motion.header 
        className="border-b backdrop-blur-sm bg-gradient-to-r from-orange-50/80 to-background/80 dark:from-background/20 dark:to-black/80 sticky top-0 z-50 shadow-sm"
        variants={fadeIn}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/feleg-energy-logo.png" alt="Feleg Energy Logo" width={40} height={40} priority />
            <h1 className="text-2xl font-bold text-primary hidden md:block">Feleg Energy</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="ghost"
              className="hidden md:inline-flex"
            >
              Logout
            </Button>
            <UserAvatar user={userSession.user} />
          </div>
        </div>
      </motion.header>
      
      <main className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <motion.h2 
          className="text-3xl font-bold text-center mb-8"
          variants={fadeIn}
        >
          Welcome back, {userSession.user?.email?.split('@')[0] || 'User'}!
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerChildren}
        >
          {[
            {
              href: "/manage-trucks",
              icon: Truck,
              title: "Manage Trucks",
              description: "View and manage your fleet of trucks"
            },
            {
              href: "/work-details",
              icon: Briefcase,
              title: "Work Details",
              description: "Review and update work assignments"
            },
            {
              href: "/new-trucks",
              icon: Plus,
              title: "New Trucks",
              description: "Add new trucks to your fleet"
            },
            {
              href: "/wallet",
              icon: Wallet,
              title: "Wallet",
              description: "Manage your finances and transactions"
            }
          ].map((item, index) => (
            <motion.div 
              key={item.href} 
              variants={cardVariants}
              whileHover="hover"
              layoutId={item.href}
            >
              <Link href={item.href}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full bg-gradient-to-br from-orange-50 to-background dark:from-gray-900 dark:to-black backdrop-blur-sm hover:from-orange-100 dark:hover:from-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <item.icon className="h-6 w-6 text-orange-500" />
                      <span>{item.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
      
      <motion.footer 
        className="border-t mt-auto bg-background/80 dark:bg-black/80 backdrop-blur-sm relative z-10"
        variants={fadeIn}
        transition={{ delay: 0.4 }}
      >
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 Issaerium. All rights reserved.
        </div>
      </motion.footer>
    </motion.div>
  )
}

