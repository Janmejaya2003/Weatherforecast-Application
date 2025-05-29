from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)
API_KEY = '34f48b9ed47baadcf1ecaf32cf4c64c2'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_weather', methods=['POST'])
def get_weather():
    city = request.form['city']
    units = request.form.get('units', 'metric')
    current_url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={units}'
    forecast_url = f'https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units={units}'

    try:
        current_response = requests.get(current_url)
        forecast_response = requests.get(forecast_url)
        current_data = current_response.json()
        forecast_data = forecast_response.json()

        if current_response.status_code == 200 and forecast_response.status_code == 200:
            forecast_days = {}
            for item in forecast_data['list']:
                dt_txt = item['dt_txt']
                date = dt_txt.split(' ')[0]
                if date not in forecast_days and len(forecast_days) < 5:
                    forecast_days[date] = {
                        'date': datetime.strptime(date, '%Y-%m-%d').strftime('%a, %d %b'),
                        'temp': round(item['main']['temp']),
                        'desc': item['weather'][0]['description'].title(),
                        'icon': item['weather'][0]['icon']
                    }

            return jsonify({
                'temperature': str(current_data['main']['temp']),
                'humidity': str(current_data['main']['humidity']) + '%',
                'description': current_data['weather'][0]['description'].title(),
                'wind_speed': str(current_data['wind']['speed']) + ' m/s',
                'icon': current_data['weather'][0]['icon'],
                'forecast': list(forecast_days.values())
            })
        else:
            return jsonify({'error': 'City not found'})
    except Exception as e:
        return jsonify({'error': 'Something went wrong'})

if __name__ == '__main__':
    app.run(debug=True)