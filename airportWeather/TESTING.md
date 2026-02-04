# Airport Weather Delay Analyzer - Testing

All tests are automated and run with pytest.

## Unit Tests

### test_data_loader.py

- `test_load_airport_codes_returns_correct_columns` - Verify iata_code, icao_code columns exist
- `test_load_flight_delays_date_conversion` - Verify YYYYMMDD converts to datetime
- `test_load_weather_data_date_conversion` - Verify MM/DD/YYYY converts to datetime
- `test_create_iata_to_icao_mapping_includes_sfo_phx` - Verify SFO→KSFO, PHX→KPHX added
- `test_merge_flight_weather_data_correct_join` - Verify rows join on airport+date
- `test_filter_data_by_airport_and_date` - Verify filtering returns correct subset

### test_validators.py

- `test_validate_airport_valid_uppercase` - "ORD" returns valid
- `test_validate_airport_valid_lowercase` - "ord" normalizes to "ORD"
- `test_validate_airport_invalid` - "XYZ" returns invalid with error message
- `test_validate_date_valid` - "2024-01-03" parses correctly
- `test_validate_date_invalid_format` - "01/03/2024" returns invalid
- `test_validate_date_out_of_range` - "2024-01-10" returns invalid
- `test_validate_date_range_valid` - start <= end returns valid
- `test_validate_date_range_invalid` - start > end returns invalid
- `test_validate_weather_metric_by_number` - "1" maps to precipitation_in
- `test_validate_weather_metric_by_name` - "wind" maps to wind_avg_mph
- `test_validate_weather_metric_invalid` - "5" or "rain" returns invalid

### test_chart_generator.py

- `test_create_chart_returns_figure` - Verify matplotlib figure created
- `test_create_chart_handles_missing_values` - No crash with NaN data
- `test_create_chart_correct_title` - Verify title contains airport and metric
- `test_create_chart_precipitation_uses_bars` - Verify bars for precipitation
- `test_create_chart_wind_uses_lines` - Verify lines for wind metric
- `test_create_chart_delay_colors_are_different` - Verify departure (blue) and arrival (green) have different colors
- `test_create_chart_single_day_shows_markers` - Verify markers are displayed for single day data

## Integration Tests

### test_integration.py

Uses `unittest.mock.patch` to simulate user input and test full program flow.

- `test_full_flow_valid_inputs` - Mock inputs for ORD, valid dates, precipitation; verify no errors
- `test_full_flow_invalid_then_valid_airport` - Mock "XYZ" then "ORD"; verify re-prompt works
- `test_full_flow_sfo_precipitation_warning` - Mock SFO with precipitation; verify warning about missing data
- `test_analyze_another_yes` - Mock "y" response; verify loop continues
- `test_analyze_another_no` - Mock "n" response; verify clean exit

Example mock pattern:
```python
from unittest.mock import patch

@patch('builtins.input', side_effect=['ORD', '2024-01-01', '2024-01-05', '1', 'n'])
@patch('matplotlib.pyplot.show')  # Prevent chart popup during tests
def test_full_flow_valid_inputs(mock_show, mock_input):
    from src.main import main
    main()  # Should complete without error
    assert mock_show.called
```

## Test Data Strategy

**Unit tests:** Small fixture DataFrames with known values
```python
@pytest.fixture
def sample_flight_data():
    return pd.DataFrame({
        'airport_code': ['ORD', 'ORD'],
        'fl_date': [20240101, 20240102],
        'avg_dep_delay': [10.5, 15.2]
    })
```

**Integration tests:** Use actual CSV files from data-5-days/

## Running Tests

```bash
# Activate virtual environment
source airport_weather_env/bin/activate

# Run all tests
pytest tests/

# Run with verbose output
pytest tests/ -v

# Run specific test file
pytest tests/test_validators.py
```
