-- 1. Drop existing public policies if they exist to start fresh
DROP POLICY IF EXISTS "Allow public read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert access" ON public.contacts;
DROP POLICY IF EXISTS "Allow public delete access" ON public.contacts;

-- Also drop newer policies just in case this is run multiple times
DROP POLICY IF EXISTS "Allow admin select" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert" ON public.contacts;
DROP POLICY IF EXISTS "Allow admin delete" ON public.contacts;

-- 2. Make sure RLS is enabled on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create public INSERT policy (anyone can submit a contact)
CREATE POLICY "Allow public insert" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- 4. Create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Create helper function to check if the current user is an admin
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

-- 7. Create admin-only policies for contacts
CREATE POLICY "Allow admin select" 
ON public.contacts 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Allow admin delete" 
ON public.contacts 
FOR DELETE 
USING (public.is_admin());

-- 8. Create select policy for admin_users table (users can read their own profile)
DROP POLICY IF EXISTS "Allow users to read their own admin profile" ON public.admin_users;
CREATE POLICY "Allow users to read their own admin profile"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);
