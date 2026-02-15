const API_KEY = 'ff8ed40b458e98cff16e814919b3c329';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const locationTitle = document.getElementById('locationTitle');
const currentWeatherDiv = document.getElementById('currentWeather');
const additionalCitiesDiv = document.getElementById('additionalCities');
const refreshBtn = document.getElementById('refreshBtn');
const addCityForm = document.getElementById('addCityForm');
const cityInput = document.getElementById('cityInput');
const addCityBtn = document.getElementById('addCityBtn');
const cityError = document.getElementById('cityError');
const geoDeniedMessage = document.getElementById('geoDeniedMessage');

let currentCity = null;
let additionalCities = [];

async function fetchWeather(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&lang=ru&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Город не найден');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

function displayWeather(data, container) {
    if (!data || !data.list) {
        container.innerHTML = '<p>Ошибка загрузки данных</p>';
        return;
    }

    const cityName = data.city.name;
    const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);
    
    let html = `<h3>${cityName}</h3>`;
    
    forecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        
        html += `
            <div class="day-weather">
                <p><strong>${dayName}</strong></p>
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getLocation() {
    currentWeatherDiv.innerHTML = '<p>Запрашиваем геолокацию...</p>';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                currentWeatherDiv.innerHTML = '<p>Загружаем погоду...</p>';
                
                try {
                    const response = await fetch(
                        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=ru&appid=${API_KEY}`
                    );
                    const data = await response.json();
                    currentCity = data.city.name;
                    locationTitle.textContent = 'Текущее местоположение';
                    displayWeather(data, currentWeatherDiv);
                    addCityForm.style.display = 'none';
                    geoDeniedMessage.style.display = 'none';
                } catch (error) {
                    currentWeatherDiv.innerHTML = '<p>Ошибка загрузки погоды</p>';
                }
            },
            error => {
                console.log('Геолокация отклонена:', error);
                currentWeatherDiv.innerHTML = '<p>Геолокация недоступна</p>';
                geoDeniedMessage.style.display = 'block';
                addCityForm.style.display = 'block';
            }
        );
    } else {
        currentWeatherDiv.innerHTML = '<p>Геолокация не поддерживается</p>';
        geoDeniedMessage.style.display = 'block';
        addCityForm.style.display = 'block';
    }
}

getLocation();