
# SwiftTrack - Real-Time Delivery Management Platform

SwiftTrack is a modern, real-time delivery management and tracking application designed to streamline logistics for vendors, empower delivery partners, and provide customers with transparent order tracking.

## Core Features

*   **Vendor Order Management**:
    *   Vendor dashboard to view their list of orders.
    *   Ability to assign available delivery partners to pending orders.
    *   Real-time view of order statuses.
*   **Delivery Partner Operations**:
    *   Delivery partner dashboard to view assigned orders.
    *   "Start Delivery" feature to initiate live location tracking using the browser's Geolocation API.
    *   Ability to pause/resume live tracking.
    *   Functionality to mark orders as "Delivered".
    *   Real-time toast notifications for new order assignments.
*   **Real-Time Customer Map Tracking**:
    *   Dedicated tracking page for customers to view their order details.
    *   Live map (Leaflet.js) displaying the delivery partner's current location.
    *   Map and order status auto-update in real-time via WebSockets (Socket.IO).
    *   Real-time toast notifications for order status changes.
*   **User Authentication & Authorization**:
    *   Secure signup and login for Vendors and Delivery Partners using Supabase Auth.
    *   Customer order lookup by Order ID.
    *   Role-based access control for dashboards.
*   **Modern UI/UX**:
    *   Responsive design built with Next.js (App Router), React, and TypeScript.
    *   Styled with Tailwind CSS and ShadCN UI components.
    *   Light/Dark theme toggle.
    *   Subtle animations for an enhanced user experience.
*   **Backend & Real-Time Communication**:
    *   Supabase for PostgreSQL database (users, profiles, orders, items, vendors, delivery partners).
    *   Supabase for authentication.
    *   Next.js Server Actions for secure backend operations interacting with Supabase.
    *   Socket.IO for pushing real-time updates to connected clients.

## Technology Stack

*   **Frontend**:
    *   Next.js (App Router)
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   ShadCN UI
    *   `react-hook-form` for forms
    *   `zod` for validation
    *   `lucide-react` for icons
    *   `react-leaflet` & `leaflet` for maps
    *   `socket.io-client` for WebSocket communication
    *   `next-themes` for theme management
*   **Backend**:
    *   Supabase (PostgreSQL Database & Authentication)
    *   Next.js Server Actions
    *   Socket.IO (server-side integrated with Next.js API route)
*   **Development & Tooling**:
    *   Node.js
    *   npm
    *   Jest & React Testing Library for testing
    *   ESLint & Prettier (assumed standard setup)

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Supabase account and a new project created.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Meetmendapara09/SwiftTrack.git
    cd SwiftTrack
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set Up Supabase Database**:
    *   Log in to your Supabase project dashboard.
    *   Navigate to the **SQL Editor**.
    *   Execute the SQL schemas provided in the project documentation (or previously by the AI assistant). This includes creating tables for `profiles`, `vendors`, `delivery_partners`, `orders`, `order_items`, the `order_status` ENUM type, the `handle_new_user` function/trigger, and the `trigger_set_timestamp` function/triggers.
    *   **Crucially, enable Row Level Security (RLS)** on all your tables and define appropriate policies. The example policies provided are a starting point.

4.  **Configure Environment Variables**:
    *   Create a `.env.local` file in the root of your project by copying the `.env.sample` file:
        ```bash
        cp .env.sample .env.local
        ```
    *   Open `.env.local` and fill in your Supabase project details:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://your-project-ref.supabase.co`). Found in Project Settings > API.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project `anon` public key. Found in Project Settings > API.

5.  **Generate Supabase TypeScript Types**:
    *   Make sure you have the Supabase CLI installed: `npm install -g supabase` (or `npm install --save-dev supabase` for project-local install).
    *   Log in to the Supabase CLI: `npx supabase login`
    *   Run the following command from your project root to generate types (replace `YOUR_PROJECT_ID` with your actual Supabase project ID, which can be found in the URL of your Supabase dashboard or project settings):
        ```bash
        npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/database.types.ts
        ```

6.  **Run the Development Server**:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application should now be running, typically at `http://localhost:9002` (as configured in `package.json`).

## Running Tests

*   To run tests once:
    ```bash
    npm test
    ```
*   To run tests in watch mode:
    ```bash
    npm run test:watch
    ```
*   **Test Reports**: To generate an HTML test report (e.g., in `./src/test/result/test-report.html`), you can install `jest-html-reporter` (`npm install --save-dev jest-html-reporter`) and configure it in your `jest.config.mjs` file.

## Supabase Key Setup Points

*   **`profiles` Table & `handle_new_user` Trigger**: Essential for linking Supabase authenticated users (`auth.users`) to application-specific roles and data. The `handle_new_user` trigger automatically creates a profile when a user signs up.
*   **`vendors` & `delivery_partners` Tables**: These tables are populated after user signup (via `AuthContext`) to establish the vendor/delivery partner entities.
*   **Row Level Security (RLS)**: This is fundamental for securing your data. Ensure policies are defined for each table to control who can access and modify data.
*   **Database Triggers for `updated_at`**: Use the `trigger_set_timestamp` function to automatically update `updated_at` columns on row modifications.

## Project Structure (Overview)

*   `src/app/`: Contains all the Next.js App Router pages and layouts.
    *   `src/app/actions/`: Server Actions for backend logic.
    *   `src/app/(auth-routes)/`: Authentication related pages.
    *   `src/app/vendor/dashboard/`: Vendor-specific dashboard.
    *   `src/app/delivery/dashboard/`: Delivery partner specific dashboard.
    *   `src/app/track/[orderId]/`: Customer order tracking page.
*   `src/components/`: Shared and feature-specific React components.
    *   `src/components/auth/`: Authentication forms.
    *   `src/components/shared/`: Globally used components like Header, Logo.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/contexts/`: React Context providers (e.g., `AuthContext`, `OrderDataContext`).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions, constants, Supabase client setup, type definitions.
*   `pages/api/socket.ts`: Next.js API route for Socket.IO server setup.