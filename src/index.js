// require('dotenv').config();
// const appid = process.env.API_KEY;

// NOTE: To run this app, generate your own Open Weather Map API key and insert it below:
const appid = '';

const fetchWeather = city => 
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=metric`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject({ status: response.status, statusText: response.statusText });
            }
        })
        .catch(error => {
            const errorMsg = error.statusText;
            console.log('Error: ', errorMsg);
            if (errorMsg) {
                cityName.classList.add("is-invalid");
            } else {
                cityName.classList.add("is-valid");
            }
        });

const createWeatherHtml = (id, name, country, emoji, temp, description, min, max) => {
    const html = `
    <div class="myCard" data-city-id=${id}>
        <h3 id="cardName">${name} (${country})</h3>
        <div id="emoji">${emoji}</div>
        <div id="temp">${temp}&degC</div> 
        <div id="range">
            <p>min: ${min}&degC<p>
            <p>max: ${max}&degC</p>
        </div>
        <div id="description">
            <p>Today's forecast is showing<br> ${description}.</p> 
            <p id="advice">Time to put on something<br> <strong>${ temp < 15 ? "warm" : temp > 24 ? "cool" : "not too warm or cool" }</strong>!</p>
        </div>
        <div id="cardButtons">
            <span class="refresh fas fa-redo"></span>
            <span class="delete fas fa-times"></span>
        </div>
    </div>`;
 
    return html;
};

const emojis = {
    '01d': '☀️',
    '02d': '⛅️',
    '03d': '☁️',
    '04d': '☁️',
    '09d': '🌧',
    '10d': '🌦',
    '11d': '⛈',
    '13d': '❄️',
    '50d': '💨',
    '01n': '☀️',
    '02n': '⛅️',
    '03n': '☁️',
    '04n': '☁️',
    '09n': '🌧',
    '10n': '🌦',
    '11n': '⛈',
    '13n': '❄️',
    '50n': '💨',
  };

class WeatherCard {  
    constructor(currentId = 0) {
        this.cards = [];
        this.currentId = currentId;
    }

    addCity(data) {
        const cityData = {
            id: this.currentId++,
            name: data.name,
            country: data.sys.country,
            emoji: emojis[data.weather[0].icon],
            temp: data.main.temp,
            description: data.weather[0].description,
            min: data.main.temp_min,
            max: data.main.temp_max
        };
        this.cards.push(cityData);
        return cityData;
    }

    getCityById(cityId) {
        let foundCity = this.cards.filter( city => city.id === cityId);
        return foundCity[0];
    }

    render() {
        const cardHtmlList = [];
        for (let i = 0; i < this.cards.length; i++) {
            const currentCard = this.cards[i];
            const html = createWeatherHtml(currentCard.id, currentCard.name, currentCard.country, currentCard.emoji, currentCard.temp, currentCard.description, currentCard.min, currentCard.max);
            cardHtmlList.push(html);
        }
        const cardsHtml = cardHtmlList.join('\n');
        document.querySelector('#weatherContainer').innerHTML = cardsHtml;
    } 

    storeCityInfo() {
        const citiesInfo = JSON.stringify(this.cards);
        localStorage.setItem('citiesInfo', citiesInfo);  
    }

    loadCityInfo() {
        if (localStorage.getItem('citiesInfo')) {
            this.cards = JSON.parse(localStorage.getItem('citiesInfo'));  
            this.render();
        }
    }

    delete(cityId) {
        const newCardsArray = this.cards.filter( city => city.id !== cityId );
        this.cards = newCardsArray;
        // reset local storage  
        this.storeCityInfo();
        // render updated list to page
        this.render();
    }

};

// instantiate new instance of weatherCard
const weatherCard = new WeatherCard(0);

// load cards
weatherCard.loadCityInfo();

// add event handler to submit button to fetch API based on city inputted, render and store 
const form = document.querySelector('#form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    fetchWeather(cityName.value)
        .then(data => {
            // check if city already in card array - if yes, refresh, otherwise add
            for (let i = 0; i < weatherCard.cards.length; i++) {     
                if (weatherCard.cards[i].name === data.name) {    
                    refresh(weatherCard.cards[i]);
                    return;
                } 
            }
            weatherCard.addCity(data);
            weatherCard.render();
            weatherCard.storeCityInfo(); 
        });
    // clear form field and validation
    form.reset();
    cityName.classList.remove("is-valid");
    cityName.classList.remove("is-invalid");
});

document.querySelector('#weatherContainer').addEventListener('click', (event) => {
    const parentCity = event.target.parentElement.parentElement;
    const cityId = Number(parentCity.dataset.cityId);
    if (event.target.classList.contains('delete')) {
        weatherCard.delete(cityId);
    } 
    if (event.target.classList.contains('refresh')) {
        const foundCity = weatherCard.getCityById(cityId); 
        refresh(foundCity);
    }
});

// define function to refresh data
const refresh = (city) => {
    fetchWeather(city.name)
        .then(data => {
            city.emoji = emojis[data.weather[0].icon];
            city.temp = data.main.temp;
            city.description = data.weather[0].description;
            city.min = data.main.temp_min;
            city.max = data.main.temp_max;
            // re-save and re-render
            weatherCard.storeCityInfo();
            weatherCard.render();
        });
}

// get current date on page load
document.addEventListener('DOMContentLoaded', () => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const year = today.getFullYear();
    const date = today.getDate(); 
    const getMonth = () => {
        const num = today.getMonth();
        if (num === 0) {
            return 'January';
        } else if (num === 1) {
            return 'February';
        } else if (num === 2) {
            return 'March';
        } else if (num === 3) {
            return 'April';
        } else if (num === 4) {
            return 'May';
        } else if (num === 5) {
            return 'June';
        } else if (num === 6) {
            return 'July';
        } else if (num === 7) {
            return 'August';
        } else if (num === 8) {
            return 'September';
        } else if (num === 9) {
            return 'October';
        } else if (num === 10) {
            return 'November';
        } else {
            return 'December';
        }
    }
    const month = getMonth();
    const getDay = () => {
        const num = today.getDay();
        if (num === 0) {
            return 'Sunday';
        } else if (num === 1) {
            return 'Monday';
        } else if (num === 2) {
            return 'Tuesday';
        } else if (num === 3) {
            return 'Wednesday';
        } else if (num === 4) {
            return 'Thursday';
        } else if (num === 5) {
            return 'Friday';
        } else {
            return 'Saturday';
        }
    } 
    const day = getDay();
    document.querySelector('#currentDate').innerHTML = `${day}, ${date} ${month} ${year}`;
});
