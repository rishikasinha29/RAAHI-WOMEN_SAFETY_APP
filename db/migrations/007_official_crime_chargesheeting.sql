ALTER TABLE official_crime_areas
ADD COLUMN IF NOT EXISTS chargesheeting_rate NUMERIC
CHECK (
    chargesheeting_rate IS NULL
    OR (
        chargesheeting_rate >= 0
        AND chargesheeting_rate <= 100
    )
);
