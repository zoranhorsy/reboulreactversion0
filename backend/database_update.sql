-- Check if the column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='size_chart') THEN
        ALTER TABLE products ADD COLUMN size_chart JSONB;
    END IF;
END $$;

