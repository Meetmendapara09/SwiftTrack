
# SwiftTrack - Features Documentation

SwiftTrack is a modern, real-time delivery management and tracking platform designed to streamline logistics for vendors, empower delivery partners, and provide customers with transparent order tracking.

## I. Overall Application Features

*   **Technology Stack**: Built with Next.js (App Router), React, TypeScript, ShadCN UI components, Tailwind CSS for styling, Supabase for PostgreSQL database and authentication, and Socket.IO for real-time communication.
*   **Real-Time Updates**: Core order information (status, location) is updated in real-time across relevant dashboards and tracking pages using Socket.IO, ensuring all users see the latest information without needing to refresh.
*   **Role-Based Access Control (RBAC)**:
    *   Distinct user roles: Vendor, Delivery Partner, and Customer.
    *   Dashboard access is restricted based on the authenticated user's role.
*   **Theme Toggling**: Users can switch between Light and Dark mode application-wide. The theme preference is persisted.
*   **Responsive Design**: The application is designed to be responsive and usable across various screen sizes, from mobile devices to desktops.
*   **Authentication**: Secure login and signup powered by Supabase.
*   **Server Actions**: Key backend logic for order mutations (assigning partners, updating status/location) is handled via Next.js Server Actions interacting with the Supabase database.

## II. Vendor Features

Vendors are businesses or individuals selling products that need to be delivered.

*   **Authentication**:
    *   **Signup**: Vendors can create a new account providing their name, email, and password.
    *   **Login**: Existing vendors can log in using their email and password.
*   **Vendor Dashboard (`/vendor/dashboard`)**:
    *   **View Orders**: Displays a list of all orders associated with the logged-in vendor. Each order card shows:
        *   Order ID (shortened for readability)
        *   Customer Name
        *   Delivery Address
        *   Order Items (name and quantity)
        *   Current Order Status (e.g., Pending, Assigned, Out for Delivery, Delivered) with a distinct visual badge.
    *   **Assign Delivery Partner**: For orders in 'Pending' status:
        *   A dropdown lists available (registered) delivery partners.
        *   An "Assign Partner" button allows the vendor to assign the selected partner to the order. This updates the order status to 'Assigned'.
    *   **Real-Time Status Viewing**: The status of orders on the dashboard updates in real-time as delivery partners progress through the delivery.

## III. Delivery Partner Features

Delivery Partners are individuals responsible for delivering orders from vendors to customers.

*   **Authentication**:
    *   **Signup**: Delivery partners can register for an account with their name, email, and password.
    *   **Login**: Existing partners can log in with their credentials.
*   **Delivery Partner Dashboard (`/delivery/dashboard`)**:
    *   **View Assigned Orders**: Displays a list of orders currently assigned to the logged-in delivery partner. Each order card includes:
        *   Order ID
        *   Customer Name
        *   Delivery Address
        *   Order Items
        *   Current Order Status with a visual badge.
        *   Current (live) location if tracking is active.
    *   **Real-Time Assignment Notification**: Delivery partners receive an instant toast notification when a new order is assigned to them.
    *   **Start Delivery & Live Location Tracking**:
        *   For 'Assigned' orders, a "Start Delivery & Track Live" button is available.
        *   Clicking this button:
            *   Prompts the delivery partner for browser geolocation permission.
            *   If permission is granted, the order status is updated to 'Out for Delivery'.
            *   The partner's live geographical location (latitude, longitude) is captured using the browser's Geolocation API.
            *   This live location is sent to the backend and broadcast to relevant clients (e.g., customer tracking page).
            *   The location continues to be monitored and updated via `navigator.geolocation.watchPosition()`.
        *   If permission is denied, an error message is shown, and tracking does not start.
    *   **Pause/Resume Live Tracking**:
        *   For 'Out for Delivery' orders where tracking is active, a "Pause Live Tracking" button is shown. Clicking it stops the continuous location updates.
        *   If paused, the button changes to "Resume Live Tracking" to re-enable location updates.
    *   **Mark Order as Delivered**:
        *   Once the delivery is complete, the partner can click "Mark as Delivered".
        *   This stops any active live location tracking for that order.
        *   The order status is updated to 'Delivered'.

## IV. Customer Features

Customers are the end-users receiving the orders.

*   **Order Tracking Page (`/track/[orderId]`)**:
    *   **Access**: Customers can access the tracking page by:
        *   Navigating to `/auth/customer-login`.
        *   Entering their Order ID (or associated email - requires backend lookup).
        *   If the order is found, they are redirected to the specific tracking page.
    *   **Real-Time Location on Map**:
        *   A Leaflet.js map displays the live (or last known simulated/live) location of the assigned delivery partner.
        *   The marker on the map updates automatically as the delivery partner's location changes, providing a real-time view of the delivery progress.
    *   **View Order Details**: The page displays comprehensive order information:
        *   Order ID
        *   Customer Name
        *   Current Order Status (e.g., Pending, Assigned, Out for Delivery, Delivered) with a visual badge and descriptive text.
        *   Estimated Delivery Time (mocked, but indicates progress).
        *   Delivery Address.
        *   List of items in the order.
        *   Vendor Name (who the order is from).
        *   Delivery Partner Name (if assigned).
    *   **Real-Time Status Notifications**: Customers receive toast notifications directly on the tracking page when their order's status changes (e.g., from 'Assigned' to 'Out for Delivery', or 'Out for Delivery' to 'Delivered').

## V. Backend & Technical Details

*   **Supabase**:
    *   **Database**: PostgreSQL is used for storing all persistent data (users, profiles, vendors, delivery partners, orders, order items).
    *   **Authentication**: Supabase Auth handles user registration, login, and session management.
    *   **Row Level Security (RLS)**: Implemented to ensure users can only access and modify data they are authorized for (e.g., a vendor can only see their orders).
*   **Next.js Server Actions**: Used for secure backend operations like assigning orders, updating order status, and updating locations, interacting directly with the Supabase database.
*   **Socket.IO**: Facilitates real-time, bi-directional communication between clients and the server. When an order is updated (e.g., status change, location update from a delivery partner), the change is broadcast via Socket.IO to all connected clients, enabling dashboards and tracking maps to update live.