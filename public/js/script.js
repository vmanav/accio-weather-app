// API KEY FOR Open Weather
const apiKey = '1b8975e74fb3966da59cd7d3b51ccbf8';

// Creating a Cookie
function createCookie(value, maxAgeSeconds = 86400) {
    // this maxAgeSeconds is equivalent to 1 day = 86400

    const key = "city";
    newCookie = `${key}=${value};max-age=${maxAgeSeconds}`;
    // console.log("The newCookie :", newCookie)
    document.cookie = newCookie;
    // console.log("The document.cookie - ", document.cookie)
}

function checkIfCookieExists(name) {

    if (document.cookie.indexOf(`${name}=`) != -1) {
        // COOKIE EXISTS, console.log("true")
        return true;
    }
    else {
        // COOKIE DOES NOT EXISTS, 
        return false;
    }
}

// Reading Cookie Data
function readCookie(name) {

    // console.log("readCookie fn -->");
    let key = name + "=";
    let cookies = document.cookie.split(';');

    // console.log(cookies)
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        // console.log(i + "th cookie is : " + cookie);
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(key) === 0) {
            return cookie.substring(key.length, cookie.length);
        }
    }
    return null;
}

function getCitiesFromCookie(city = "city") {

    let cookie = readCookie("city");
    if (cookie == null) {
        // IF NO COOKIE IS PRESENT, EMPTY ARRAY IS RETURNED
        return [];
    }
    // console.log(cookie); console.log(typeof (cookie));
    splittedResult = cookie.split(',');
    // console.log("splittedResult ->", splittedResult);
    return splittedResult;
}

function addThisDataInUserCookie(cityName) {
    let currentUserCities = getCitiesFromCookie();
    if (currentUserCities.indexOf(cityName) > -1) {
        //Present already, Do Nothing
        // console.log("already present")

    }
    else {
        // Add this to user Cities
        // console.log("adding data")
        currentUserCities.push(cityName)
        // console.log("New List of User Cookies", currentUserCities)
        createCookie(currentUserCities);
    }
}

function deleteCookie() {
    // just set the cookie's expiration date in past/ -ve max-age.
    createCookie("", -1);
}


$(() => {

    let input = $('#input')
    let submitButton = $('#submitButton')
    let accioAppForm = $('#accioAppForm')
    let infoContainer = $('#infoContainer');
    let clearDataButton = $('#clearDataButton');
    let heading = $('#heading');
    let currentWeatherButton = $('#currentWeatherButton');

    // function to stop the laoding animation when data is loaded
    function stopLoader() {
        $('.loader').fadeOut("slow");
    }

    // Load user data fron cookies if present
    loadUserDataFromCookie(stopLoader);


    function loadUserDataFromCookie(callback) {

        // Check if a Cookie Exists
        if (checkIfCookieExists("city")) {
            // read the cities from cookie 
            citiesInCookie = getCitiesFromCookie();
            // console.log("city hai ")
            for (i = 0; i < citiesInCookie.length; i++) {
                getWeather(citiesInCookie[i])
            }
            // $('.loader').fadeOut();
            setTimeout(function () {
                callback();
            }, 2000);
        }
        else {
            // when NO data presnt removee animation slowly
            alert("No Previous Data found for browser.");
            $('.loader').fadeOut("slow");
        }
    }

    // append weather to cotainer
    function addThisToMyScreen(weatherObject, currentPosition = false) {
        if (currentPosition == true) {
            html = `<div class="m-3 p-4 weatherCard-inv">
                    <span class="spacedData">
                    <i style="color: Dodgerblue; font-size: 1.3em; opacity: 0.9; text-align:center;" class="fas fa-map-marker-alt"></i>
                    <b>${weatherObject.name}</b>
                    </span>
                    <br> 
                    <span class="spacedData"><b><i>${weatherObject.temp} &#8451</i></b></span>
                    <br>
                    <span class="badge badge-pill badge-info" id="desc" style="font-size: 1em">${weatherObject.desc}</span>
                </div>`;
        }
        else {
            html = `<div class="m-3 p-4 weatherCard">
                    <span class="spacedData"><b>${weatherObject.name}</b></span>
                    <br>
                    <span class="spacedData"><b><i>${weatherObject.temp} &#8451</i></b></span>
                    <br>
                    <span class="badge badge-pill badge-info" id="desc" style="font-size: 1em">${weatherObject.desc}</span>
                </div>`;
        }

        infoContainer.prepend(html);
    }

    // function to retrive weather for  cityName
    function getWeather(cityName) {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

        $.get(url, function (data) {
            // console.log(data);
            let name = data.name;
            let temp = data.main.temp;
            let desc = data.weather[0].description
            // console.log("cityName ->", name);
            // console.log("Temprature ->", temp);
            // console.log("description ->", desc);

            weatherObject = {
                "name": name,
                "temp": temp,
                "desc": desc
            }
            // console.log(weatherObject)
            addThisToMyScreen(weatherObject);

            // Now we add this cookie to the user's cookie
            addThisDataInUserCookie(cityName.toLowerCase())

            // set the input to empty
            input.val("");
        })
            .fail(() => {
                // alert("FAILURE"); console.log(cityName);
                alert("Unable to retrive data for " + cityName);
            })
    }

    accioAppForm.submit((e) => {
        e.preventDefault()
        let cityName = input.val();
        getWeather(cityName);
    })

    clearDataButton.click(() => {
        deleteCookie();
        infoContainer.html("");
    })

    // function to retrive weather for current location
    function getCurrentLocationWeather(lat, lon, speech) {
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        $.get(url, function (data) {

            let name = data.name;
            let temp = data.main.temp;
            let desc = data.weather[0].description;

            if (speech == true) {
                console.log("speech -> true")
                textToSpeechOutput(name, temp, desc);
            }

            weatherObject = {
                "name": name,
                "temp": temp,
                "desc": desc
            }
            // console.log(weatherObject)
            addThisToMyScreen(weatherObject, true);
        })
            .fail(() => {
                // alert("FAILURE")
                alert("Unable to retrive data for your location.");
            })

    }

    currentWeatherButton.click(() => {
        navigator.geolocation.getCurrentPosition((data) => {
            // console.log("lat -> ", data.coords.latitude); console.log("Rounded OFF lat -> ", Math.round(data.coords.latitude))
            // console.log("lon -> ", data.coords.longitude); console.log("Rounded OFF lat -> ", Math.round(data.coords.longitude))
            let lat = Math.round(data.coords.latitude * 100) / 100;
            let lon = Math.round(data.coords.longitude * 100) / 100;
            getCurrentLocationWeather(lat, lon)
        })

    })


    // Speech Recognition for weather
    
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;


    recognition.addEventListener('result', (e) => {
        // console.log(e.results)

        // console.log(transcript);
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')

        console.log(transcript)

        if (e.results[0].isFinal) {

            // console.log("Fianl vala -", e.results[0][0].transcript)
            finalTranscript = e.results[0][0].transcript;

            // Scanning for content
            if (finalTranscript.includes('weather')) {
                console.log("QUERY WEATHER")

                navigator.geolocation.getCurrentPosition((data) => {
                    // console.log("lat -> ", data.coords.latitude); console.log("Rounded OFF lat -> ", Math.round(data.coords.latitude))
                    // console.log("lon -> ", data.coords.longitude); console.log("Rounded OFF lat -> ", Math.round(data.coords.longitude))
                    let lat = Math.round(data.coords.latitude * 100) / 100;
                    let lon = Math.round(data.coords.longitude * 100) / 100;
                    getCurrentLocationWeather(lat, lon, true)
                })

            }

        }

    })


    recognition.addEventListener('end', recognition.start);

    recognition.start();


    // Text to Speech Output
    function textToSpeechOutput(name, temp, desc) {

        var synth = window.speechSynthesis;

        var utter = new SpeechSynthesisUtterance();

        var textToBeSpoken = `${desc} at ${name}, with temprature of ${temp} degree Celcius.`

        textToSpeech(textToBeSpoken);
    }


    function textToSpeech(textToBeSpoken) {

        // get all voices that browser offers
        var available_voices = window.speechSynthesis.getVoices();

        // this will hold an english voice
        var english_voice = '';

        // find voice by language locale "en-US"
        // if not then select the first voice
        console.log("available_voices", available_voices)

        for (var i = 0; i < available_voices.length; i++) {
            if (available_voices[i].lang === 'en-US') {
                english_voice = available_voices[i];
                break;
            }
        }
        if (english_voice === '')
            english_voice = available_voices[0];

        // new SpeechSynthesisUtterance object
        var utter = new SpeechSynthesisUtterance();
        utter.rate = 1;
        utter.pitch = 0.5;
        utter.text = textToBeSpoken;
        utter.voice = english_voice;

        // event after text has been spoken
        utter.onend = function () {
            // alert('Speech has finished');
        }
        // speak
        window.speechSynthesis.speak(utter);
    }

})
