
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string; // Added for customer login simulation
  deliveryAddress: string;
  items: OrderItem[];
  status: 'Pending' | 'Assigned' | 'Out for Delivery' | 'Delivered';
  assignedTo?: string; // DeliveryPartner ID
  currentLocation?: { lat: number; lng: number };
  vendorId: string;
  // aiGeneratedUpdateMessage?: string; // Removed this field
}

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string; // For login
}

export interface Vendor {
  id: string;
  name: string;
  email: string; // For login
}

export type UserRole = 'vendor' | 'delivery_partner' | 'customer';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
