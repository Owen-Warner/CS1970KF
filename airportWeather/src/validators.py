from datetime import datetime

WEATHER_METRICS = {
    '1': ('precipitation_in', 'Precipitation (inches)'),
    'precipitation': ('precipitation_in', 'Precipitation (inches)'),
    '2': ('wind_avg_mph', 'Average Wind Speed (mph)'),
    'wind': ('wind_avg_mph', 'Average Wind Speed (mph)'),
    '3': ('visibility_mi', 'Visibility (miles)'),
    'visibility': ('visibility_mi', 'Visibility (miles)'),
    '4': ('temp_max_f', 'Max Temperature (F)'),
    'temperature': ('temp_max_f', 'Max Temperature (F)'),
}


# Validate airport code input.
# Returns (is_valid, normalized_code, error_message).
def validate_airport(airport_input, valid_airports):
    normalized = airport_input.strip().upper()

    if len(normalized) != 3:
        return False, '', 'Airport code must be 3 letters.'

    if normalized not in valid_airports:
        airports_str = ', '.join(valid_airports)
        return False, '', f'Invalid airport. Choose from: {airports_str}'

    return True, normalized, ''


# Validate date input (YYYY-MM-DD format).
# Returns (is_valid, parsed_date, error_message).
def validate_date(date_input, min_date, max_date):
    try:
        parsed = datetime.strptime(date_input.strip(), '%Y-%m-%d')
    except ValueError:
        return False, None, 'Invalid date format. Use YYYY-MM-DD.'

    if parsed < min_date or parsed > max_date:
        min_str = min_date.strftime('%Y-%m-%d')
        max_str = max_date.strftime('%Y-%m-%d')
        return False, None, f'Date out of range. Data available: {min_str} to {max_str}'

    return True, parsed, ''


# Validate that start_date <= end_date.
# Returns (is_valid, error_message).
def validate_date_range(start_date, end_date):
    if start_date > end_date:
        return False, 'End date must be on or after start date.'
    return True, ''


# Validate weather metric selection.
# Returns (is_valid, column_name, display_label, error_message).
def validate_weather_metric(metric_input):
    normalized = metric_input.strip().lower()

    if normalized in WEATHER_METRICS:
        column, label = WEATHER_METRICS[normalized]
        return True, column, label, ''

    return False, '', '', 'Invalid selection. Enter 1-4 or metric name (precipitation, wind, visibility, temperature).'
