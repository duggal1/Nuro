import { createAuthClient } from "better-auth/react"

// Use the correct base URL depending on environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || 
               (process.env.NODE_ENV === 'production' 
                ? 'https://your-production-domain.com' 
                : 'http://localhost:3000')

export const authClient = createAuthClient({
    baseURL
})