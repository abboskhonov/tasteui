import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { signIn, signUp, signOut } from "@/lib/auth-client"
import type { User, ProfileUpdateData, LoginCredentials, SignUpCredentials, Session } from "@/lib/types/auth"

interface UploadImageResponse {
  url: string
  key: string
  size: number
  contentType: string
}

interface CheckUsernameResponse {
  available: boolean
  username: string
  current: boolean
}

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  user: () => [...authKeys.all, "user"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  usernameCheck: (username: string) => [...authKeys.all, "username-check", username] as const,
}

// Check username availability
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: authKeys.usernameCheck(username),
    queryFn: async (): Promise<CheckUsernameResponse> => {
      const response = await api.get<CheckUsernameResponse>(`/api/user/check-username/${username}`)
      return response
    },
    enabled: username.length >= 3, // Only check if username is at least 3 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })
}
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadImageResponse> => {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await api.post<UploadImageResponse>("/api/upload/image", formData)
      return response
    },
  })
}

// Get current user/session
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      try {
        const response = await api.get<Session>("/api/me")
        return response
      } catch (error) {
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get full user profile
export function useUserProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await api.get<{ user: User }>("/api/user/profile")
      return response.user
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await api.put<{ user: User }>("/api/user/profile", data)
      return response.user
    },
    onSuccess: (updatedUser) => {
      // Update both profile and session queries
      queryClient.setQueryData(authKeys.profile(), updatedUser)
      queryClient.setQueryData(authKeys.session(), (old: any) => {
        if (old) {
          return { ...old, user: updatedUser }
        }
        return old
      })
      
      // Invalidate and refetch all designs queries to update author usernames
      queryClient.invalidateQueries({ 
        queryKey: ["designs"], 
        refetchType: "all" 
      })
      
      // Immediately refetch active design queries to prevent stale links
      queryClient.refetchQueries({ 
        queryKey: ["designs"],
        type: "active" 
      })
    },
  })
}

// Login with email/password
export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await signIn.email({
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// Sign up
export function useSignUp() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      const result = await signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}

// Sign in with GitHub
export function useSignInWithGitHub() {
  return useMutation({
    mutationFn: async () => {
      const result = await signIn.social({
        provider: "github",
        callbackURL: "/",
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return result.data
    },
  })
}

// Sign in with Google
export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/",
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return result.data
    },
  })
}

// Logout
export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      window.location.href = "/"
    },
  })
}
