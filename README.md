# Supabase Contact Manager

## Project Overview
Contact Space is a modern, responsive, and secure Contact Manager web application built with React, Vite, and Supabase. It features two distinct user experiences:
1. **Public Contact Form**: A clean, public-facing portal where visitors can submit messages securely without exposure to existing records.
2. **Guarded Admin Dashboard**: A protected, authenticated area where administrators can view all contacts, track total message counts, submit messages manually, and delete entries.

## Features
- **Public/Private Split**: Visitors can only submit inquiries. The database records list is hidden and secure behind credentials.
- **Supabase Authentication**: Integrated securely via Supabase Auth (sessions are fully restored on reload).
- **Profile-Gated Administration**: Authenticated users must be present in the `admin_users` database profile table to access the workstation.
- **Row Level Security (RLS)**: Enforces access rules directly inside the database—public select/delete is blocked; only registered admins can view or remove records.
- **Vibrant Responsive UI**: Immersive dark glassmorphic styling, glowing input fields, and smooth micro-animations.
- **Custom Modals**: Custom confirmation prompt transitions for deleting contact items.
- **Automated Deployment**: GitHub Actions workflow to build and deploy to GitHub Pages automatically.

## Tech Stack
- **Frontend**: React 19, JavaScript (ES6+), Vite 8
- **Styling**: Vanilla CSS with HSL variables
- **Backend/Database**: Supabase
- **Icons**: Lucide React
- **Deployment**: GitHub Pages via GitHub Actions

## Project Structure
```text
supabase-contact-manager/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── assets/                 # Application asset directory
│   ├── components/
│   │   ├── ContactForm.jsx     # Contact submission form with validation
│   │   ├── ContactItem.jsx     # Individual contact card component
│   │   ├── ContactList.jsx     # Contact grid and empty/loading states
│   │   ├── AdminLogin.jsx      # Admin login form with credentials translation
│   │   ├── AdminDashboard.jsx  # Layout for logged-in administrators
│   │   ├── ProtectedRoute.jsx  # Security wrapper component checking admin profiles
│   │   └── Navigation.jsx      # Sticky navbar with active states and logout controls
│   ├── lib/
│   │   └── supabase.js         # Supabase client initialization
│   ├── App.jsx                 # Central routing and session manager
│   ├── main.jsx                # Application root entrypoint
│   └── index.css               # Core CSS variables, typography, layouts
├── .env.example                # Template for environment variables
├── index.html                  # HTML template with SEO tags and Web Fonts
├── package.json                # Project dependencies and script declarations
├── vite.config.js              # Vite bundler and path configurations
├── supabase_setup.sql          # Initial database schema setup
├── supabase_admin_setup.sql    # Security setup (admin_users table & secure RLS)
└── README.md                   # Setup and usage documentation
```

## Local Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/monowarcs/supabase-contact-manager.git
   cd supabase-contact-manager
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Supabase project credentials.

## Environment Variables
The application relies on the following two environment variables:
- `VITE_SUPABASE_URL`: Your Supabase Project API URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Project Public Anonymous Key.

*Note: Do NOT use or configure a service-role key on the frontend.*

## Supabase Database
To run the extended administration application, you must set up the `contacts` table and the `admin_users` profile table.

### 1. Contacts Table Structure
* `id`: bigint (identity / auto-increment, primary key)
* `name`: text (required)
* `email`: text (required)
* `message`: text (required)
* `created_at`: timestamptz (default: `now()`)

### 2. Admin Users Table Structure
* `id`: bigint (identity / auto-increment, primary key)
* `user_id`: uuid (required, unique, foreign key referencing `auth.users(id)`)
* `username`: text (required, unique)
* `created_at`: timestamptz (default: `now()`)

---

## RLS Policies
Ensure Row Level Security (RLS) is enabled for both tables. Access rules are enforced at the database level:

- **Public Anonymous Users**: Can only perform `INSERT` on `contacts`. Reading (`SELECT`) and deleting (`DELETE`) are strictly denied.
- **Registered Administrators**: Can perform `SELECT`, `INSERT`, and `DELETE` on `contacts`.

### SQL Migration Setup
Run the following script in the **SQL Editor** on your Supabase dashboard to apply the security updates:

```sql
-- Create contacts table (if not exists)
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop old loose policies
DROP POLICY IF EXISTS "Allow public read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert access" ON public.contacts;
DROP POLICY IF EXISTS "Allow public delete access" ON public.contacts;

-- Create secure insert policy for everyone
CREATE POLICY "Allow public insert" ON public.contacts FOR INSERT WITH CHECK (true);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if auth user is in admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- Admin-only SELECT & DELETE policies
CREATE POLICY "Allow admin select" ON public.contacts FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin delete" ON public.contacts FOR DELETE USING (public.is_admin());

-- Read access policy for admin_users (read own entry)
CREATE POLICY "Allow users to read their own admin profile" 
ON public.admin_users FOR SELECT USING (auth.uid() = user_id);
```

---

## Development
To start the hot-reloading development server locally:
```bash
npm run dev
```
The server will boot by default on [http://localhost:5173/](http://localhost:5173/).

## Production Build
To compile the static bundle for production:
```bash
npm run build
```
The output assets will be generated inside the `dist/` directory.

To preview the build locally:
```bash
npm run preview
```

---

## GitHub Pages Deployment
This application is configured for deployment using GitHub Actions. Upon pushing to the `main` branch, the workflow automates build and deployment to GitHub Pages.

### Setup Instructions:
1. Go to your repository settings on GitHub.
2. Under **Pages**, set **Build and deployment -> Source** to **GitHub Actions**.
3. Under **Settings -> Secrets and variables -> Actions**, add your Supabase credentials as repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Commit your changes and push to the `main` branch.

## Live URL
The application is hosted and available at:
[https://monowarcs.github.io/supabase-contact-manager/](https://monowarcs.github.io/supabase-contact-manager/)

> [!IMPORTANT]
> To avoid serving uncompiled code and a blank page, make sure your repository Settings -> Pages -> Build and deployment -> Source is configured to **GitHub Actions** rather than "Deploy from a branch".
