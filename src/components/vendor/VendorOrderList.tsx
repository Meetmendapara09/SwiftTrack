
"use client";
import type { Order, DeliveryPartner } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useOrderData } from '@/hooks/useOrderData';
import { Separator } from '../ui/separator';
import { Truck, User, MapPin, Package, Clock, PackageCheck, List, Navigation, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SkeletonOrderCard } from '@/components/shared/SkeletonOrderCard';

interface VendorOrderListProps {
  orders: Order[];
}

export function VendorOrderList({ orders }: VendorOrderListProps) {
  const { deliveryPartners, assignOrder, isLoadingData } = useOrderData();
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<Record<string, string>>({});
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const handleAssign = async (orderId: string) => {
    if (selectedPartner[orderId]) {
      setAssigningOrderId(orderId);
      await assignOrder(orderId, selectedPartner[orderId]);
      setAssigningOrderId(null);
      // Toast is handled by assignOrder in context now
    } else {
      toast({ title: "Assignment Failed", description: "Please select a delivery partner first.", variant: "destructive" });
    }
  };

  const getStatusBadgeInfo = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return { class: 'bg-orange-500/90 border-orange-600 text-white hover:bg-orange-600/90', icon: <List size={14}/>, text: 'Pending Assignment' };
      case 'Assigned': return { class: 'bg-blue-500/90 border-blue-600 text-white hover:bg-blue-600/90', icon: <Truck size={14}/>, text: 'Assigned to Partner' };
      case 'Out for Delivery': return { class: 'bg-yellow-400/90 border-yellow-500 text-yellow-900 hover:bg-yellow-500/90', icon: <Navigation size={14}/>, text: 'Out for Delivery' };
      case 'Delivered': return { class: 'bg-green-500/90 border-green-600 text-white hover:bg-green-600/90', icon: <PackageCheck size={14}/>, text: 'Delivered' };
      default: return { class: 'bg-gray-400/90 border-gray-500 text-white hover:bg-gray-500/90', icon: <Info size={14}/>, text: 'Unknown Status' };
    }
  };

  if (isLoadingData && orders.length === 0) { // Show skeletons only if there are no orders yet (initial load)
     return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonOrderCard key={index} />
        ))}
      </div>
    );
  }

  if (orders.length === 0 && !isLoadingData) {
    return (
        <Alert className="max-w-xl mx-auto shadow-md animate-in fade-in-0 duration-500">
            <Package className="h-5 w-5" />
            <AlertTitle className="font-semibold">No Orders Yet!</AlertTitle>
            <AlertDescription>
            You currently have no orders. Use the "Create New Order" button to add your first order.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, index) => {
        const statusInfo = getStatusBadgeInfo(order.status);
        const partnerForOrder = order.assigned_to_id ? deliveryPartners.find(dp => dp.id === order.assigned_to_id) : null;
        
        return (
          <Card 
            key={order.id} 
            className="shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-0 zoom-in-95"
            style={{animationDelay: `${index * 50}ms`}}
          >
            <CardHeader className="bg-card border-b">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl font-semibold text-primary">Order #{order.id.slice(0,8)}</CardTitle>
                <Badge variant="outline" className={`${statusInfo.class} text-xs px-2.5 py-1.5 font-medium flex items-center gap-1.5 transition-colors`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 pt-1 text-sm">
                <User size={16} className="text-muted-foreground" /> {order.customer_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 flex-grow">
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="font-medium">{order.delivery_address}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Package size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                    Items: {order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'No items listed'}
                </span>
              </div>
              {partnerForOrder && (
                <div className="flex items-center gap-3 text-sm pt-1">
                  <Truck size={18} className="text-accent shrink-0" />
                  <span className="text-muted-foreground">Delivery by: <span className="font-medium text-foreground">{partnerForOrder.name}</span></span>
                </div>
              )}
            </CardContent>
            <Separator />
            <CardFooter className="pt-4 pb-4 bg-muted/50">
              {order.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
                  <Select
                    onValueChange={(value) => setSelectedPartner(prev => ({ ...prev, [order.id]: value }))}
                    value={selectedPartner[order.id] || ""}
                    disabled={deliveryPartners.length === 0 || assigningOrderId === order.id}
                  >
                    <SelectTrigger className="w-full sm:flex-grow-[2] md:min-w-[180px] text-sm py-2.5">
                      <SelectValue placeholder="Choose Delivery Partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryPartners.length > 0 ? deliveryPartners.map(partner => (
                        <SelectItem key={partner.id} value={partner.id} className="text-sm">
                          {partner.name}
                        </SelectItem>
                      )) : <SelectItem value="no-partners" disabled>No partners available</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleAssign(order.id)} 
                    disabled={!selectedPartner[order.id] || deliveryPartners.length === 0 || assigningOrderId === order.id}
                    className="w-full sm:w-auto sm:flex-grow-[1] text-base py-3 hover:bg-primary/80 transition-colors"
                    size="lg"
                  >
                    {assigningOrderId === order.id ? <Loader2 className="animate-spin"/> : <Truck size={18} />}
                    {assigningOrderId === order.id ? 'Assigning...' : 'Assign Partner'}
                  </Button>
                </div>
              )}
              {order.status === 'Assigned' && !partnerForOrder && (
                 <p className="text-sm text-blue-600 font-medium flex items-center gap-1.5 w-full justify-center">
                    <Clock size={16}/> Awaiting delivery partner confirmation.
                </p>
              )}
              {order.status === 'Assigned' && partnerForOrder && (
                 <p className="text-sm text-blue-600 font-medium flex items-center gap-1.5 w-full justify-center">
                    <Clock size={16}/> Assigned. Waiting for partner to start.
                </p>
              )}
              {order.status === 'Out for Delivery' && (
                <p className="text-sm text-yellow-700 font-medium flex items-center gap-1.5 w-full justify-center">
                  <Navigation size={16}/> Order is currently en route to the customer.
                </p>
              )}
              {order.status === 'Delivered' && (
                <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5 w-full justify-center">
                  <PackageCheck size={16}/> This order has been successfully delivered.
                </p>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
