# Airport Weather Delay Analyzer - Design Document

## 1. Overview

A command-line Python program that visualizes the relationship between weather conditions and flight delays at US airports. Users select an airport, date range, and weather metric to see a dual-axis chart showing delays overlaid with weather data.

## 2. Architecture

```
src/
├── main.py           # Entry point, user interaction
├── data_loader.py    # CSV loading, joining
├── validators.py     # Input validation
└── chart_generator.py # Matplotlib charts
```

**Data Flow:**
```
CSV Files → data_loader.py → main.py (filter) → chart_generator.py → Display
```

## 3. Data Pipeline

**Source Files (in data-5-days/):**
- `airport_codes.csv` - IATA to ICAO mapping (ORD → KORD)
- `daily_flight_delays.csv` - Delays by airport/date (YYYYMMDD format)
- `daily_weather.csv` - Weather by station/date (MM/DD/YYYY format)

**Transformations:**
1. Convert dates to datetime objects
2. Map IATA codes to ICAO for joining
3. Handle missing mappings (SFO, PHX) using pattern: ICAO = 'K' + IATA
4. Join on airport code + date

## 4. User Interface

```
Available airports: ATL, DEN, DFW, JFK, LAX, MIA, ORD, PHX, SEA, SFO
Data available from 2024-01-01 to 2024-01-05

Enter airport code: ORD
Enter start date (YYYY-MM-DD): 2024-01-01
Enter end date (YYYY-MM-DD): 2024-01-05

Weather metrics:
  1. Precipitation
  2. Wind
  3. Visibility
  4. Temperature

Select weather metric (1-4 or name): 1

[Chart displays]

Analyze another? (y/n):
```

Invalid inputs prompt for re-entry with guidance.

## 5. Chart Design

**Dual-axis chart:**
- Left Y-axis: Departure delay (blue), arrival delay (green)
- Right Y-axis (orange/red): Weather metric
- X-axis: Dates
- Precipitation shown as bars; other metrics as lines
- Single day data: markers shown at data points for visibility

## 6. Key Decisions

- **Functional approach** - simpler than classes for this scope
- **Hardcoded SFO/PHX mappings** - more robust than failing on missing data
- **Warn on missing values** - plot available data, inform user
- **Re-prompt on errors** - no crashes from invalid input

## 7. Dependencies

pandas, matplotlib, pytest (already in requirements.txt)

## 8. Limitations

- 5 days of data (Jan 1-5, 2024)
- ~10 airports
- One weather metric per chart
