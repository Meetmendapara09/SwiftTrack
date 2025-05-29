
"use client";
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CardFooter } from '@/components/ui/card';

export default function VendorLoginPage() {
  const { login } = useAuth();
  const router = useRouter(); // Keep for potential post-login navigation if not handled by AuthContext
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { email: string, password: string }) => {
    setIsSubmitting(true);
    const { success, error } = await login(data);
    setIsSubmitting(false);

    if (success) {
      toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
    } else {
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid credentials or error logging in.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <LoginForm
        role="vendor"
        onSubmit={handleSubmit}
        title="Vendor Login"
        description="Access the vendor dashboard to manage your products and orders."
        isSubmitting={isSubmitting}
      >
        <CardFooter className="flex flex-col items-center pt-6 border-t mt-4">
            <p className="text-sm text-muted-foreground">
                New vendor?{' '}
                <Link href="/auth/vendor-signup" className="font-medium text-primary hover:underline">
                Sign Up Here
                </Link>
            </p>
        </CardFooter>
      </LoginForm>
    </div>
  );
}
