from flask import Flask, render_template, request, jsonify
from model import predict_weather
from datetime import datetime, timedelta
import os
app = Flask(__name__)

history = []

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    city = data["city"]
    date = data["date"]
    time = data["time"]

    dt = datetime.strptime(date + " " + time, "%Y-%m-%d %H:%M")

    # Current prediction
    temp, humidity, wind = predict_weather(
        city,
        dt.month,
        dt.day,
        dt.hour,
        dt.minute
    )

    # Weather condition logic
    hour = dt.hour

    if humidity >= 85:
      condition = "Rainy"
    elif temp >= 35:
        condition = "Hot"
    elif temp >= 28:
        condition = "Sunny"
    elif temp >= 22:
        condition = "Cloudy"
    elif temp >= 16:
     condition = "Windy"
    else:
     condition = "Cold"

# night override
    if hour >= 18 or hour < 6:
     if condition == "Sunny":
        condition = "Clear Night"
    # Forecast centered around searched time
    forecast = []

    for i in range(-3, 4):  # 30 minutes before → 30 minutes after

        future_time = dt + timedelta(minutes=i * 10)

        f_temp, f_humidity, f_wind = predict_weather(
            city,
            future_time.month,
            future_time.day,
            future_time.hour,
            future_time.minute
        )

        forecast.append({
            "time": future_time.strftime("%H:%M"),
            "temp": f_temp
        })

    result = {
        "city": city,
        "temp": temp,
        "humidity": humidity,
        "wind": wind,
        "condition": condition,
        "forecast": forecast
    }

    history.append(result)

    return jsonify(result)



print("Starting Flask...")  # debug line

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)