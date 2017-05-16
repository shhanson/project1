$(document).ready(function() {

    const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    const NICKNAME_REGEX = /^[A-Za-z0-9_\-]{4,}$/;
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const ICONS = {
        "clear-day": "./images/darkskyicons/clear-day.png",
        "clear-night": "./images/darkskyicons/clear-night.png",
        "cloudy": "./images/darkskyicons/cloudy.png",
        "fog": "./images/darkskyicons/fog.png",
        "partly-cloudy-day": "./images/darkskyicons/partly-cloudy-day.png",
        "partly-cloudy-night": "./images/darkskyicons/partly-cloudy-night.png",
        "rain": "./images/darkskyicons/rain.png",
        "sleet": "./images/darkskyicons/sleet.png",
        "snow": "./images/darkskyicons/snow.png",
        "wind": "./images/darkskyicons/wind.png"
    }

    //Listener for "validation" of #nickname field
    $("#nickname").change(function() {
        if (!NICKNAME_REGEX.test($("#nickname").val())) {
            Materialize.toast('Nickname must be at least 4 characters in length, alphanumeric, "-" and "_" allowed', 4000);
        }
    });

    //Listener for "validation" of #zipcode field
    $("#zipcode").change(function() {
        if (!ZIP_REGEX.test($("#zipcode").val())) {
            Materialize.toast('Invalid ZIP code format', 4000);
        }
    });

    //Listener for #coldmax field. Populates other field ranges based on input.
    $("#coldmax").change(function() {
        $("#mildmin").val(parseInt($("#coldmax").val()) + 1);
        $("#mildmax").val(parseInt($("#mildmin").val()) + 1);
        $("#hotmax").val(parseInt($("#mildmax").val()) + 1);
    });

    //Listener for #mildmax field. Populates other field ranges based on input.
    $("#mildmax").change(function() {
        if (parseInt($("#mildmax").val()) <= parseInt($("#mildmin").val())) {
            Materialize.toast(`Please enter a value greater than ${$("#mildmin").val()}`, 4000);
        } else {
            $("#hotmax").val(parseInt($("#mildmax").val()) + 1);
        }
    });

    //Listener for "Clear" button
    $("#clear").click(function() {
        $("form").trigger("reset");
    });

    //Listener for form submission
    $("form").submit(function(event) {
        event.preventDefault();
        let formData = processForm();
        ajaxCalls(formData);
    });

    function displayResults(formData, tempData) {

        $("#page1").toggle();

        let symbol = ((formData.units === "Celcius") ? "&#8451" : "&#8457");
        let date = new Date();
        let currDate = `${DAYS[date.getDay()]} ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        let currMinutes = date.getMinutes();
        if(currMinutes < 10){
            currMinutes = "0" + currMinutes;
        }
        let currTime = `${date.getHours()}:${currMinutes}`
        let currIcon = ICONS[tempData.currentIcon];
        let summIcon = ICONS[tempData.dayIcon];


        let $mainCol = $("#resultpage div:first-child");
        let $innerCol = $("<div class='col s12 white'></div>");
        let $outfitContainer = $("<img src='http://placehold.it/450x450'>");
        let $infoDiv = $(`<div class='col s12 white'><div class='row'> <div class='col s6'><p><strong>Currently:</strong><br> ${currDate} @ ${currTime}</p><h2 style='display: inline'>${tempData.currentTemp} ${symbol}</h2><img class='icon' src='${currIcon}'></div> <div class='col s6'><p><strong>24-hr Summary:</strong><br>High: ${tempData.highTemp.temp}${symbol} @ ${tempData.highTemp.timestamp}, Low: ${tempData.lowTemp.temp}${symbol} @ ${tempData.lowTemp.timestamp}</p><img class='icon' src='${summIcon}'></div>   </div></div>`);

        $mainCol.append(`<h4 class="center-align">${formData.nickname} you should wear...</h4>`);
        $mainCol.append($innerCol);
        $innerCol.append($outfitContainer);
        $innerCol.append($infoDiv);




        $("#resultpage").toggle();

    }

    //Function to validate and process form input
    function processForm() {

        let formData = {
            nickname: $("#nickname").val(),
            zipcode: $("#zipcode").val(),
            units: $("input[name=units]:checked").val(),
            coldMax: parseInt($("#coldmax").val()),
            mildMin: parseInt($("#mildmin").val()),
            mildMax: parseInt($("#mildmax").val()),
            hotMax: parseInt($("#hotmax").val())
        };

        //Validating the fields before submission again JUST IN CASE
        if (formData.mildMin > formData.coldMax && formData.mildMax > formData.mildMin && formData.hotMax > formData.mildMax && ZIP_REGEX.test(formData.zipcode) && NICKNAME_REGEX.test(formData.nickname)) {
            return formData;
        } else {
            Materialize.toast("Input error!", 4000);
            return;
        }
    } //END processForm

    function ajaxCalls(formData) {

        let longitude;
        let latitude;
        let tempData;

        //Error checking for each AJAX call
        $.ajaxSetup({
            error: function(xhr, status, error) {
                console.log(`An AJAX error occurred: ${xhr.status} ${error}.`)
                return;
            }
        });

        let $xhr_google = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=${formData.zipcode}&key=AIzaSyBB6SAGxzrKyG3TEhlDJDLNfulXhPguo3M`);


        $xhr_google.done(function(googleData) {
            latitude = googleData.results[0].geometry.location.lat;
            longitude = googleData.results[0].geometry.location.lng;

            let $xhr_darksky = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/${latitude},${longitude}`);

            $xhr_darksky.done(function(darkskyData) {
                tempData = {
                    currentTemp: Math.round(darkskyData.currently.apparentTemperature),
                    currentIcon: darkskyData.currently.icon,
                    dayIcon: darkskyData.daily.icon,
                    highTemp: getHighTemp(darkskyData.hourly.data),
                    lowTemp: getLowTemp(darkskyData.hourly.data)
                };
                generateOutfit(formData, tempData);
                displayResults(formData, tempData);

            }); //END $xhr_darksky.done

        }); //END $xhr_google.done

        return tempData;
    } //END ajaxCalls

    function generateOutfit(formData, tempData){

    }

    function getHighTemp(array) {
        let forecastObj = {};
        let maxTemp = Number.MIN_SAFE_INTEGER;
        let maxTempTime;
        for (let i = 0; i < 24; i++) {
            if (array[i].apparentTemperature > maxTemp) {
                maxTemp = array[i].apparentTemperature;
                maxTempTime = array[i].time;
            }
        }

        forecastObj.temp = Math.round(maxTemp);
        let date = new Date(maxTempTime * 1000);
        let hour = date.getHours();
        let minutes = date.getMinutes();
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        forecastObj.timestamp = `${hour}:${minutes}`
        return forecastObj;
    }

    function getLowTemp(array) {
        let forecastObj = {};
        let minTemp = Number.MAX_SAFE_INTEGER;
        let minTempTime;
        for (let i = 0; i < 24; i++) {
            if (array[i].apparentTemperature < minTemp) {
                minTemp = array[i].apparentTemperature;
                minTempTime = array[i].time;
            }
        }

        forecastObj.temp = Math.round(minTemp);
        let date = new Date(minTempTime * 1000);
        let hour = date.getHours();
        let minutes = date.getMinutes();
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        forecastObj.timestamp = `${hour}:${minutes}`
        return forecastObj;
    }


});
