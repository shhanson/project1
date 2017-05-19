$(document).ready(() => {
    // Constants
  const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const NICKNAME_REGEX = /^[A-Za-z0-9_\-]{4,}$/;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const ICONS = {
    'clear-day': 'wi wi-day-sunny',
    'clear-night': 'wi wi-night-clear',
    cloudy: 'wi wi-cloudy',
    fog: 'wi wi-fog',
    'partly-cloudy-day': 'wi wi-day-cloudy',
    'partly-cloudy-night': 'wi wi-night-alt-partly-cloudy',
    rain: 'wi wi-rain',
    sleet: 'wi wi-sleet',
    snow: 'wi wi-snow',
    wind: 'wi-strong-wind',
  };

  const BACKGROUNDS = {
    'clear-day': './images/backgrounds/clear-day.jpg',
    'clear-night': './images/backgrounds/clear-night.jpg',
    cloudy: './images/backgrounds/cloudy.jpg',
    fog: './images/backgrounds/fog.jpg',
    'partly-cloudy-day': './images/backgrounds/partly-cloudy-day.jpg',
    'partly-cloudy-night': './images/backgrounds/partly-cloudy-night.jpg',
    rain: './images/backgrounds/rain.jpg',
    snow: './images/backgrounds/snow.jpg',
    sleet: './images/backgrounds/snow.jpg',
    wind: './images/backgrounds/wind.jpg',
  };

  const TOPS = {
    cold: ['Sweater'],
    cool: ['Long sleeves'],
    warm: ['Short sleeves'],
    hot: ['Tank top', 'Short sleeves'],
  };

  const BOTTOMS = {
    cold: ['Pants'],
    cool: ['Pants', 'Leggings'],
    warm: ['Shorts', 'Skirt'],
    hot: ['Shorts', 'Skirt'],
  };

  const OUTER = {
    cold: ['Heavy coat'],
    cool: ['Light coat'],
    warm: ['None'],
    hot: ['None'],
  };

  const ACCESSORIES = {
    rain: ['Umbrella'],
    'clear-day': ['Sunglasses'],
  };


    // Listener for "validation" of #nickname field
  $('#nickname').change(() => {
    if (!NICKNAME_REGEX.test($('#nickname').val())) {
      Materialize.toast('Nickname must be at least 4 characters in length, alphanumeric, "-" and "_" allowed, no spaces.', 3000, 'amber darken-2');
    }
  });

    // Listener for "validation" of #zipcode field
  $('#zipcode').change(() => {
    if (!ZIP_REGEX.test($('#zipcode').val())) {
      Materialize.toast('Invalid ZIP code format.', 3000, 'amber darken-2');
    }
  });

    // Listener for #coldmax field. Populates other field ranges based on input.
  $('#coldmax').change(() => {
    // $('#hotmax').val(Number($('#coldmax').val()) + 1);
    $('#hotmax').attr('placeholder', Number($('#coldmax').val()) + 1);
  });

  $('#hotmax').change(() => {
    if (Number($('#hotmax').val()) <= Number($('#coldmax').val())) {
      Materialize.toast(`Please enter a value greater than ${$('#coldmax').val()}.`, 3000, 'amber darken-2');
    }
  });

    // Listener for "Clear" button
  $('#clear').click(() => {
    $('form').trigger('reset');
  });

    // Listener for form submission
  $('form').submit((event) => {
    event.preventDefault();
    const formData = processForm();
    ajaxCalls(formData);
  });


  function displayResults(formData, tempData, outfit) {
    $('#page1').toggle();

    const $body = $('body');

    $body.css('background-image', `url('${BACKGROUNDS[tempData.currentIcon]}')`);
    $body.css('background-size', 'cover');

    const $innerCol = $("<div class='col s12 white center-align z-depth-1' id='innerCol'></div>");


    const $header = $(`<h4 class="center-align grey-text text-darken-1">${formData.nickname} you should wear:</h4>`);
    $innerCol.append($header);
    $('#resultpage').append($innerCol);


    //BEGIN OUTFIT DISPLAY
    for(let i = 0; i < outfit.length; i++){
        let $h3 = $("<h3 class='outfitList'></h3>");
        let str = '';
        if(i === 3){
            let $shoes = $("<h3 class='outfitList'></h3>");
            if(outfit[4] === "false"){
                $shoes.text("Open-toe shoes");
            } else {
                $shoes.text("Closed-toe shoes");
            }
            $innerCol.append($shoes);
        }
        for(let j = 0; j < outfit[i].length; j++){
            if(outfit[i][j] !== "None"){
                if(j !== outfit[i].length - 1){
                    str += `${outfit[i][j]} or `;
                } else {
                    str += outfit[i][j];
                }
            }
        }
        $h3.text(str);
        $innerCol.append($h3);
    }   //END OUTFIT DISPLAY



    const $innerRow = $("<div class='row' id='innerRow'></div>");
    const $valignWrapper = $("<div class='valign-wrapper'></div>");
    const $currentInfo = $("<div class='col s6 left-align' id='currentInfo'></div>");
    const $summaryInfo = $("<div class='col s6 left-align' id='summaryInfo'></div>");

    $innerCol.append($innerRow);
    $innerRow.append($currentInfo);
    $innerRow.append($summaryInfo);


    const $buttonCol = $("<div class='col s12 center-align'></div>'");
    const $backButton = $("<button id='back' type='button' class='waves-effect waves-light btn'>Back</button>");

    $backButton.click(() => {
      location.reload();
    });

    $innerCol.append($buttonCol);
    $buttonCol.append($backButton);


    const date = new Date();
    const currDate = `${DAYS[date.getDay()]} ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    const currTemp = calcTemp(formData.units, tempData.currentTemp.temp);
    const symbol = ((formData.units === 'Celcius') ? '&#8451' : '&#8457');

    $currentInfo.append(`<p><strong>Currently in ${tempData.city}:</strong></p>`);
    $currentInfo.append(`<p class="truncate">${currDate} ${tempData.currentTemp.timestamp}</p>`);
    $currentInfo.append(`<h2 class="center-align">${currTemp}${symbol} <i class="${ICONS[tempData.currentIcon]}"></i></h2>`);

    const highTemp = calcTemp(formData.units, tempData.highTemp.temp);
    const lowTemp = calcTemp(formData.units, tempData.lowTemp.temp);

    $summaryInfo.append('<p><strong>8-hr Summary:</strong></p>');
    $summaryInfo.append(`<p class="truncate">High: ${highTemp}<sup>o</sup> @ ${tempData.highTemp.timestamp}, Low: ${lowTemp}<sup>o</sup> @ ${tempData.lowTemp.timestamp}`);
    $summaryInfo.append(`<h2 class='center-align'><i class='${ICONS[tempData.dayIcon]}'></i></h2>`);

    $('#resultpage').toggle();
  } // END displayResults

    // Function to validate and process form input
  function processForm() {
    const formData = {
      nickname: $('#nickname').val(),
      zipcode: $('#zipcode').val(),
      units: $('input[name=units]:checked').val(),
      coldMax: Number($('#coldmax').val()),
      hotMax: Number($('#hotmax').val()),
    };

        // Validating the fields before submission again JUST IN CASE
    if (formData.hotMax > formData.coldMax && NICKNAME_REGEX.test(formData.nickname) && ZIP_REGEX.test(formData.zipcode)) {
      return formData;
    }
    Materialize.toast('Input error!', 3000, 'deep-orange darken-4');
  } // END processForm

  function ajaxCalls(formData) {
    let longitude;
    let latitude;
    let city;
    let tempData;

        // Error checking for each AJAX call
    $.ajaxSetup({
      error(xhr, status, error) {
        Materialize.toast(`An AJAX error occurred: ${xhr.status} ${error}.`, 3000, 'deep-orange darken-4');
      },
    });

    const $xhr_google = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=${formData.zipcode}&key=AIzaSyBB6SAGxzrKyG3TEhlDJDLNfulXhPguo3M`);


    $xhr_google.done((googleData) => {
      latitude = googleData.results[0].geometry.location.lat;
      longitude = googleData.results[0].geometry.location.lng;
      city = googleData.results[0].address_components[1].short_name;

      const $xhr_darksky = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/${latitude},${longitude}`);

      $xhr_darksky.done((darkskyData) => {
        tempData = {
          currentTemp: getCurrentTemp(darkskyData.currently),
          currentIcon: darkskyData.currently.icon,
          dayIcon: darkskyData.daily.icon,
          highTemp: getHighTemp(darkskyData.hourly.data),
          lowTemp: getLowTemp(darkskyData.hourly.data),
          city,
        };
        const outfit = generateOutfit(formData, tempData);
        displayResults(formData, tempData, outfit);
      }); // END $xhr_darksky.done
    }); // END $xhr_google.done

    return tempData;
  } // END ajaxCalls

  function generateOutfit(formData, tempData) {
    const outfit = [{}, {}, {}, [], false];


    let currentConditions = '';
    const currentTemp = tempData.currentTemp.temp;
    const midMild = Math.round((formData.coldMax + formData.hotMax) / 2);


    if (currentTemp <= formData.coldMax) {
      currentConditions = 'cold';
    } else if (currentTemp > formData.coldMax && currentTemp <= midMild) {
      currentConditions = 'cool';
    } else if (currentTemp > midMild && currentTemp < formData.hotMax) {
      currentConditions = 'warm';
    } else if (currentTemp >= formData.hotMax) {
      currentConditions = 'hot';
    } else {
      Materialize.toast('Something went wrong!', 3000, 'deep-orange darken-4');
    }


    outfit[0] = TOPS[currentConditions];
    outfit[1] = BOTTOMS[currentConditions];
    outfit[2] = OUTER[currentConditions];
    outfit[3].push(((tempData.currentIcon === 'rain' || tempData.dayIcon === 'rain') ? ACCESSORIES.rain : 'None'));


    outfit[4] = (!!((currentConditions === 'cold' || currentConditions === 'cool' || tempData.currentIcon === 'rain' || tempData.dayIcon === 'rain')));

    console.log(outfit);
    return outfit;
  }

  function getHighTemp(array) {
    const forecastObj = {};
    let maxTemp = Number.MIN_SAFE_INTEGER;
    let maxTempTime;
    for (let i = 0; i < 8; i++) {
      if (array[i].temperature > maxTemp) {
        maxTemp = array[i].temperature;
        maxTempTime = array[i].time;
      }
    }

    forecastObj.temp = Math.round(maxTemp);
    const date = new Date(maxTempTime * 1000);
    const ampm = (date.getHours() >= 12) ? 'PM' : 'AM';
    const hour = (date.getHours() > 12) ? date.getHours() % 12 : date.getHours();
    const minutes = formatMinutes(date.getMinutes());
    forecastObj.timestamp = `${hour}:${minutes}${ampm}`;
    return forecastObj;
  }

  function getLowTemp(array) {
    const forecastObj = {};
    let minTemp = Number.MAX_SAFE_INTEGER;
    let minTempTime;
    for (let i = 0; i < 8; i++) {
      if (array[i].temperature < minTemp) {
        minTemp = array[i].temperature;
        minTempTime = array[i].time;
      }
    }

    forecastObj.temp = Math.round(minTemp);
    const date = new Date(minTempTime * 1000);
    const ampm = (date.getHours() >= 12) ? 'PM' : 'AM';
    const hour = (date.getHours() > 12) ? date.getHours() % 12 : date.getHours();
    const minutes = formatMinutes(date.getMinutes());
    forecastObj.timestamp = `${hour}:${minutes}${ampm}`;
    return forecastObj;
  }

  function getCurrentTemp(data){
      forecastObj = {};
      forecastObj.temp = Math.round(data.temperature);
      const date = new Date(data.time * 1000);
      const ampm = (date.getHours() >= 12) ? 'PM' : 'AM';
      const hour = (date.getHours() > 12) ? date.getHours() % 12 : date.getHours();
      const minutes = formatMinutes(date.getMinutes());
      forecastObj.timestamp = `${hour}:${minutes}${ampm}`;
      return forecastObj;

  }

  function formatMinutes(minutes) {
    return (minutes < 10) ? `0${minutes}` : minutes;
  }

  function calcTemp(unit, temp) {
    return (unit === 'Celcius') ? Math.round((temp - 32) * (5 / 9)) : temp;
  }
});
