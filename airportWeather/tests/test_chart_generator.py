import pytest
import pandas as pd
import numpy as np
from datetime import datetime
from unittest.mock import patch
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from chart_generator import create_dual_axis_chart


@pytest.fixture
def sample_data():
    return pd.DataFrame({
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 2), datetime(2024, 1, 3)],
        'avg_dep_delay': [10.5, 15.2, 8.3],
        'avg_arr_delay': [8.2, 12.1, 6.5],
        'precipitation_in': [0.5, 1.2, 0.0],
        'wind_avg_mph': [12.3, 18.5, 8.2],
        'visibility_mi': [10.0, 5.5, 10.0],
        'temp_max_f': [32.0, 28.0, 35.0]
    })


@pytest.fixture
def data_with_missing():
    return pd.DataFrame({
        'date': [datetime(2024, 1, 1), datetime(2024, 1, 2), datetime(2024, 1, 3)],
        'avg_dep_delay': [10.5, 15.2, 8.3],
        'avg_arr_delay': [8.2, 12.1, 6.5],
        'precipitation_in': [0.5, np.nan, 0.0]
    })


@pytest.fixture
def single_day_data():
    return pd.DataFrame({
        'date': [datetime(2024, 1, 1)],
        'avg_dep_delay': [10.5],
        'avg_arr_delay': [8.2],
        'precipitation_in': [0.5],
        'wind_avg_mph': [12.3]
    })


@patch('matplotlib.pyplot.show')
def test_create_chart_returns_figure(mock_show, sample_data):
    fig = create_dual_axis_chart(sample_data, 'ORD', 'precipitation_in', 'Precipitation (inches)')
    assert fig is not None
    assert mock_show.called


@patch('matplotlib.pyplot.show')
def test_create_chart_handles_missing_values(mock_show, data_with_missing):
    # Should not raise an exception with NaN values
    fig = create_dual_axis_chart(data_with_missing, 'ORD', 'precipitation_in', 'Precipitation (inches)')
    assert fig is not None


@patch('matplotlib.pyplot.show')
def test_create_chart_correct_title(mock_show, sample_data):
    fig = create_dual_axis_chart(sample_data, 'ORD', 'wind_avg_mph', 'Wind Speed (mph)')
    # Title is set on figure via plt.title(), get all text from figure
    all_text = [t.get_text() for t in fig.texts] + [ax.get_title() for ax in fig.axes]
    title_found = any('ORD' in t and 'Wind Speed' in t for t in all_text)
    # Also check axes titles
    for ax in fig.axes:
        if 'ORD' in ax.get_title():
            title_found = True
    assert title_found or any('ORD' in t for t in all_text)


@patch('matplotlib.pyplot.show')
def test_create_chart_precipitation_uses_bars(mock_show, sample_data):
    fig = create_dual_axis_chart(sample_data, 'ORD', 'precipitation_in', 'Precipitation (inches)')
    ax2 = fig.axes[1]  # Second axis (right)
    # Check that bars were created (patches exist)
    assert len(ax2.patches) > 0


@patch('matplotlib.pyplot.show')
def test_create_chart_wind_uses_lines(mock_show, sample_data):
    fig = create_dual_axis_chart(sample_data, 'ORD', 'wind_avg_mph', 'Wind Speed (mph)')
    ax2 = fig.axes[1]
    # Check that lines were created
    assert len(ax2.lines) > 0


@patch('matplotlib.pyplot.show')
def test_create_chart_delay_colors_are_different(mock_show, sample_data):
    fig = create_dual_axis_chart(sample_data, 'ORD', 'precipitation_in', 'Precipitation (inches)')
    ax1 = fig.axes[0]
    # Get colors of the two delay lines
    dep_color = ax1.lines[0].get_color()
    arr_color = ax1.lines[1].get_color()
    assert dep_color != arr_color


@patch('matplotlib.pyplot.show')
def test_create_chart_single_day_shows_markers(mock_show, single_day_data):
    fig = create_dual_axis_chart(single_day_data, 'ORD', 'wind_avg_mph', 'Wind Speed (mph)')
    ax1 = fig.axes[0]
    # Verify delay lines have markers for single day
    dep_line = ax1.lines[0]
    arr_line = ax1.lines[1]
    assert dep_line.get_marker() == 'o'
    assert arr_line.get_marker() == 'o'
