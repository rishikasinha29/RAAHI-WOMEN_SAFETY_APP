-- news_crime_seed.sql

-- News-derived records gathered from public news reports.

-- All are unverified until corroborated by an official source.

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Hindustan Times',
    'https://www.hindustantimes.com/cities/delhi-news/18yrold-raped-impregnated-case-filed-101719252095716.html',
    DATE '2024-06-25',
    DATE '2024-06-25',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Mehrauli')
        LIMIT 1
    ),
    NULL,
    'rape/sexual assault',
    '18-yr-old raped, impregnated; case filed',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-06-25',
    '18-yr-old raped, impregnated; case filed',
    'Mehrauli',
    FALSE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Delhi')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/delhi/gangrape-survivor-attacked-threatened-delhi-9615347/',
    DATE '2024-10-09',
    DATE '2024-10-11',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Sagar Pur')
        LIMIT 1
    ),
    NULL,
    'attack/threat against rape survivor',
    'Gangrape survivor attacked, threatened to withdraw case in Delhi',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-10-11',
    'Gangrape survivor attacked, threatened to withdraw case in Delhi',
    'Sagar Pur',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Delhi')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Tribune',
    'https://www.tribuneindia.com/news/delhi/8-year-old-strangled-for-resisting-rape-in-delhis-vasant-kunj/',
    DATE '2024-12-23',
    DATE '2024-12-24',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Vasant Vihar / Shankar Vihar')
        LIMIT 1
    ),
    NULL,
    'attempted rape / homicide',
    '8-year-old strangled for resisting rape in Delhi’s Vasant Kunj',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-12-24',
    '8-year-old strangled for resisting rape in Delhi’s Vasant Kunj',
    'Vasant Vihar / Shankar Vihar',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Delhi')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'ThePrint (PTI)',
    'https://theprint.in/india/woman-raped-by-neighbour-in-front-of-daughter-in-delhi-farmhouse/2602183/',
    DATE '2025-04-20',
    DATE '2025-04-24',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Swaroop Nagar / Kadipur')
        LIMIT 1
    ),
    NULL,
    'rape',
    'Woman raped by neighbour in front of daughter in Delhi farmhouse',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-04-24',
    'Woman raped by neighbour in front of daughter in Delhi farmhouse',
    'Swaroop Nagar / Kadipur',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Delhi')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'eSakal',
    'https://www.esakal.com/mumbai/gang-rape-csmt-mumbai-behind-taxi-woman-abduction-mra-police-crime-news-marathi-srk94',
    DATE '2024-10-03',
    DATE '2024-10-04',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('CSMT area')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    '29-year-old woman allegedly gang-raped near CSMT',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-10-04',
    '29-year-old woman allegedly gang-raped near CSMT',
    'CSMT area',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Mumbai')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/mumbai/mumbai-man-lodges-missing-person-complaint-arrested-after-daughter-alleges-she-was-raped-9601545/',
    DATE '2024-10-02',
    DATE '2024-10-03',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Central Mumbai / Mahalaxmi')
        LIMIT 1
    ),
    NULL,
    'rape / POCSO',
    'Mumbai man arrested after daughter alleges rape',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-10-03',
    'Mumbai man arrested after daughter alleges rape',
    'Central Mumbai / Mahalaxmi',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Mumbai')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/mumbai/mumbai-driver-stops-drink-water-woman-assault-disrobe-10866894/',
    DATE '2026-09-06',
    DATE '2026-09-07',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Chembur / Navi Mumbai service road')
        LIMIT 1
    ),
    NULL,
    'sexual assault / molestation',
    'Driver stops to drink water, then allegedly attempts to assault and disrobe Mumbai woman',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2026-09-07',
    'Driver stops to drink water, then allegedly attempts to assault and disrobe Mumbai woman',
    'Chembur / Navi Mumbai service road',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Mumbai')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'India Today',
    'https://www.indiatoday.in/cities/bengaluru/story/woman-sexual-assault-gang-raped-by-four-in-bengaluru-2683683-2025-02-21',
    DATE '2025-02-20',
    DATE '2025-02-22',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Koramangala')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    'Bengaluru woman allegedly gangraped at hotel in Koramangala',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-02-22',
    'Bengaluru woman allegedly gangraped at hotel in Koramangala',
    'Koramangala',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bengaluru')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'News9Live',
    'https://www.news9live.com/india/caught-on-cam-man-sexually-assaults-woman-on-bengaluru-street-2837424',
    DATE '2025-04-04',
    DATE '2025-04-07',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Suddagunte Palya / BTM Layout')
        LIMIT 1
    ),
    NULL,
    'sexual harassment',
    'Woman sexually harassed on Bengaluru street',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-04-07',
    'Woman sexually harassed on Bengaluru street',
    'Suddagunte Palya / BTM Layout',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bengaluru')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Malayala Manorama',
    'https://www.manoramaonline.com/news/latest-news/2025/08/31/woman-sexually-harassed-looted-of-cash-by-masked-man-in-bengaluru.html',
    DATE '2025-08-31',
    DATE '2025-08-31',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Gangothri Circle')
        LIMIT 1
    ),
    NULL,
    'sexual assault / robbery',
    'Woman sexually assaulted and robbed in Bengaluru PG',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-08-31',
    'Woman sexually assaulted and robbed in Bengaluru PG',
    'Gangothri Circle',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bengaluru')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Siasat',
    'https://www.siasat.com/five-year-old-raped-in-hyderabads-jawaharnagar-area-one-arrested-3141680/',
    DATE '2024-12-01',
    DATE '2024-12-03',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Jawaharnagar')
        LIMIT 1
    ),
    NULL,
    'rape / POCSO',
    'Five-year-old allegedly raped in Hyderabad''s Jawaharnagar area',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-12-03',
    'Five-year-old allegedly raped in Hyderabad''s Jawaharnagar area',
    'Jawaharnagar',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Hyderabad')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The New Indian Express',
    'https://www.newindianexpress.com/cities/hyderabad/2025/Apr/01/hyderabad-cab-driver-rapes-25-year-old-german-woman-on-way-to-airport-probe-on',
    DATE '2025-03-31',
    DATE '2025-04-02',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Mamidipally / Pahadishareef')
        LIMIT 1
    ),
    NULL,
    'rape',
    'Cab driver allegedly raped German woman in Mamidipally',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-04-02',
    'Cab driver allegedly raped German woman in Mamidipally',
    'Mamidipally / Pahadishareef',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Hyderabad')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/pune/gang-rape-21-year-old-woman-pune-bopdev-ghat-fir-lodged-9603014/',
    DATE '2024-10-03',
    DATE '2024-10-04',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Bopdev Ghat')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    '22-year-old woman allegedly gangraped at Bopdev Ghat',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-10-04',
    '22-year-old woman allegedly gangraped at Bopdev Ghat',
    'Bopdev Ghat',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Pune')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/pune/pune-19-year-old-woman-gang-raped-at-knifepoint-in-village-9866301/',
    DATE '2025-03-01',
    DATE '2025-03-03',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Shirur taluka / Ranjangaon')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    '19-year-old woman allegedly gangraped at knifepoint in Pune district',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-03-03',
    '19-year-old woman allegedly gangraped at knifepoint in Pune district',
    'Shirur taluka / Ranjangaon',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Pune')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The New Indian Express',
    'https://www.newindianexpress.com/cities/chennai/2025/Jul/11/temple-priest-held-for-alleged-sexual-assault-in-chennai',
    DATE '2025-07-10',
    DATE '2025-07-11',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Pallikaranai / Vadapalani')
        LIMIT 1
    ),
    NULL,
    'rape',
    'Temple priest held for alleged sexual assault in Chennai',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-07-11',
    'Temple priest held for alleged sexual assault in Chennai',
    'Pallikaranai / Vadapalani',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Chennai')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Times of India',
    'https://timesofindia.indiatimes.com/city/chennai/anna-univ-rape-accused-had-50-unusual-videos-in-phone/articleshow/116722955.cms',
    DATE '2024-12-23',
    DATE '2024-12-28',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Kotturpuram / Anna University')
        LIMIT 1
    ),
    NULL,
    'rape / sexual assault',
    'Anna University sexual assault case',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-12-28',
    'Anna University sexual assault case',
    'Kotturpuram / Anna University',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Chennai')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Hindustan Times',
    'https://www.hindustantimes.com/india-news/kolkata-woman-gang-raped-by-2-acquaintances-during-birthday-celebration-101757239969334-amp.html',
    DATE '2025-09-05',
    DATE '2025-09-07',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Regent Park / Haridevpur')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    '20-year-old allegedly gang-raped by acquaintances in Kolkata',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-09-07',
    '20-year-old allegedly gang-raped by acquaintances in Kolkata',
    'Regent Park / Haridevpur',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Kolkata')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'The Indian Express',
    'https://indianexpress.com/article/cities/kolkata/four-arrested-for-alleged-gang-rape-of-woman-whom-one-accused-met-on-facebook-9656799/',
    DATE '2024-10-31',
    DATE '2024-11-07',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Garia / Dhalua')
        LIMIT 1
    ),
    NULL,
    'gang rape',
    'Woman allegedly gang raped after meeting Facebook friend',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-11-07',
    'Woman allegedly gang raped after meeting Facebook friend',
    'Garia / Dhalua',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Kolkata')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Free Press Journal',
    'https://www.freepressjournal.in/bhopal/two-incidents-of-sexual-assault-reported-in-bhopal-accused-in-both-cases-still-absconding',
    DATE '2024-08-31',
    DATE '2024-09-25',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Aishbagh')
        LIMIT 1
    ),
    NULL,
    'rape / blackmail',
    'Sexual assault reported from Aishbagh area',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-09-25',
    'Sexual assault reported from Aishbagh area',
    'Aishbagh',
    FALSE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bhopal')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Free Press Journal',
    'https://www.freepressjournal.in/bhopal/two-incidents-of-sexual-assault-reported-in-bhopal-accused-in-both-cases-still-absconding',
    DATE '2024-08-31',
    DATE '2024-09-25',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Nishatpura / Karond')
        LIMIT 1
    ),
    NULL,
    'rape',
    'Sexual assault reported from Nishatpura/Karond area',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-09-25',
    'Sexual assault reported from Nishatpura/Karond area',
    'Nishatpura / Karond',
    FALSE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bhopal')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'India Today',
    'https://www.indiatoday.in/amp/india/story/bhopal-coaching-centre-operator-arrested-sexually-assaulting-2-sisters-extra-classes-2646754-2024-12-08',
    DATE '2024-12-07',
    DATE '2024-12-08',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Chhola')
        LIMIT 1
    ),
    NULL,
    'rape / sexual assault / POCSO',
    'Tutor allegedly sexually assaulted two sisters in Chhola police-station area',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2024-12-08',
    'Tutor allegedly sexually assaulted two sisters in Chhola police-station area',
    'Chhola',
    TRUE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bhopal')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Times of India',
    'https://timesofindia.indiatimes.com/city/bhopal/raped-blackmailed-by-hoodlum-married-woman-goes-to-cops/articleshow/119225375.cms',
    DATE '2023-04-01',
    DATE '2025-03-20',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Bag Sewania')
        LIMIT 1
    ),
    NULL,
    'rape / blackmail',
    'Woman reports alleged rape and blackmail; Bag Sewania police case',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-03-20',
    'Woman reports alleged rape and blackmail; Bag Sewania police case',
    'Bag Sewania',
    FALSE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bhopal')
ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO crime_incidents (
    source, source_url, incident_date, reported_date,
    city_id, locality_id, police_station,
    crime_category, crime_description,
    latitude, longitude, location_accuracy,
    verification_status, source_type, source_published_date,
    source_title, locality_name_raw, news_scoring_eligible
)
SELECT
    'Times of India',
    'https://timesofindia.indiatimes.com/city/bhopal/man-rapes-27-yr-old-on-marriage-pretext/articleshow/120595234.cms',
    DATE '2023-01-01',
    DATE '2025-04-25',
    c.city_id,
    (
        SELECT l.locality_id
        FROM locations_locality l
        WHERE l.city_id = c.city_id
          AND LOWER(l.locality_name) = LOWER('Piplani / Deep Mohini Colony')
        LIMIT 1
    ),
    NULL,
    'rape',
    'Bhopal woman alleges rape at rented home in Piplani area',
    NULL,
    NULL,
    'locality',
    'unverified',
    'news',
    DATE '2025-04-25',
    'Bhopal woman alleges rape at rented home in Piplani area',
    'Piplani / Deep Mohini Colony',
    FALSE
FROM locations_city c
WHERE LOWER(c.city_name) = LOWER('Bhopal')
ON CONFLICT (incident_id) DO NOTHING;