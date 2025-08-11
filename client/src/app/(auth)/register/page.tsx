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


export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required.' })
      .min(2, { message: 'Name must be at least 2 characters.' }),

    email: z
      .email({ message: 'Please enter a valid email address.' })
      .min(1, { message: 'Email is required.' }),

    password: z
      .string()
      .min(1, { message: 'Password is required.' })
      .min(8, { message: 'Password must be at least 8 characters long.' }),

    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export default function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = await axiosInstance.post("api/auth/register", values)
    console.log(data)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Register with your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <AuthProviderButtons />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">Or sign up with email</span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control} 
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name" className="me-auto">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input id="name" placeholder="Your full name" required {...field} />
                        </FormControl>
                        <FormMessage className="me-auto" />
                      </FormItem>
                    )}
                  />
                </div>
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password" className="me-auto">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input id="password" type="password" placeholder="••••••••" required {...field} />
                        </FormControl>
                        <FormMessage className="me-auto" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirmPassword" className="me-auto">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input id="confirmPassword" type="password" placeholder="••••••••" required {...field} />
                        </FormControl>
                        <FormMessage className="me-auto" />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign up
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
