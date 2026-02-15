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