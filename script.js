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

const popularCities = [
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Краснодар',
    'Сочи',
    'Калининград',
    'Владивосток',
    'Лондон',
    'Париж',
    'Берлин',
    'Рим',
    'Мадрид',
    'Прага',
    'Вена',
    'Амстердам',
    'Барселона',
    'Нью-Йорк',
    'Токио'
];

let datalist = document.createElement('datalist');
datalist.id = 'cities-datalist';
document.body.appendChild(datalist);

function saveToLocalStorage() {
    const data = {
        currentCity: currentCity,
        additionalCities: additionalCities
    };
    localStorage.setItem('weatherAppData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('weatherAppData');
    if (saved) {
        const data = JSON.parse(saved);
        currentCity = data.currentCity;
        additionalCities = data.additionalCities || [];
        return true;
    }
    return false;
}

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
    const hasSavedData = loadFromLocalStorage();
    
    if (hasSavedData && currentCity) {
        loadAllCities();
        return;
    }
    
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
                    saveToLocalStorage();
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

async function loadAllCities() {
    if (currentCity) {
        currentWeatherDiv.innerHTML = '<p>Загрузка...</p>';
        const data = await fetchWeather(currentCity);
        if (data) {
            locationTitle.textContent = currentCity;
            displayWeather(data, currentWeatherDiv);
        }
    }
    
    additionalCitiesDiv.innerHTML = '';
    for (const city of additionalCities) {
        const cityCard = document.createElement('div');
        cityCard.className = 'weather-card';
        cityCard.id = `city-${city}`;
        additionalCitiesDiv.appendChild(cityCard);
        cityCard.innerHTML = '<p>Загрузка...</p>';
        
        const data = await fetchWeather(city);
        if (data) {
            displayWeather(data, cityCard);
        }
    }
    
    addCityForm.style.display = 'none';
    geoDeniedMessage.style.display = 'none';
}

async function addCity() {
    const cityName = cityInput.value.trim();
    
    if (!cityName) {
        cityError.textContent = 'Введите название города';
        return;
    }
    
    cityError.textContent = '';
    cityInput.disabled = true;
    addCityBtn.disabled = true;
    
    const data = await fetchWeather(cityName);
    
    cityInput.disabled = false;
    addCityBtn.disabled = false;
    
    if (!data) {
    cityError.textContent = 'Город не найден. Выберите город из списка';
    return;
}

const isValidCity = popularCities.some(city => 
    city.toLowerCase() === cityName.toLowerCase()
);

if (!isValidCity) {
    cityError.textContent = 'Пожалуйста, выберите город из выпадающего списка';
    return;
}
    
    if (!currentCity) {
        currentCity = cityName;
        locationTitle.textContent = cityName;
        displayWeather(data, currentWeatherDiv);
        saveToLocalStorage();
        addCityForm.style.display = 'none';
        geoDeniedMessage.style.display = 'none';
    } else {
        if (additionalCities.length >= 2) {
            cityError.textContent = 'Можно добавить только 2 дополнительных города';
            return;
        }
        
        additionalCities.push(cityName);
        const cityCard = document.createElement('div');
        cityCard.className = 'weather-card';
        cityCard.id = `city-${cityName}`;
        additionalCitiesDiv.appendChild(cityCard);
        displayWeather(data, cityCard);
        saveToLocalStorage();
        cityInput.value = '';
    }
}

addCityBtn.addEventListener('click', addCity);

cityInput.setAttribute('list', 'cities-datalist');

function updateDatalist(filter) {
    datalist.innerHTML = '';
    const filtered = popularCities.filter(city => 
        city.toLowerCase().includes(filter.toLowerCase())
    );
    
    filtered.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

cityInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        updateDatalist(e.target.value);
    }
});

cityInput.addEventListener('blur', () => {
    setTimeout(() => {
        datalist.innerHTML = '';
    }, 200);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCity();
    }
});

async function refreshAllWeather() {
    currentWeatherDiv.innerHTML = '<p>Обновление...</p>';
    
    if (currentCity) {
        const data = await fetchWeather(currentCity);
        if (data) {
            displayWeather(data, currentWeatherDiv);
        }
    }
    
    const cityCards = additionalCitiesDiv.children;
    for (let i = 0; i < cityCards.length; i++) {
        const card = cityCards[i];
        const cityName = card.id.replace('city-', '');
        card.innerHTML = '<p>Обновление...</p>';
        
        const data = await fetchWeather(cityName);
        if (data) {
            displayWeather(data, card);
        }
    }

    saveToLocalStorage();
}

refreshBtn.addEventListener('click', refreshAllWeather);

getLocation();