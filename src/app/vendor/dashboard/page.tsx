
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrderData } from '@/hooks/useOrderData';
import { useRouter } from 'next/navigation';
import { VendorOrderList } from '@/components/vendor/VendorOrderList';
import { Loader2, AlertTriangle, ShoppingBag, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrderForm, type CreateOrderFormValues } from '@/components/vendor/CreateOrderForm';
import { useToast } from '@/hooks/use-toast';

export default function VendorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { getVendorOrders, vendors, createOrder, isLoadingData: ordersLoading } = useOrderData();
  const router = useRouter();
  const { toast } = useToast();

  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);


  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'vendor')) {
      router.replace('/auth/vendor-login');
    }
  }, [user, authLoading, router]);

  const isLoading = authLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== 'vendor') {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] animate-in fade-in-0 duration-500">
          <Alert variant="destructive" className="w-full max-w-lg shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg">Access Denied</AlertTitle>
            <AlertDescription>
              You must be logged in as a vendor to view this page. Redirecting to login...
            </AlertDescription>
          </Alert>
       </div>
    );
  }
  
  const currentVendor = vendors.find(v => v.user_id === user.id);
  const vendorOrders = currentVendor ? getVendorOrders(user.id) : [];

  const handleCreateOrderSubmit = async (values: CreateOrderFormValues) => {
    if (!currentVendor) {
      toast({ title: "Error", description: "Vendor profile not found. Cannot create order.", variant: "destructive" });
      return;
    }
    setIsSubmittingOrder(true);
    const result = await createOrder(values, currentVendor.id);
    setIsSubmittingOrder(false);
    if (result.success) {
      setIsCreateOrderDialogOpen(false);
    } else {
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <div className="pb-6 border-b border-border/80 animate-in fade-in-0 slide-in-from-top-10 duration-1000">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <ShoppingBag className="h-10 w-10 text-primary"/>
              Vendor Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Welcome, {user.name}! Manage orders for your business.</p>
          </div>
          {currentVendor && (
            <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-base py-3">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create New Order</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new order for a customer.
                  </DialogDescription>
                </DialogHeader>
                <CreateOrderForm 
                  onSubmit={handleCreateOrderSubmit} 
                  onOpenChange={setIsCreateOrderDialogOpen}
                  isSubmitting={isSubmittingOrder}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <section className="animate-in fade-in-0 slide-in-from-bottom-10 delay-200 duration-1000">
        <h2 className="text-3xl font-semibold mb-6">Your Orders ({vendorOrders.length})</h2>
        <VendorOrderList orders={vendorOrders} />
      </section>
    </div>
  );
}
