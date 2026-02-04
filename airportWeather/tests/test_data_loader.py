import pytest
import pandas as pd
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from data_loader import (
    load_airport_codes,
    load_flight_delays,
    load_weather_data,
    create_iata_to_icao_mapping,
    get_available_airports,
    get_date_range,
    merge_flight_weather_data,
    filter_data
)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data-5-days')


def test_load_airport_codes_returns_correct_columns():
    df = load_airport_codes(os.path.join(DATA_DIR, 'airport_codes.csv'))
    assert 'iata_code' in df.columns
    assert 'icao_code' in df.columns
    assert len(df) > 0


def test_load_flight_delays_date_conversion():
    df = load_flight_delays(os.path.join(DATA_DIR, 'daily_flight_delays.csv'))
    assert 'date' in df.columns
    assert pd.api.types.is_datetime64_any_dtype(df['date'])
    # Check a known date was converted correctly
    assert pd.Timestamp('2024-01-01') in df['date'].values


def test_load_weather_data_date_conversion():
    df = load_weather_data(os.path.join(DATA_DIR, 'daily_weather.csv'))
    assert 'date' in df.columns
    assert pd.api.types.is_datetime64_any_dtype(df['date'])
    assert pd.Timestamp('2024-01-01') in df['date'].values


def test_create_iata_to_icao_mapping_includes_sfo_phx():
    # Create minimal test dataframe
    df = pd.DataFrame({
        'iata_code': ['ORD', 'ATL'],
        'icao_code': ['KORD', 'KATL']
    })
    mapping = create_iata_to_icao_mapping(df)

    # Check base mapping works
    assert mapping['ORD'] == 'KORD'
    assert mapping['ATL'] == 'KATL'

    # Check missing airports are added
    assert mapping['SFO'] == 'KSFO'
    assert mapping['PHX'] == 'KPHX'


def test_merge_flight_weather_data_correct_join():
    flight_df = pd.DataFrame({
        'airport_code': ['ORD', 'ORD'],
        'fl_date': [20240101, 20240102],
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 2)],
        'avg_dep_delay': [10.5, 15.2]
    })
    weather_df = pd.DataFrame({
        'station_id': ['KORD', 'KORD'],
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 2)],
        'precipitation_in': [0.5, 0.0]
    })
    mapping = {'ORD': 'KORD'}

    merged = merge_flight_weather_data(flight_df, weather_df, mapping)

    assert len(merged) == 2
    assert 'precipitation_in' in merged.columns
    assert merged.iloc[0]['precipitation_in'] == 0.5


def test_filter_data_by_airport_and_date():
    df = pd.DataFrame({
        'airport_code': ['ORD', 'ORD', 'ATL'],
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 2), datetime(2024, 1, 1)],
        'avg_dep_delay': [10.0, 15.0, 20.0]
    })

    filtered = filter_data(df, 'ORD', datetime(2024, 1, 1), datetime(2024, 1, 2))

    assert len(filtered) == 2
    assert all(filtered['airport_code'] == 'ORD')


def test_get_available_airports():
    df = pd.DataFrame({
        'airport_code': ['ORD', 'ATL', 'ORD', 'JFK']
    })
    airports = get_available_airports(df)

    assert airports == ['ATL', 'JFK', 'ORD']  # Sorted


def test_get_date_range():
    df = pd.DataFrame({
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 3), datetime(2024, 1, 5)]
    })
    min_date, max_date = get_date_range(df)

    assert min_date == datetime(2024, 1, 1)
    assert max_date == datetime(2024, 1, 5)
