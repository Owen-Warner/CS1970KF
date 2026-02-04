import matplotlib.pyplot as plt
import matplotlib.dates as mdates


# Create dual-axis chart showing flight delays and weather metric.
# Left axis: delays (blue), Right axis: weather (orange/red).
# For single day data, markers are shown instead of just lines.
def create_dual_axis_chart(data, airport, weather_column, weather_label):
    fig, ax1 = plt.subplots(figsize=(10, 6))

    # Use markers for single day data
    marker = 'o' if len(data) == 1 else None
    markersize = 8 if len(data) == 1 else None

    # Plot delays on left axis
    ax1.plot(data['date'], data['avg_dep_delay'], 'b-', linewidth=2, marker=marker, markersize=markersize, label='Avg Departure Delay')
    ax1.plot(data['date'], data['avg_arr_delay'], 'g-', linewidth=2, marker=marker, markersize=markersize, label='Avg Arrival Delay')
    ax1.set_xlabel('Date')
    ax1.set_ylabel('Delay (minutes)', color='blue')
    ax1.tick_params(axis='y', labelcolor='blue')

    # Create right axis for weather
    ax2 = ax1.twinx()

    # Use bars for precipitation, lines for other metrics
    if weather_column == 'precipitation_in':
        ax2.bar(data['date'], data[weather_column], alpha=0.4, color='orange', label=weather_label, width=0.8)
    else:
        ax2.plot(data['date'], data[weather_column], 'r-', linewidth=2, marker=marker, markersize=markersize, label=weather_label)

    ax2.set_ylabel(weather_label, color='red')
    ax2.tick_params(axis='y', labelcolor='red')

    # Format x-axis dates
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
    ax1.xaxis.set_major_locator(mdates.DayLocator())
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # Combine legends from both axes
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')

    plt.title(f'Flight Delays vs {weather_label} at {airport}')
    plt.tight_layout()
    plt.show()

    return fig
