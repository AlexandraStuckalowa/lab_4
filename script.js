const API_KEY = 'ff8ed40b458e98cff16e814919b3c329';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const locationTitle = document.getElementById('locationTitle');
const currentWeatherDiv = document.getElementById('currentWeather');
const additionalCitiesDiv = document.getElementById('additionalCities');
const refreshBtn = document.getElementById('refreshBtn');
const resetBtn = document.getElementById('resetBtn');
const addCityForm = document.getElementById('addCityForm');
const cityInput = document.getElementById('cityInput');
const addCityBtn = document.getElementById('addCityBtn');
const cityError = document.getElementById('cityError');
const geoDeniedMessage = document.getElementById('geoDeniedMessage');
const backBtn = document.getElementById('backBtn');
const mainView = document.getElementById('mainView');
const cityView = document.getElementById('cityView');
const selectedCityTitle = document.getElementById('selectedCityTitle');
const selectedCityWeather = document.getElementById('selectedCityWeather');
const refreshSelectedBtn = document.getElementById('refreshSelectedBtn');

let selectedCity = null;

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
    'Тверь',
    'Ярославль',
    'Кострома',
    'Иваново',
    'Владимир',
    'Рязань',
    'Тула',
    'Калуга',
    'Брянск',
    'Смоленск',
    'Орёл',
    'Курск',
    'Белгород',
    'Воронеж',
    'Липецк',
    'Тамбов',
    'Пенза',
    'Нижний Новгород',
    'Самара',
    'Саратов',
    'Ульяновск',
    'Чебоксары',
    'Йошкар-Ола',
    'Саранск',
    'Оренбург',
    'Тольятти',
    'Челябинск',
    'Магнитогорск',
    'Пермь',
    'Нижний Тагил',
    'Сургут',
    'Нижневартовск',
    'Тюмень',
    'Ханты-Мансийск',
    'Омск',
    'Красноярск',
    'Иркутск',
    'Братск',
    'Кемерово',
    'Новокузнецк',
    'Барнаул',
    'Бийск',
    'Томск',
    'Абакан',
    'Кызыл',
    'Горно-Алтайск',
    'Хабаровск',
    'Комсомольск-на-Амуре',
    'Благовещенск',
    'Чита',
    'Улан-Удэ',
    'Якутск',
    'Петропавловск-Камчатский',
    'Южно-Сахалинск',
    'Магадан',
    'Архангельск',
    'Северодвинск',
    'Мурманск',
    'Нарьян-Мар',
    'Сыктывкар',
    'Ростов-на-Дону',
    'Волгоград',
    'Астрахань',
    'Ставрополь',
    'Пятигорск',
    'Минеральные Воды',
    'Нальчик',
    'Владикавказ',
    'Махачкала',
    'Грозный',
    'Черкесск',
    'Элиста'
];

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

        if (currentCity) {
            const matched = popularCities.find(
                c => c.toLowerCase() === currentCity.toLowerCase()
            );
            if (matched) currentCity = matched;
        }

        additionalCities = additionalCities.map(city => {
            const matched = popularCities.find(
                c => c.toLowerCase() === city.toLowerCase()
            );
            return matched || city;
        });

        return true;
    }

    return false;
}

function showMainView() {
    mainView.classList.add('active');
    cityView.classList.remove('active');
    backBtn.style.display = 'none';
    selectedCity = null;
}

function showCityView(cityName, weatherData) {
    selectedCity = cityName;
    selectedCityTitle.textContent = cityName;
    displayWeather(weatherData, selectedCityWeather);
    mainView.classList.remove('active');
    cityView.classList.add('active');
    backBtn.style.display = 'block';
}

backBtn.addEventListener('click', showMainView);

async function fetchWeather(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${API_KEY}`
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
    
    let html = `
  <div class="card-header">
    <h3 class="city-clickable" data-city="${cityName}">${cityName}</h3>
    ${container.dataset.removable === 'true'
        ? `<button class="remove-city" data-city="${cityName}" type="button">
            ${container.dataset.primary === 'true' ? 'Сменить' : 'Удалить'}
     </button>`
        : ``}
  </div>
`;
    
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
    container.weatherData = data;
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
                    currentWeatherDiv.dataset.primary = 'true';
                    currentWeatherDiv.dataset.removable = 'true';
                    displayWeather(data, currentWeatherDiv);
                    addCityForm.style.display = 'block';  
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

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('city-clickable')) {
        const cityName = e.target.dataset.city;
        let weatherData = null;
        
        if (cityName === currentCity) {
            weatherData = currentWeatherDiv.weatherData;
        } else {
            const cityCard = document.getElementById(`city-${cityName}`);
            if (cityCard) {
                weatherData = cityCard.weatherData;
            }
        }
        
        if (weatherData) {
            showCityView(cityName, weatherData);
        }
    }
});

refreshSelectedBtn.addEventListener('click', async () => {
    if (selectedCity) {
        selectedCityWeather.innerHTML = '<p>Обновление...</p>';
        const data = await fetchWeather(selectedCity);
        if (data) {
            displayWeather(data, selectedCityWeather);
        }
    }
});

async function loadAllCities() {
    if (currentCity) {
        currentWeatherDiv.innerHTML = '<p>Загрузка...</p>';
        const data = await fetchWeather(currentCity);
        if (data) {
            locationTitle.textContent = currentCity;
            currentWeatherDiv.dataset.primary = 'true';
            currentWeatherDiv.dataset.removable = 'true';
            displayWeather(data, currentWeatherDiv);
        }
    }
    
    additionalCitiesDiv.innerHTML = '';
    for (const city of additionalCities) {
        const cityCard = document.createElement('div');
        cityCard.className = 'weather-card';
        cityCard.id = `city-${city}`;
        cityCard.dataset.removable = 'true';
        additionalCitiesDiv.appendChild(cityCard);
        cityCard.innerHTML = '<p>Загрузка...</p>';
        
        const data = await fetchWeather(city);
        if (data) {
            displayWeather(data, cityCard);
        }
    }
    
    addCityForm.style.display = 'block';     
    geoDeniedMessage.style.display = 'none';
}

let autocompleteList = null;

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('remove-city')) return;

  const cityName = e.target.dataset.city;
  const card = e.target.closest('.weather-card');
  const isPrimary = card && card.dataset.primary === 'true';

  if (isPrimary) {

    localStorage.removeItem('weatherAppData');
    currentCity = null;
    additionalCities = [];
    selectedCity = null;

    additionalCitiesDiv.innerHTML = '';
    showMainView();

    locationTitle.textContent = 'Текущее местоположение';
    currentWeatherDiv.innerHTML = '<p>Запрашиваем геолокацию...</p>';

    addCityForm.style.display = 'block';
    geoDeniedMessage.style.display = 'none';

    getLocation();
    return;
  }

  additionalCities = additionalCities.filter(c => c !== cityName);
  saveToLocalStorage();
  loadAllCities();
  showMainView();
});

function createAutocompleteList() {
    if (autocompleteList) {
        autocompleteList.remove();
    }
    
    autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-list';
    
    const rect = cityInput.getBoundingClientRect();
    autocompleteList.style.width = rect.width + 'px';
    autocompleteList.style.top = (rect.bottom + window.scrollY) + 'px';
    autocompleteList.style.left = (rect.left + window.scrollX) + 'px';
    
    document.body.appendChild(autocompleteList);
}

function updateAutocompleteList(filter) {
    if (!filter) {
        if (autocompleteList) {
            autocompleteList.remove();
            autocompleteList = null;
        }
        return;
    }
    
    const filtered = popularCities.filter(city => 
        city.toLowerCase().startsWith(filter.toLowerCase())
    );
    
    if (filtered.length === 0) {
        if (autocompleteList) {
            autocompleteList.remove();
            autocompleteList = null;
        }
        return;
    }
    
    if (!autocompleteList) {
        createAutocompleteList();
    } else {
        autocompleteList.innerHTML = '';
    }
    
    filtered.forEach(city => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = city;
        
        item.addEventListener('click', () => {
            cityInput.value = city;
            autocompleteList.remove();
            autocompleteList = null;
            cityError.textContent = '';
        });
        
        autocompleteList.appendChild(item);
    });
}

cityInput.addEventListener('input', (e) => {
    updateAutocompleteList(e.target.value);
});

cityInput.addEventListener('blur', () => {
    setTimeout(() => {
        if (autocompleteList) {
            autocompleteList.remove();
            autocompleteList = null;
        }
    }, 200);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCity();
        if (autocompleteList) {
            autocompleteList.remove();
            autocompleteList = null;
        }
    }
});

async function addCity() {
  const raw = cityInput.value.trim();

  if (!raw) {
    cityError.textContent = 'Введите название города';
    return;
  }

  cityError.textContent = '';
  cityInput.disabled = true;
  addCityBtn.disabled = true;

  const data = await fetchWeather(raw);

  cityInput.disabled = false;
  addCityBtn.disabled = false;

  if (!data) {
    cityError.textContent = 'Не удалось получить погоду. Проверьте название города или API.';
    return;
  }

  const matched = popularCities.find(c => c.toLowerCase() === raw.toLowerCase());
  if (!matched) {
    cityError.textContent = 'Пожалуйста, выберите город из выпадающего списка';
    return;
  }

  const canonicalCity = matched;

  if (!currentCity) {
    currentCity = canonicalCity;
    locationTitle.textContent = canonicalCity;
    displayWeather(data, currentWeatherDiv);
    saveToLocalStorage();
    addCityForm.style.display = 'block';
    geoDeniedMessage.style.display = 'none';
  } else {
    if (additionalCities.length >= 2) {
      cityError.textContent = 'Можно добавить только 2 дополнительных города';
      return;
    }


    const all = [currentCity, ...additionalCities].map(x => x.toLowerCase());
    if (all.includes(canonicalCity.toLowerCase())) {
      cityError.textContent = 'Этот город уже добавлен';
      return;
    }

    additionalCities.push(canonicalCity);

    const cityCard = document.createElement('div');
    cityCard.className = 'weather-card';
    cityCard.id = `city-${canonicalCity}`;
    cityCard.dataset.removable = 'true';
    additionalCitiesDiv.appendChild(cityCard);

    displayWeather(data, cityCard);
    saveToLocalStorage();
    cityInput.value = '';
  }
}

addCityBtn.addEventListener('click', addCity);

async function refreshAllWeather() {
  currentWeatherDiv.innerHTML = '<p>Обновление...</p>';

  if (currentCity) {
    const data = await fetchWeather(currentCity);
    if (data) {
      displayWeather(data, currentWeatherDiv);
    } else {
      currentWeatherDiv.innerHTML = '<p>Ошибка обновления. Попробуйте позже.</p>';
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
    } else {
      card.innerHTML = '<p>Ошибка обновления.</p>';
    }
  }

  saveToLocalStorage();
}

resetBtn.addEventListener('click', () => {
    localStorage.removeItem('weatherAppData');

    currentCity = null;
    additionalCities = [];
    selectedCity = null;

    additionalCitiesDiv.innerHTML = '';
    showMainView();

    locationTitle.textContent = 'Текущее местоположение';
    currentWeatherDiv.innerHTML = '<p>Запрашиваем геолокацию...</p>';

    addCityForm.style.display = 'block';
    geoDeniedMessage.style.display = 'none';

    getLocation();
});

refreshBtn.addEventListener('click', refreshAllWeather);

getLocation();