
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorDashboardPage from './page';
import { useAuth } from '@/hooks/useAuth';
import { useOrderData } from '@/hooks/useOrderData';
import { useRouter } from 'next/navigation';
import type { AuthenticatedUser, Order } from '@/lib/types';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useOrderData');
jest.mock('next/navigation');
jest.mock('@/components/vendor/VendorOrderList', () => ({
  VendorOrderList: ({ orders }: { orders: Order[] }) => (
    <div data-testid="vendor-order-list">
      {orders.map(order => <div key={order.id}>Order: {order.id}</div>)}
      <span>Total Orders: {orders.length}</span>
    </div>
  ),
}));


const mockUseAuth = useAuth as jest.Mock;
const mockUseOrderData = useOrderData as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('VendorDashboardPage', () => {
  const mockRouterReplace = jest.fn();
  
  const mockVendorUser: AuthenticatedUser = {
    id: 'vendor123',
    name: 'Super Vendor',
    email: 'vendor@example.com',
    role: 'vendor',
  };

  const mockOrders: Order[] = [
    { id: 'order1', customer_name: 'Cust A', delivery_address: 'Addr A', status: 'Pending', vendor_id: 'vendor123', items: [] },
    { id: 'order2', customer_name: 'Cust B', delivery_address: 'Addr B', status: 'Assigned', vendor_id: 'vendor123', items: [] },
  ];

  beforeEach(() => {
    mockRouterReplace.mockClear();
    mockUseRouter.mockReturnValue({ replace: mockRouterReplace });
    
    mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false });
    mockUseOrderData.mockReturnValue({ 
      getVendorOrders: jest.fn(() => mockOrders), 
      isLoadingData: false 
    });
  });

  test('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    render(<VendorDashboardPage />);
    expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  test('renders loading state when order data is loading', () => {
    mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false });
    mockUseOrderData.mockReturnValue({ getVendorOrders: jest.fn(() => []), isLoadingData: true });
    render(<VendorDashboardPage />);
    expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument();
  });

  test('redirects to login if user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    render(<VendorDashboardPage />);
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/vendor-login');
    });
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  test('redirects to login if user is not a vendor', async () => {
    const notVendorUser: AuthenticatedUser = { ...mockVendorUser, role: 'customer' };
    mockUseAuth.mockReturnValue({ user: notVendorUser, isLoading: false });
    render(<VendorDashboardPage />);
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/vendor-login');
    });
     expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  test('renders dashboard for authenticated vendor', () => {
    mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false });
    mockUseOrderData.mockReturnValue({ 
        getVendorOrders: jest.fn(() => mockOrders), 
        isLoadingData: false 
    });
    render(<VendorDashboardPage />);
    expect(screen.getByText(/Vendor Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(`Welcome, ${mockVendorUser.name}!`)).toBeInTheDocument();
    expect(screen.getByText(`Your Orders (${mockOrders.length})`)).toBeInTheDocument();
    expect(screen.getByTestId('vendor-order-list')).toBeInTheDocument();
    expect(screen.getByText('Order: order1')).toBeInTheDocument();
  });

  test('calls getVendorOrders with correct vendor user id', () => {
    const getVendorOrdersMock = jest.fn(() => mockOrders);
    mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false });
    mockUseOrderData.mockReturnValue({ 
      getVendorOrders: getVendorOrdersMock, 
      isLoadingData: false 
    });
    render(<VendorDashboardPage />);
    expect(getVendorOrdersMock).toHaveBeenCalledWith(mockVendorUser.id);
  });

  test('displays no orders message if vendor has no orders', () => {
    mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false });
    mockUseOrderData.mockReturnValue({ 
      getVendorOrders: jest.fn(() => []), // No orders
      isLoadingData: false 
    });
    render(<VendorDashboardPage />);
    expect(screen.getByText('Your Orders (0)')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-order-list')).toBeInTheDocument();
    expect(screen.getByText('Total Orders: 0')).toBeInTheDocument(); 
  });
});
