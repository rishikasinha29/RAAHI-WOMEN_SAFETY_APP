# ANZEN Location/Crime Database

Prepared from the supplied 53-city master and 133 locality reference records.

Tables:
- locations_city: 53-city master
- locations_locality: 133 locality/reference records
- crime_incidents: future incident-level records
- official_crime_areas: keep the existing NCRB/official statistics table separate

Integrity:
- No locality crime counts are fabricated.
- locality frequency_count is NULL and frequency_status=PENDING.
- Locality records are reference geography, not crime hotspots.
- Exact/approximate incident records belong in crime_incidents.
- City-level NCRB statistics must not be copied into locality rows.

Install with the existing Docker PostGIS database:
Get-Content .\004_locations.sql | docker exec -i anzen-postgis psql -U postgres -d anzen
Get-Content .\seed_locations.sql | docker exec -i anzen-postgis psql -U postgres -d anzen
