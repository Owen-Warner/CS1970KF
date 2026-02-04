# Flight Delay & Weather Data - Schema Documentation

## Overview

This dataset contains daily flight delay aggregates and weather observations for major US airports. Students must combine these data sources to analyze the relationship between weather conditions and flight delays.

## Files

### 1. `daily_flight_delays.csv`
Daily aggregated flight statistics from the Bureau of Transportation Statistics.

| Column | Type | Description |
|--------|------|-------------|
| airport_code | string | 3-letter FAA/IATA airport code |
| fl_date | integer | Flight date as YYYYMMDD |
| total_flights | integer | Number of flights that day |
| avg_dep_delay | float | Average departure delay in minutes |
| avg_arr_delay | float | Average arrival delay in minutes |
| cancelled | integer | Number of cancelled flights |
| diverted | integer | Number of diverted flights |

### 2. `daily_weather.csv`
Daily weather summaries from NOAA Local Climatological Data.

| Column | Type | Description |
|--------|------|-------------|
| station_id | string | 4-letter ICAO station identifier |
| station_name | string | Full station name |
| date | string | Date as MM/DD/YYYY |
| temp_max_f | float | Maximum temperature (°F) |
| temp_min_f | float | Minimum temperature (°F) |
| precipitation_in | float | Total precipitation (inches) |
| wind_avg_mph | float | Average wind speed (mph) |
| wind_max_mph | float | Maximum wind gust (mph) |
| visibility_mi | float | Average visibility (miles) |

### 3. `airport_codes.csv`
Reference table mapping airport identifiers.

| Column | Type | Description |
|--------|------|-------------|
| iata_code | string | 3-letter IATA/FAA code |
| icao_code | string | 4-letter ICAO code |
| airport_name | string | Full airport name |
| city | string | City |
| state | string | State abbreviation |
| latitude | float | Latitude |
| longitude | float | Longitude |

---

## Data Quality Notes

### Known Issues Students Must Handle

1. **Date format mismatch**: Flight data uses `YYYYMMDD` (integer), weather data uses `MM/DD/YYYY` (string)

2. **Airport code mismatch**: Flight data uses 3-letter FAA codes (e.g., `ORD`), weather data uses 4-letter ICAO codes (e.g., `KORD`)

3. **Missing mapping entries**: Two airports in the flight/weather data (SFO, PHX) are NOT in the airport_codes.csv mapping file. Students must either:
   - Add these entries manually
   - Infer the ICAO code pattern (prepend 'K' to FAA code)
   - Find an external data source

4. **Missing weather values**: Some precipitation readings are missing for SFO (fog days where rain gauge wasn't relevant). These appear as empty cells, not zeros.

5. **Inconsistent naming**: Station names in weather file don't exactly match airport names in mapping file (e.g., "CHICAGO OHARE INTL AP" vs "Chicago O'Hare International")

---

## Suggested Join Strategy

```
flights.airport_code  →  mapping.iata_code  →  mapping.icao_code  →  weather.station_id
flights.fl_date (parse YYYYMMDD)  →  weather.date (parse MM/DD/YYYY)
```

Or, if students notice the pattern:
```
flights.airport_code  →  'K' + airport_code  →  weather.station_id
```

---

## Expected Output

After successful joining, students should be able to answer questions like:
- What was the average delay at ORD on days with >0.5" precipitation?
- How does visibility correlate with delays at SFO?
- Which airport shows the strongest weather-delay relationship?
