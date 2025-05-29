import '@testing-library/jest-dom';

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
    Promise.resolve(
      success({
        coords: {
          latitude: 51.1,
          longitude: 45.3,
          altitude: null,
          accuracy: 1,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    )
  ),
  watchPosition: jest.fn().mockReturnValue(1), // Return a watchId
  clearWatch: jest.fn(),
};
global.navigator.geolocation = mockGeolocation;

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Supabase client
// This is a very basic mock. For more complex scenarios, you might want a more elaborate mock.
jest.mock('@/lib/supabaseClient', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: {} }, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: {} }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({
    orderId: 'mock-order-id',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => jest.fn(() => <>{children}</>),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return {
    io: jest.fn(() => mockSocket),
  };
});

// Mock custom hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ success: true }),
    isLoading: false,
  })),
}));

jest.mock('@/hooks/useOrderData', () => ({
  useOrderData: jest.fn(() => ({
    orders: [],
    deliveryPartners: [],
    vendors: [],
    isLoadingData: false,
    assignOrder: jest.fn().mockResolvedValue(undefined),
    updateOrderStatus: jest.fn().mockResolvedValue(undefined),
    updateOrderLocation: jest.fn().mockResolvedValue(undefined),
    getVendorOrders: jest.fn(() => []),
    getDeliveryPartnerOrders: jest.fn(() => []),
    getOrderById: jest.fn(() => undefined),
    fetchOrderById: jest.fn().mockResolvedValue(null),
  })),
}));
