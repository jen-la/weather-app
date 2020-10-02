const appid = '#';

// define fetch function to send GET request to Open Weather API
const fetchWeather = city => 
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=metric`)
        .then(response => {
            // return JSON data if response OK, else return new rejected Promise with status info
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject({ status: response.status, statusText: response.statusText });
            }
        })
        // add catch method to address errors
        .catch(error => {
            const errorMsg = error.statusText;
            console.log('Error: ', errorMsg);
            
            // if form empty or input doesn't match any Open Weather city, show error message
            if (errorMsg) {
                cityName.classList.add("is-invalid");
            } else {
                cityName.classList.add("is-valid");
            }
        });


// define function to create weather card HTML 
const createWeatherHtml = (name, emoji, temp, description, min, max) => {
    const html = `
    <div class="card" style="width: 22rem;">
        <div class="card-body">
            <h3 id="cardName" class="card-title">${name}</h3>
            <div id="emoji">${emoji}</div>
            <div id="temp">${temp}&degC</div> 
            <div id="range">
                <p>min: ${min}&degC<p>
                <p>max: ${max}&degC</p>
            </div>
            <div id="description">
                <p class="card-text">Today's forecast is showing ${description}.</p> 
                <p id="advice" class="card-text">Time to put on something <strong>${ temp < 15 ? "warm" : temp > 24 ? "cool" : "not too warm or cool" }</strong>!</p>
            </div>
            <div id="cardLinks">
                <button id="save" type="button" class="btn btn-light far fa-heart"></button>
                <button id="refresh" type="button" class="btn btn-light fas fa-redo"></button>
                <button id="delete" type="button" class="btn btn-light fas fa-times"></button>
            </div>
        </div>
    </div>`;
 
    return html;
};

// emojis object used to find the right emoji from the icon code sent from the api
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


// define weather card class, to keep track of stored weather cards in an array 
class WeatherCard {
    
    constructor() {
        this.cards = [];
    }

    // define add city function
    addCity(data) {
        const cityData = {
            name: data.name,
            emoji: emojis[data.weather[0].icon],
            temp: data.main.temp,
            description: data.weather[0].description,
            min: data.main.temp_min,
            max: data.main.temp_max
        };
        this.cards.push(cityData);
        return cityData;
    }

    // define render function
    render() {
        // declare empty array to store multiple card htmls  
        const cardHtmlList = [];
        
        // loop over weather cards, create html & push to array
        for (let i = 0; i < this.cards.length; i++) {
            const currentCard = this.cards[i];
            const html = createWeatherHtml(currentCard.name, currentCard.emoji, currentCard.temp, currentCard.description, currentCard.min, currentCard.max);
            cardHtmlList.push(html);
        }
        
        // join array elements
        const cardsHtml = cardHtmlList.join('\n');

        // render
        document.querySelector('#weatherContainer').innerHTML = cardsHtml;
    } 

    // define function to store cityInfo to localStorage
    storeCityInfo() {
        const citiesInfo = JSON.stringify(this.cards);
        localStorage.setItem('citiesInfo', citiesInfo);  
    }

    // define function to persist cityInfo on page
    loadCityInfo() {
        // parse stored JSON string to convert to JS object, then render()
        if (localStorage.getItem('citiesInfo')) {
            this.cards = JSON.parse(localStorage.getItem('citiesInfo'));  
            this.render();
        }
    }
       
};

// instantiate new instance of weatherCard
const weatherCard = new WeatherCard(0);

// load cards
weatherCard.loadCityInfo();

// add submit event handler to fetch API based on city inputted, render and store 
const form = document.querySelector('#form');
form.addEventListener('submit', (event) => {
    
    event.preventDefault();

    fetchWeather(cityName.value)
        .then(data => {
            // add city to card array if not already there, otherwise replace existing city card with new fetched data
            for (let i = 0; i < weatherCard.cards.length; i++) {     
                if (weatherCard.cards[i].name === data.name) {    
                    // delete existing data and add new data
                    weatherCard.cards.splice(i, 1);
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


