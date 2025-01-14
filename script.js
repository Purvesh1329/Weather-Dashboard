// State
let currCity = "Airoli";
let units = "metric";

// Selectors
let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".weather__datetime");
let districtState = document.querySelector(".district_state p");
let weather__forecast = document.querySelector('.weather__forecast');
let weather__temperature = document.querySelector(".weather__temperature");
let weather__icon = document.querySelector(".weather__icon");
let weather__minmax = document.querySelector(".weather__minmax");
let weather__realfeel = document.querySelector('.weather__realfeel');
let weather__humidity = document.querySelector('.weather__humidity');
let weather__wind = document.querySelector('.weather__wind');
let weather__pressure = document.querySelector('.weather__pressure');

// Search
document.querySelector(".weather__search").addEventListener('submit', e => {
    let search = document.querySelector(".weather__searchform");
    // Prevent default action
    e.preventDefault();
    // Change current city
    currCity = search.value;
    // Get weather forecast and location info
    getWeather();
    // Clear form
    search.value = "";
});

// Units
document.querySelector(".weather_unit_celsius").addEventListener('click', () => {
    if (units !== "metric") {
        // Change to metric
        units = "metric";
        // Get weather forecast 
        getWeather();
    }
});

document.querySelector(".weather_unit_farenheit").addEventListener('click', () => {
    if (units !== "imperial") {
        // Change to imperial
        units = "imperial";
        // Get weather forecast 
        getWeather();
    }
});

function convertTimeStamp(timestamp, timezoneOffset) {
    // Create a new date object with the UTC timestamp
    const utcDate = new Date((timestamp + timezoneOffset) * 1000);

    // Instead of using a fixed offset, calculate the difference between UTC and IST
    const istOffset = new Date().getTimezoneOffset() * 60 * 1000; // Get current user's timezone offset in milliseconds
    const indiaDate = new Date(utcDate.getTime() + istOffset + (5.5 * 60 * 60 * 1000));  // Add IST offset (330 minutes)

    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    };

    return indiaDate.toLocaleString("en-US", options);
}

// Function to change background image based on weather
function changeBackground(weatherCondition) {
    let imageUrl;

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            imageUrl = 'images/sunny2.jpeg';
            break;
        case 'clouds':
            imageUrl = 'images/cloudy4.jpg';
            break;
        case 'rain':
            imageUrl = 'images/rainy5.jpg';
            break;
        case 'snow':
            imageUrl = 'images/snowy2.jpg';
            break;
        case 'thunderstorm':
            imageUrl = 'images/thunderstorm2.jpg';
            break;
        case 'haze':
            imageUrl = 'images/haze1.png';
            break;
        default:
            imageUrl = 'images/default1.jpg';
            break;
    }

    console.log(`Changing background to: ${imageUrl}`); // Add this line

    document.documentElement.style.setProperty('--background-image', `url(${imageUrl})`);
}

// Convert country code to name
function convertCountryCode(country) {
    let regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(country);
}

async function getWeather() {
    const API_KEY = '6812d46af449bce4ba1d5d0e39ca447a';

    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`);
        const weatherData = await weatherResponse.json();
        if (weatherData.cod === 200) {
            city.innerHTML = `${weatherData.name}, ${convertCountryCode(weatherData.sys.country)}`;
            datetime.innerHTML = convertTimeStamp(weatherData.dt, weatherData.timezone);
            weather__forecast.innerHTML = `<p>${weatherData.weather[0].main}</p>`;
            weather__temperature.innerHTML = `${weatherData.main.temp.toFixed()}&#176`;
            weather__icon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" />`;
            weather__minmax.innerHTML = `<p>Min: ${weatherData.main.temp_min.toFixed()}&#176</p><p>Max: ${weatherData.main.temp_max.toFixed()}&#176</p>`;
            weather__realfeel.innerHTML = `${weatherData.main.feels_like.toFixed()}&#176`;
            weather__humidity.innerHTML = `${weatherData.main.humidity}%`;
            weather__wind.innerHTML = `${weatherData.wind.speed} ${units === "imperial" ? "mph" : "m/s"}`;
            weather__pressure.innerHTML = `${weatherData.main.pressure} hPa`;

            // Change background based on weather condition
            changeBackground(weatherData.weather[0].main);

            // Fetch district and state information using Nominatim API
            getDistrictState(weatherData.coord.lat, weatherData.coord.lon);
        } else {
            console.error("Error fetching the weather data: ", weatherData.message);
        }
    } catch (error) {
        console.error("Error fetching the weather data: ", error);
    }
}

async function getDistrictState(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        const data = await response.json();
        if (data && data.address) {
            const district = data.address.state_district || data.address.county || data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            districtState.innerHTML = `${district}, ${state}`;
        } else {
            console.error("Error fetching the location data: No results found");
            districtState.innerHTML = "Location information not available";
        }
    } catch (error) {
        console.error("Error fetching the location data: ", error);
        districtState.innerHTML = "Location information not available";
    }
}


document.body.onload = getWeather;
