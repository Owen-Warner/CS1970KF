import os
import sys

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
from validators import (
    validate_airport,
    validate_date,
    validate_date_range,
    validate_weather_metric
)
from chart_generator import create_dual_axis_chart


# Get path to data directory relative to this script.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'data-5-days')


def main():
    print('=' * 50)
    print('  Airport Weather Delay Analyzer')
    print('=' * 50)
    print()

    # Load data
    try:
        airport_codes_df = load_airport_codes(os.path.join(DATA_DIR, 'airport_codes.csv'))
        flight_df = load_flight_delays(os.path.join(DATA_DIR, 'daily_flight_delays.csv'))
        weather_df = load_weather_data(os.path.join(DATA_DIR, 'daily_weather.csv'))
    except FileNotFoundError as e:
        print(f'Error: Could not find data file: {e}')
        print('Please ensure data files are in the data-5-days directory.')
        sys.exit(1)

    # Prepare data
    iata_to_icao = create_iata_to_icao_mapping(airport_codes_df)
    valid_airports = get_available_airports(flight_df)
    min_date, max_date = get_date_range(flight_df)
    merged_df = merge_flight_weather_data(flight_df, weather_df, iata_to_icao)

    # Main loop
    while True:
        print(f'Available airports: {", ".join(valid_airports)}')
        print(f'Data available from {min_date.strftime("%Y-%m-%d")} to {max_date.strftime("%Y-%m-%d")}')
        print()

        # Get airport
        airport = prompt_airport(valid_airports)

        # Get start date
        start_date = prompt_date('Enter start date (YYYY-MM-DD): ', min_date, max_date)

        # Get end date
        end_date = prompt_date('Enter end date (YYYY-MM-DD): ', min_date, max_date)

        # Validate date range
        valid, error = validate_date_range(start_date, end_date)
        while not valid:
            print(error)
            end_date = prompt_date('Enter end date (YYYY-MM-DD): ', min_date, max_date)
            valid, error = validate_date_range(start_date, end_date)

        # Get weather metric
        weather_column, weather_label = prompt_weather_metric()

        # Filter data
        filtered = filter_data(merged_df, airport, start_date, end_date)

        if filtered.empty:
            print('No data available for the selected criteria.')
        else:
            # Check for missing weather values
            if filtered[weather_column].isna().any():
                missing_count = filtered[weather_column].isna().sum()
                print(f'Note: {missing_count} day(s) have missing {weather_label} data.')

            print()
            print(f'Generating chart for {airport}...')
            create_dual_axis_chart(filtered, airport, weather_column, weather_label)

        print()
        again = input('Analyze another? (y/n): ').strip().lower()
        if again != 'y':
            print('Goodbye!')
            break
        print()


# Prompt for airport with validation loop.
def prompt_airport(valid_airports):
    while True:
        airport_input = input('Enter airport code: ')
        valid, normalized, error = validate_airport(airport_input, valid_airports)
        if valid:
            return normalized
        print(error)


# Prompt for date with validation loop.
def prompt_date(prompt_text, min_date, max_date):
    while True:
        date_input = input(prompt_text)
        valid, parsed, error = validate_date(date_input, min_date, max_date)
        if valid:
            return parsed
        print(error)


# Prompt for weather metric with validation loop.
def prompt_weather_metric():
    print()
    print('Weather metrics:')
    print('  1. Precipitation')
    print('  2. Wind')
    print('  3. Visibility')
    print('  4. Temperature')
    print()

    while True:
        metric_input = input('Select weather metric (1-4 or name): ')
        valid, column, label, error = validate_weather_metric(metric_input)
        if valid:
            return column, label
        print(error)


if __name__ == '__main__':
    main()
