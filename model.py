import pickle

# load trained model
with open("model.pkl", "rb") as f:
    temp_model, humidity_model, wind_model, city_mapping = pickle.load(f)

def get_city_code(city):
    for code, name in city_mapping.items():
        if name == city:
            return code

def predict_weather(city, month, day, hour, minute):

    city_code = get_city_code(city)

    X_pred = [[city_code, month, day, hour, minute]]

    temp = temp_model.predict(X_pred)[0]
    humidity = humidity_model.predict(X_pred)[0]
    wind = wind_model.predict(X_pred)[0]

    return round(temp,1), round(humidity,1), round(wind,1)

