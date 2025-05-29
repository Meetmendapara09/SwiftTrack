
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { UserRole } from '@/lib/types';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void> | void;
  title: string;
  description: string;
  children?: React.ReactNode;
  isSubmitting?: boolean;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm({ role, onSubmit, title, description, children, isSubmitting }: LoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const roleDisplay = role === 'delivery_partner' ? 'Delivery Partner' : role.charAt(0).toUpperCase() + role.slice(1);

  return (
      <Card className="w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-500 delay-150">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-md pt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} className="text-base py-2.5"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="text-base py-2.5"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <LogIn className="mr-2 h-5 w-5"/>}
                Login as {roleDisplay}
              </Button>
            </form>
          </Form>
        </CardContent>
        {children && <div className="px-6 pb-6">{children}</div>}
      </Card>
  );
}
