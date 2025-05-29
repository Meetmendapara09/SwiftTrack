
import type { Database } from './database.types';


export type OrderStatus = Database['public']['Enums']['order_status'];

export interface OrderItem {
  id: string; 
  order_id: string; 
  name: string; 
  quantity: number;
  created_at?: string;
}

export interface Order {
  id: string; 
  customer_name: string;
  customer_email?: string | null;
  delivery_address: string;
  items: OrderItem[]; 
  status: OrderStatus;
  vendor_id: string; 
  assigned_to_id?: string | null; 
  current_location_lat?: number | null;
  current_location_lng?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryPartner {
  id: string; 
  user_id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  id: string; 
  user_id: string; 
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'vendor' | 'delivery_partner' | 'customer';

export interface AuthenticatedUser {
  id: string; // This is auth.users.id (UUID)
  name: string | null; // From profiles.name
  email: string; // From profiles.email (or auth.users.email)
  role: UserRole; // From profiles.role
}

export type DbOrder = Database['public']['Tables']['orders']['Row'];
export type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
export type DbVendor = Database['public']['Tables']['vendors']['Row'];
export type DbDeliveryPartner = Database['public']['Tables']['delivery_partners']['Row'];
