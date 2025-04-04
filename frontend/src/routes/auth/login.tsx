import { createFileRoute, useNavigate } from '@tanstack/react-router'


import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { api } from '@/utils/api'
import { z, ZodError } from 'zod';
const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
});
export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginPage></LoginPage>
}



const LoginPage = () => {
  // Form state
  const router = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Validate using zod schema
  const validateForm = () => {
    try {
      // Parse form data with zod schema
      loginSchema.parse({ email, password });
      setErrors({ email: '', password: '', form: '' });
      return true;
    } catch (error:ZodError | any) {
      // Format zod errors
      const formattedErrors = { email: '', password: '', form: '' };
      console.log(error)
      if(error instanceof ZodError) {
        error.errors.forEach((err) => {
          
          formattedErrors[err.path[0] ] = err.message;
        });
      }
      
      setErrors(formattedErrors);
      return false;
    }
  };
  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        await api.post('/auth/login', { email, password })
        router({to:"/home"})
      } catch (err) {
        console.error("Login error:", err)
      } finally {
        setIsLoading(false)
      }
      
    }
  };
  
  return (<div className='h-[100vh] flex items-cente justify-center'>
    <Card className="w-full max-w-md ">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-6">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300" />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button variant="link" className="p-0 h-auto text-sm" type="button">
              Forgot password?
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </CardFooter>
    </Card>
  </div>
    
  );
};
