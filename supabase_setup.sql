-- 1. Create the contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Policy for SELECT: Allow anonymous/public read access to contacts
CREATE POLICY "Allow public read access" 
ON public.contacts 
FOR SELECT 
USING (true);

-- Policy for INSERT: Allow anonymous/public to insert new contacts
CREATE POLICY "Allow public insert access" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Policy for DELETE: Allow anonymous/public to delete contacts
CREATE POLICY "Allow public delete access" 
ON public.contacts 
FOR DELETE 
USING (true);
