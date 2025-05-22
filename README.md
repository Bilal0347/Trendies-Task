# Trendies - Task

A modern web application for managing and rating luxury fashion orders, built with Next.js, Supabase, and Tailwind CSS.

🌐 **Live Demo**: [https://trendies-task-rf5t.vercel.app/my-orders](https://trendies-task-rf5t.vercel.app/my-orders)

## Features

- **Order Management**
  - View and track orders in different states (pending, delivered, rated)
  - Real-time order status updates

- **Rating System**
  - 5-star rating system for delivered orders
  - Optional review comments
  - Ability to update existing ratings
  - Rating validation (only delivered orders can be rated)

- **User Authentication**
  - Secure authentication using Supabase
  - Protected routes and API endpoints
  - Automatic redirection for authenticated users

- **Modern UI/UX**
  - Responsive design using Tailwind CSS
  - Beautiful and accessible components from shadcn/ui
  - Interactive components with Radix UI primitives
  - Toast notifications for user feedback
  - Modal dialogs for reviews

## Tech Stack

- **Frontend**
  - Next.js 15.3.2
  - React 19
  - TypeScript
  - Tailwind CSS
  - shadcn/ui Components
  - Radix UI Primitives
  - Lucide Icons

- **Backend**
  - Supabase (Authentication & Database)
  - Next.js API Routes

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: trendies
   - Database Password: (create a secure password)
   - Region: (choose the closest to your users)
4. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to Project Settings > API
2. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Enable Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure Email Templates (optional)
4. Set up any additional providers (Google, GitHub, etc.)

### 5. Set Up Database

#### Option 1: Using Supabase Dashboard

1. Go to SQL Editor
2. Create a new query
3. Copy and paste the SQL from `supabase/migrations/20240321000000_create_initial_tables.sql`
4. Run the query

#### Option 2: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

4. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

5. Push the migrations:
   ```bash
   supabase db push
   ```

### 6. Verify Setup

1. Check Database Tables:
   - Go to Table Editor
   - Verify all tables are created
   - Check RLS policies are in place

2. Test Authentication:
   - Try signing up a new user
   - Verify email confirmation works
   - Test login functionality

## Database Schema

The application uses the following database tables in Supabase:

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  status TEXT CHECK (status IN ('pending', 'delivered')) NOT NULL,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm, yarn, or npm
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Bilal0347/Trendies-Task.git
   cd trendies-task
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   yarn install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Install and configure shadcn/ui:
   ```bash
   # Install shadcn/ui CLI
   pnpm add -D @shadcn/ui
   # or
   yarn add -D @shadcn/ui
   # or
   npm install -D @shadcn/ui

   # Initialize shadcn/ui
   pnpm dlx shadcn-ui@latest init
   ```

5. Add components as needed:
   ```bash
   pnpm dlx shadcn-ui@latest add button
   pnpm dlx shadcn-ui@latest add card
   pnpm dlx shadcn-ui@latest add dialog
   pnpm dlx shadcn-ui@latest add toast
   pnpm dlx shadcn-ui@latest add badge
   ```

6. Run the development server:
   ```bash
   pnpm dev
   # or
   yarn dev
   # or
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── my-orders/      # Orders page
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── badge.tsx
│   ├── Rating.tsx     # Rating component
│   └── ReviewModal.tsx # Review modal
└── lib/               # Utility functions
    ├── auth.ts        # Authentication helpers
    └── utils.ts       # General utilities
```

## Potential Improvements

1. **Performance**
   - Implement server-side caching for frequently accessed data
   - Add loading states and skeleton screens
   - Optimize image loading and delivery

2. **Features**
   - Add order filtering and search functionality
   - Implement order history pagination
   - Add user profile management
   - Enable social sharing of reviews

3. **Testing**
   - Add unit tests for components
   - Implement integration tests
   - Add end-to-end testing

4. **Security**
   - Implement rate limiting for API routes
   - Add input validation and sanitization
   - Enhance error handling and logging

5. **User Experience**
   - Add order tracking notifications
   - Implement a wishlist feature
   - Add product recommendations
   - Enhance mobile responsiveness


