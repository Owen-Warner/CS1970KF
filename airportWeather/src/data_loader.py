import pandas as pd
from datetime import datetime


# Load airport codes CSV with IATA to ICAO mapping.
def load_airport_codes(filepath):
    return pd.read_csv(filepath)


# Load flight delays CSV and convert date format.
def load_flight_delays(filepath):
    df = pd.read_csv(filepath)
    df['date'] = pd.to_datetime(df['fl_date'], format='%Y%m%d')
    return df


# Load weather CSV and convert date format.
def load_weather_data(filepath):
    df = pd.read_csv(filepath)
    df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y')
    return df


# Create dict mapping IATA codes to ICAO codes.
def create_iata_to_icao_mapping(airport_codes_df):
    mapping = dict(zip(airport_codes_df['iata_code'], airport_codes_df['icao_code']))
    # Add missing airports (not in airport_codes.csv)
    mapping['SFO'] = 'KSFO'
    mapping['PHX'] = 'KPHX'
    return mapping


# Get sorted list of unique airport codes from flight data.
def get_available_airports(flight_df):
    return sorted(flight_df['airport_code'].unique().tolist())


# Get min and max dates from flight data.
def get_date_range(flight_df):
    return flight_df['date'].min(), flight_df['date'].max()


# Join flight and weather data on airport and date.
def merge_flight_weather_data(flight_df, weather_df, iata_to_icao):
    flight_df = flight_df.copy()
    flight_df['icao_code'] = flight_df['airport_code'].map(iata_to_icao)

    merged = pd.merge(
        flight_df,
        weather_df,
        left_on=['icao_code', 'date'],
        right_on=['station_id', 'date'],
        how='left'
    )
    return merged


# Filter merged data for specific airport and date range.
def filter_data(merged_df, airport, start_date, end_date):
    mask = (
        (merged_df['airport_code'] == airport) &
        (merged_df['date'] >= start_date) &
        (merged_df['date'] <= end_date)
    )
    return merged_df[mask].sort_values('date')
