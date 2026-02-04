import pytest
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from validators import (
    validate_airport,
    validate_date,
    validate_date_range,
    validate_weather_metric
)


# Airport validation tests
def test_validate_airport_valid_uppercase():
    valid, normalized, error = validate_airport('ORD', ['ORD', 'ATL', 'JFK'])
    assert valid is True
    assert normalized == 'ORD'
    assert error == ''


def test_validate_airport_valid_lowercase():
    valid, normalized, error = validate_airport('ord', ['ORD', 'ATL', 'JFK'])
    assert valid is True
    assert normalized == 'ORD'


def test_validate_airport_invalid():
    valid, normalized, error = validate_airport('XYZ', ['ORD', 'ATL', 'JFK'])
    assert valid is False
    assert 'Invalid airport' in error


def test_validate_airport_wrong_length():
    valid, normalized, error = validate_airport('ORDD', ['ORD', 'ATL'])
    assert valid is False
    assert '3 letters' in error


# Date validation tests
def test_validate_date_valid():
    min_date = datetime(2024, 1, 1)
    max_date = datetime(2024, 1, 5)
    valid, parsed, error = validate_date('2024-01-03', min_date, max_date)
    assert valid is True
    assert parsed == datetime(2024, 1, 3)
    assert error == ''


def test_validate_date_invalid_format():
    min_date = datetime(2024, 1, 1)
    max_date = datetime(2024, 1, 5)
    valid, parsed, error = validate_date('01/03/2024', min_date, max_date)
    assert valid is False
    assert 'YYYY-MM-DD' in error


def test_validate_date_out_of_range():
    min_date = datetime(2024, 1, 1)
    max_date = datetime(2024, 1, 5)
    valid, parsed, error = validate_date('2024-01-10', min_date, max_date)
    assert valid is False
    assert 'out of range' in error


# Date range validation tests
def test_validate_date_range_valid():
    start = datetime(2024, 1, 1)
    end = datetime(2024, 1, 5)
    valid, error = validate_date_range(start, end)
    assert valid is True


def test_validate_date_range_same_date():
    date = datetime(2024, 1, 3)
    valid, error = validate_date_range(date, date)
    assert valid is True


def test_validate_date_range_invalid():
    start = datetime(2024, 1, 5)
    end = datetime(2024, 1, 1)
    valid, error = validate_date_range(start, end)
    assert valid is False
    assert 'End date' in error


# Weather metric validation tests
def test_validate_weather_metric_by_number():
    valid, column, label, error = validate_weather_metric('1')
    assert valid is True
    assert column == 'precipitation_in'
    assert 'Precipitation' in label


def test_validate_weather_metric_by_name():
    valid, column, label, error = validate_weather_metric('wind')
    assert valid is True
    assert column == 'wind_avg_mph'


def test_validate_weather_metric_case_insensitive():
    valid, column, label, error = validate_weather_metric('TEMPERATURE')
    assert valid is True
    assert column == 'temp_max_f'


def test_validate_weather_metric_invalid_number():
    valid, column, label, error = validate_weather_metric('5')
    assert valid is False
    assert 'Invalid' in error


def test_validate_weather_metric_invalid_name():
    valid, column, label, error = validate_weather_metric('rain')
    assert valid is False
    assert 'Invalid' in error
