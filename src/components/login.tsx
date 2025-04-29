"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader } from '@/components/Loader'
import { toast } from 'sonner'

type AuthError = {
    message: string;
    status?: number;
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const { data } = await authClient.signIn.email({
                email,
                password,
            })
            
            if (data) {
                toast.success("Signed in successfully")
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            const authError = err as AuthError
            const errorMessage = authError.message || 'Failed to sign in'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)
        
        try {
            await authClient.signIn.social({
                provider: 'google',
            })
            // Note: No need to redirect here as the OAuth flow will handle redirection
        } catch (err: unknown) {
            const authError = err as AuthError
            const errorMessage = authError.message || 'Failed to sign in with Google'
            setError(errorMessage)
            toast.error(errorMessage)
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleEmailLogin}
                className="max-w-92 m-auto h-fit w-full">
                <div className="p-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                             <Image
                                src="/nuro1.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="size-20 w-20 "
                            />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Nuro</h1>
                        <p>Welcome back! Sign in to continue</p>
                    </div>

                    <motion.div 
                        className="mt-6"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                            disabled={loading}>
                            {loading ? (
                                <Loader />
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="0.98em"
                                        height="1em"
                                        viewBox="0 0 256 262">
                                        <path
                                            fill="#4285f4"
                                            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                        <path
                                            fill="#34a853"
                                            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                        <path
                                            fill="#fbbc05"
                                            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                        <path
                                            fill="#eb4335"
                                            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                                    </svg>
                                    <span className="ml-2">Google</span>
                                </>
                            )}
                        </Button>
                    </motion.div>

                    <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <hr className="border-dashed" />
                        <span className="text-muted-foreground text-xs">Or continue With</span>
                        <hr className="border-dashed" />
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
                                {error}
                            </motion.div>
                        )}
                        
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="block text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <Button 
                            className="w-full"
                            type="submit"
                            disabled={loading}>
                            {loading ? <Loader /> : "Sign In"}
                        </Button>
                    </div>
                </div>

                <p className="text-accent-foreground text-center text-sm">
                    Dont have an account?
                    <Button
                        asChild
                        variant="link"
                        className="px-2">
                        <Link href="/signup">Create account</Link>
                    </Button>
                </p>
            </motion.form>
        </section>
    )
}
