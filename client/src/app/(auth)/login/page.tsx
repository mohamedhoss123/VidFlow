  "use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { AuthProviderButtons } from '../layout'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import Link from 'next/link'
import axiosInstance from '~/lib/api';
import { useRouter } from "next/navigation";
export const formSchema = z.object({
  email: z
    .email()
    .min(1, { message: 'Email is required.' }),

  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters long.' }),
  // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
  // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
  // .regex(/[0-9]/, { message: "Password must contain at least one number." })
  // .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
});

export default function Login() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = await axiosInstance.post('/api/auth/login', values)
    localStorage.setItem("token",data.data.token)
    console.log(data) 
    router.push("/video"); // or replace() if you don't want back button to go to the old page
  }
  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <AuthProviderButtons />
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email" className="me-auto">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input id="email" type="email" placeholder="name@example.com" required {...field} />
                          </FormControl>
                          <FormMessage className="me-auto" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <div className="flex items-center justify-between">
                              <FormLabel htmlFor="password">Password</FormLabel>
                              <Link href="/" className="text-sm underline-offset-4 hover:underline">
                                Forgot your password?
                              </Link>
                            </div>
                            <FormControl>
                              <Input id="password" type="password" required {...field} />
                            </FormControl>
                            <FormMessage className="me-auto" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don't have an account?{' '}
                  <Link href="/register" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}
