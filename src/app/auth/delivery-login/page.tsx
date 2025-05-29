
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from 'next/navigation';
import { useOrderData } from '@/hooks/useOrderData';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';

const formSchema = z.object({
  orderId: z.string().min(5, { message: "Order ID must be at least 5 characters." }), });

export default function CustomerTrackingLoginPage() {
  const { fetchOrderById } = useOrderData();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const order = await fetchOrderById(data.orderId);
    setIsSubmitting(false);

    if (order) {
      toast({
        title: "Order Found",
        description: `Now tracking order #${order.id.slice(0, 8)} for ${order.customer_name}.`,
        duration: 5000,
      });
      router.push(`/track/${order.id}`);
    } else {
      toast({
        title: "Order Not Found",
        description: "Could not find an order with that ID. Please check the ID and try again.",
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <Card className="w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-500 delay-150">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold">Track Your Order</CardTitle>
          <CardDescription className="text-md pt-1">Enter your Order ID to see its real-time status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full Order ID" {...field} className="text-base py-2.5"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Search className="mr-2 h-5 w-5" />}
                Track Order
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
