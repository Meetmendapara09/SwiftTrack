
"use client";
import { useState } from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function DeliveryPartnerSignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { name: string, email: string, password: string }) => {
    setIsSubmitting(true);
    const { success, error, message } = await signUp({ ...data, role: 'delivery_partner' });
    setIsSubmitting(false);

    if (success) {
      toast({ 
        title: "Signup Almost Complete!", 
        description: message || "Please check your email to confirm your account, then log in.",
        duration: 7000
      });
      router.push('/auth/delivery-login'); 
    } else {
      toast({ 
        title: "Signup Failed", 
        description: message || error?.message || "Could not create delivery partner account. Please try again.", 
        variant: "destructive",
        duration: 7000,
      });
    }
  };

  return (
     <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
        <SignupForm
        role="delivery_partner"
        onSubmit={handleSubmit}
        title="Delivery Partner Signup"
        description="Create an account to start managing deliveries and earn."
        loginLink="/auth/delivery-login"
        isSubmitting={isSubmitting}
        />
    </div>
  );
}
