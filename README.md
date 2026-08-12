# Supabase Contact Manager

## Project Overview
Contact Space is a modern, responsive, and secure Contact Manager web application built with React, Vite, and Supabase. The app allows users to submit messages through a contact form and manage contacts in real-time, pulling directly from a secure database with Row Level Security (RLS) enabled.

## Features
- **Modern Clean UI**: Sleek dark-mode aesthetic with custom glassmorphism styling and smooth micro-animations.
- **Client-Side Validation**: Dynamic checks for empty fields and invalid email formats before submission.
- **Database Integration**: Fully wired up with Supabase database for real-time contact management.
- **Secure Architecture**: Environment variable configuration to prevent leaking API keys in the codebase.
- **Custom Confirmation Modals**: Deleting items triggers a custom-styled visual confirmation overlay.
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
│   │   ├── ContactForm.jsx    # Contact submission form with validation
│   │   ├── ContactItem.jsx    # Individual contact card component
│   │   ├── ContactList.jsx    # Contact grid and empty/loading states
│   ├── lib/
│   │   └── supabase.js         # Supabase client initialization
│   ├── App.jsx                 # Central application state manager
│   ├── main.jsx                # Application root entrypoint
│   └── index.css               # Core CSS variables, typography, layouts
├── .env.example                # Template for environment variables
├── index.html                  # HTML template with SEO tags and Web Fonts
├── package.json                # Project dependencies and script declarations
├── vite.config.js              # Vite bundler and path configurations
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
To run this application, you must set up the `contacts` table in your Supabase project with the following columns:
- `id`: bigint (identity / auto-increment, primary key)
- `name`: text (required)
- `email`: text (required)
- `message`: text (required)
- `created_at`: timestamptz (default: `now()`)

## RLS Policies
Ensure Row Level Security (RLS) is enabled for the `contacts` table, and configure the policies below to authorize public access:

```sql
-- Create Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Access (Read Contacts)
CREATE POLICY "Allow public read access" 
ON public.contacts FOR SELECT USING (true);

-- 2. INSERT Access (Create Contacts)
CREATE POLICY "Allow public insert access" 
ON public.contacts FOR INSERT WITH CHECK (true);

-- 3. DELETE Access (Remove Contacts)
CREATE POLICY "Allow public delete access" 
ON public.contacts FOR DELETE USING (true);
```

## Development
To start the hot-reloading development server locally:
```bash
npm run dev
```
The server will boot by default on [http://localhost:5173/](http://localhost:5173/).

## Production Build
To test the production compilation locally:
```bash
npm run build
```
This command compiles the React code and outputs static assets into the `dist/` directory, optimized and ready for production.

To preview the build:
```bash
npm run preview
```

## GitHub Pages Deployment
This application is configured for deployment using GitHub Actions. Upon pushing to the `main` branch, the workflow automates build and deployment to GitHub Pages.

### Setup Instructions:
1. Go to your repository settings on GitHub.
2. Under **Pages**, set **Build and deployment -> Source** to **GitHub Actions**.
3. Under **Settings -> Secrets and variables -> Actions**, add your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Commit your changes and push to the `main` branch.

## Live URL
The application will be hosted and available at:
[https://monowarcs.github.io/supabase-contact-manager/](https://monowarcs.github.io/supabase-contact-manager/)
