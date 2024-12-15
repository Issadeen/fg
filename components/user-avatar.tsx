'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

export function UserAvatar({ user }: { user: User }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    getAvatarUrl()
  }, [user])

  async function getAvatarUrl() {
    try {
      // First try to upsert the profile to ensure it exists
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            updated_at: new Date().toISOString(),
          },
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          }
        )

      if (upsertError) {
        console.error('Error upserting profile:', upsertError)
        return
      }

      // Now fetch the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        return
      }

      if (!profile?.avatar_url) {
        return // No avatar URL yet
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(profile.avatar_url, 60 * 60)

      if (urlError) {
        console.error('Error creating signed URL:', urlError)
        return
      }

      if (urlData?.signedUrl) {
        setAvatarUrl(urlData.signedUrl)
        console.log('Avatar URL set successfully')
      }
    } catch (error) {
      console.error('Unexpected error in getAvatarUrl:', error)
      toast({
        title: "Error",
        description: "Failed to load avatar. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Add an interval to refresh the signed URL before it expires
  useEffect(() => {
    const interval = setInterval(() => {
      if (avatarUrl) {
        getAvatarUrl()
      }
    }, 45 * 60 * 1000) // Refresh every 45 minutes

    return () => clearInterval(interval)
  }, [avatarUrl])

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      // Upload new image first
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Then update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: fileName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // If successful, delete old avatar
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (currentProfile?.avatar_url && currentProfile.avatar_url !== fileName) {
        await supabase.storage
          .from('avatars')
          .remove([currentProfile.avatar_url])
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })

      // Refresh avatar
      getAvatarUrl()

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error uploading avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-80 ring-2 ring-offset-2 ring-teal-500/50 dark:ring-teal-400/50 ring-offset-background transition-all hover:ring-teal-500 dark:hover:ring-teal-400">
          <AvatarImage src={avatarUrl || ''} alt={user.email || ''} />
          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Avatar className="w-20 h-20 mx-auto ring-4 ring-offset-4 ring-teal-500/50 dark:ring-teal-400/50 ring-offset-background">
            <AvatarImage src={avatarUrl || ''} alt={user.email || ''} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-center">
            <Input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
              id="avatar-upload"
            />
            <Button asChild disabled={uploading}>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Picture
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

