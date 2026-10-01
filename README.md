# ANZEN – Safety-Aware Navigation and Anonymous Hazard Reporting System

ANZEN is a full-stack safety-aware navigation platform designed to help users identify safer travel routes by combining conventional route information with crime data, community-reported hazards, spatial analysis, and real-time navigation.

The system generates multiple route alternatives and evaluates their safety using available official crime statistics and community hazard information. It also provides anonymous hazard reporting, live navigation, automatic rerouting, and an emergency SOS workflow.

> **Project:** ANZEN – Safety-Aware Navigation and Anonymous Hazard Reporting System  
> **Type:** B.Tech Capstone Project  
> **Domain:** Women Safety, GIS, Navigation, Cybersecurity, Full-Stack Development  
> **Database:** PostgreSQL + PostGIS  
> **Routing:** OSRM  
> **Maps:** OpenStreetMap + Leaflet  

---

## Features

### 🗺️ Safety-Aware Navigation

- Search for source and destination locations.
- Use the browser's current location as the starting point.
- Generate multiple driving routes using OSRM.
- Compare route distance, duration, and safety information.
- Calculate route-level and segment-level safety information.
- Display safety classifications using:
  - 🟢 Green
  - 🟡 Yellow
  - 🟠 Orange
  - 🔴 Red

### 📊 Crime Data Integration

- Integrates official NCRB crime data.
- Includes Crime Against Women data for metropolitan cities for 2021–2023.
- Stores crime statistics using a spatial database.
- Displays official crime information on the interactive map.
- Supports crime rate and chargesheeting-rate information where available.
- Clearly distinguishes city-level official statistics from exact incident locations.

### ⚠️ Community Hazard Reporting

Users can report safety-related hazards such as:

- Harassment
- Dark Alley
- Bad Crowd
- Poor Lighting
- Other

Reports can include:

- Location
- Description
- Severity
- Time of occurrence
- Anonymous reporting option

### 🧭 Live Navigation

- Real-time browser-based location tracking.
- Displays the user's current position.
- Provides navigation instructions.
- Calculates navigation metrics such as distance and ETA.
- Detects off-route movement.
- Supports automatic route recalculation.

### 🚨 Emergency SOS

- Emergency SOS workflow.
- Attempts to obtain the user's current location.
- Supports emergency communication through WhatsApp.
- Uses emergency number configuration for the application.
- Provides fallback handling when location services are unavailable.

### 🔐 Authentication and Security

- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected API routes.
- Input validation using Zod.
- CORS configuration.
- Helmet security headers.
- API rate limiting.
- Admin authentication and moderation controls.

### 🛡️ Admin and Moderation

- Admin dashboard.
- View reported hazards.
- Update hazard status.
- Delete inappropriate or invalid reports.
- Monitor application-level safety data.

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │      ANZEN User      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   + Leaflet Map      │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    ├──────────────────────┤
                    │ Authentication       │
                    │ Geocoding            │
                    │ Routing              │
                    │ Safety Analysis      │
                    │ Hazard Reports       │
                    │ SOS                  │
                    │ Admin                │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐              ┌─────────────────┐
       │ PostgreSQL      │              │ External APIs   │
       │ + PostGIS       │              │                 │
       │                 │              │ Nominatim       │
       │ Users           │              │ OSRM             │
       │ Hazards         │              │ OpenStreetMap   │
       │ Crime Data      │              └─────────────────┘
       │ Reports         │
       └─────────────────┘
```

---

## Safety Analysis

ANZEN combines multiple sources of safety information rather than relying only on route distance or travel time.

The current safety model combines:

```text
Crime Risk   ────────┐
                     ├──► Combined Safety Risk
Hazard Risk  ────────┘
```

Current weighting:

```text
Crime Risk   = 60%
Hazard Risk  = 40%
```

The resulting risk is converted into a safety score:

```text
Safety Score = 100 - Combined Risk
```

Current classification thresholds:

```text
Score < 40       → Red
40–64            → Orange
65–79            → Yellow
80–100           → Green
```

Community hazard analysis considers factors including:

- Severity
- Proximity
- Recency
- Confidence

The system also performs segment-level safety analysis so that risk information can be associated with specific portions of a route.

---

## Official Crime Data

ANZEN integrates official NCRB data from:

**Crime in India 2023 – Table 3B.1**

Dataset:

> Crime against Women (IPC+SLL) in Metropolitan Cities – 2021–2023

The current imported dataset contains:

```text
2021 → 34 metropolitan city records
2022 → 34 metropolitan city records
2023 → 34 metropolitan city records

Total → 102 city-year records
```

The database stores:

- City
- State
- Crime category
- Year
- Crime count
- Population
- Crime rate
- Chargesheeting rate
- Intensity score
- Spatial geometry
- Source information

### Important Data Limitation

The NCRB dataset used by the current implementation is **city-level data**. Therefore, the crime layer should not be interpreted as showing the exact location where an individual crime occurred.

ANZEN uses the official geographic resolution available in the dataset rather than creating artificial street-level crime hotspots.

---

## Technology Stack

### Frontend

- React 18
- Vite
- JavaScript
- Tailwind CSS
- Leaflet
- React Leaflet
- Lucide React

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- Zod
- Helmet
- CORS
- Express Rate Limit

### Database

- PostgreSQL
- PostGIS

### External Services

- OpenStreetMap
- Nominatim
- OSRM

### Development and Deployment

- Docker
- Docker Compose
- Git
- GitHub

---

## Project Structure

```text
RAAHI-WOMEN_SAFETY_APP/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── server/
│   ├── index.js
│   ├── db.js
│   ├── auth.js
│   ├── middleware.js
│   ├── validation.js
│   ├── scoring.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── geocode.js
│   │   ├── routes.js
│   │   ├── hazards.js
│   │   ├── reports.js
│   │   ├── sos.js
│   │   ├── admin.js
│   │   ├── officialCrime.js
│   │   └── locations.js
│   │
│   └── services/
│       ├── geocoding.js
│       ├── routing.js
│       ├── hazardAnalysis.js
│       ├── crimeAnalysis.js
│       └── routeSafety.js
│
├── db/
│   ├── migrations/
│   ├── seed.sql
│   ├── seed_locations.sql
│   └── news_crime_seed.sql
│
├── scripts/
│   ├── importOfficialCrime.js
│   ├── importOfficialCrime2021_2023.js
│   └── geocodeNewsCrime.js
│
├── data/
│   ├── news_crime_incidents.csv
│   ├── README_news_crime.md
│   └── ncrb_crime_against_women_2021_2023.xlsx
│
├── tests/
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── vite.config.js
├── package.json
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rishikasinha29/RAAHI-WOMEN_SAFETY_APP.git
cd RAAHI-WOMEN_SAFETY_APP
```

### 2. Install Dependencies

```bash
npm install
```

---

## Database Setup

ANZEN uses PostgreSQL with PostGIS.

The project provides Docker configuration for the database.

Start the database:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

The PostgreSQL/PostGIS database should be available on:

```text
localhost:5432
```

Database configuration:

```text
Database: anzen
User: postgres
Password: postgres
```

---

## Environment Configuration

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anzen

JWT_SECRET=change-this-secret

CORS_ORIGIN=http://localhost:5173

EMERGENCY_NUMBER=112

NOMINATIM_URL=https://nominatim.openstreetmap.org

OSRM_URL=https://router.project-osrm.org

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password

VITE_EMERGENCY_NUMBER=112
VITE_WHATSAPP_SOS_NUMBER=91XXXXXXXXXX
```

> **Security:** Do not commit `.env` files or real credentials to GitHub.

---

## Running the Application

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The backend API runs on:

```text
http://localhost:5000
```

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/geocode` | Search and geocode locations |
| POST | `/api/routes/analyze` | Generate and analyze routes |
| GET | `/api/hazards` | Retrieve hazards |
| POST | `/api/reports` | Submit a hazard report |
| GET | `/api/reports/me` | Retrieve user's reports |
| DELETE | `/api/reports/:id` | Delete a report |
| GET | `/api/official-crime` | Retrieve official crime data |
| POST | `/api/sos` | Create SOS session |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve current user |
| POST | `/api/admin/login` | Admin authentication |

---

## Route Analysis Flow

```text
User enters Source and Destination
                │
                ▼
          Geocoding API
                │
                ▼
      Source + Destination
          Coordinates
                │
                ▼
             OSRM
                │
                ▼
       Multiple Route Options
                │
                ▼
       Route Safety Analysis
          ┌─────┴─────┐
          ▼           ▼
     Crime Data    Hazards
          │           │
          └─────┬─────┘
                ▼
        Combined Risk Score
                │
                ▼
         Safety Classification
                │
                ▼
        Routes displayed on Map
```

---

## Hazard Reporting Flow

```text
User
 │
 ▼
Open Report Interface
 │
 ▼
Select Hazard Category
 │
 ▼
Enter Description + Severity
 │
 ▼
Capture Location
 │
 ▼
Anonymous / Identified Report
 │
 ▼
Backend Validation
 │
 ▼
PostgreSQL + PostGIS
 │
 ▼
Hazard Analysis
 │
 ▼
Displayed on Safety Map
```

---

## Navigation Flow

```text
Route Selected
      │
      ▼
Start Navigation
      │
      ▼
Obtain Live Location
      │
      ▼
Track User Position
      │
      ▼
Calculate Navigation Metrics
      │
      ▼
Check Route Deviation
      │
      ├── On Route ─────► Continue Navigation
      │
      └── Off Route ────► Recalculate Route
```

---

## Security

ANZEN implements several application security mechanisms:

- JWT authentication
- Password hashing
- Input validation
- Protected API routes
- Role-based access for administrative functions
- CORS configuration
- HTTP security headers
- API rate limiting
- Server-side validation
- Environment-based secret management
- Anonymous reporting support

---

## Data and Privacy Considerations

ANZEN is designed to minimize unnecessary exposure of user information.

Important principles include:

- Hazard reports can be submitted anonymously.
- Authentication credentials are not stored in plaintext.
- Sensitive configuration values are stored using environment variables.
- Location data is used for navigation and safety functionality.
- Official crime statistics are represented according to their available geographic resolution.

---

## Current Implementation Status

The current implementation includes:

- React-based frontend
- Express backend
- PostgreSQL/PostGIS database
- User authentication
- Location search
- OSRM route generation
- Multiple route alternatives
- Community hazard reporting
- Spatial hazard analysis
- Official NCRB crime data integration
- City-level crime visualization
- Route safety scoring
- Segment-level safety analysis
- Live navigation
- Automatic rerouting
- SOS workflow
- Admin moderation
- API validation and security middleware

The project is under active development, and some interface and integration components may continue to be refined.

---

## Limitations

### Crime Data Resolution

The current official NCRB dataset is available at city level and does not provide exact street-level crime coordinates.

### External Services

The application depends on external services such as:

- Nominatim
- OSRM
- OpenStreetMap

Availability and response times may therefore vary.

### Browser Location

Live navigation depends on browser-supported geolocation and user permission.

### Safety Score Interpretation

The safety score is an analytical indicator generated from available datasets and reported hazards. It should not be interpreted as a guarantee of personal safety.

### Emergency Communication

WhatsApp-based SOS depends on device capabilities, internet connectivity, WhatsApp availability, and user permissions.

---

## Future Enhancements

- Real-time traffic integration
- Machine-learning-based risk prediction
- Higher-resolution official crime datasets
- Improved hazard verification
- Real-time hazard updates
- Adaptive safety scoring
- Offline navigation
- Dedicated Android/iOS application
- Enhanced emergency service integration
- Advanced route optimization
- Large-scale deployment monitoring
- Improved privacy and audit controls

---

## Project Team

**ANZEN – Safety-Aware Navigation and Anonymous Hazard Reporting System**

### Team Members

- Rishika Sinha – 23BCE10762
- Anshika Singh – 23BCE10768
- M.B. Pragathi – 23BCE11751
- Niharika Pandey – 23BCE11230
- Aditya Pandey – 23BCE10787

**VIT Bhopal University**

---

## Acknowledgement

This project was developed as part of the B.Tech Computer Science and Engineering capstone project at VIT Bhopal University.

The project makes use of open-source technologies and publicly available geographic and official statistical data to develop a prototype safety-aware navigation platform.

---

## License

This project is intended primarily for academic and research purposes.

Please review the licenses and usage policies of all external services, datasets, libraries, APIs, and map providers before deploying the system commercially.

---

## Repository

[GitHub Repository](https://github.com/rishikasinha29/RAAHI-WOMEN_SAFETY_APP)
