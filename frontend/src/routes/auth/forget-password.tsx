import { createFileRoute, Link } from '@tanstack/react-router'
import type React from "react"

import { useState } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
export const Route = createFileRoute('/auth/forget-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPasswordPage/>
}




function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would call your password reset API here
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // })

      // if (!response.ok) {
      //   const data = await response.json()
      //   throw new Error(data.message || 'Failed to send reset email')
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, let's simulate a successful submission
      console.log("Reset email sent to:", email)

      // Show success message
      setIsSubmitted(true)
    } catch (err) {
      console.error("Forgot password error:", err)
      setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        {isSubmitted ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
              <p className="text-center">
                If an account exists with the email <strong>{email}</strong>, you will receive a password reset link
                shortly.
              </p>
            </div>
            <div className="text-center">
              <Link to="/auth/login">
                <Button variant="link">Return to login</Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Sending</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

