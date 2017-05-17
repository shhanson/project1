$(document).ready(function() {

    //Constants
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

    const TOPS = {
        "cold": ["Sweater"],
        "cool": ["Long sleeves"],
        "warm": ["Short sleeves"],
        "hot": ["Tank top", "Short sleeves"]
    };

    const BOTTOMS = {
        "cold": ["Pants"],
        "cool": ["Pants", "Leggings"],
        "warm": ["Leggings", "Shorts", "Skirt"],
        "hot": ["Shorts", "Skirt"]
    };

    const OUTER = {
        "cold": ["Heavy coat"],
        "cool": ["Light coat"],
        "warm": ["None"],
        "hot": ["None"]
    };

    const ACCESSORIES = {
        "rain": ["Umbrella"],
        "clear-day": ["Sunglasses"]
    };

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
        $("#mildmin").val(Number($("#coldmax").val()) + 1);
        $("#mildmax").val(Number($("#mildmin").val()) + 1);
        $("#hotmax").val(Number($("#mildmax").val()) + 1);
    });

    //Listener for #mildmax field. Populates other field ranges based on input.
    $("#mildmax").change(function() {
        if (Number($("#mildmax").val()) <= Number($("#mildmin").val())) {
            Materialize.toast(`Please enter a value greater than ${$("#mildmin").val()}`, 4000);
        } else {
            $("#hotmax").val(Number($("#mildmax").val()) + 1);
        }
    });

    //Listener for "Clear" button
    $("#clear").click(function() {
        $("form").trigger("reset");
    });

    //Listener for form submission
    $("form").submit(function(event) {
        event.preventDefault();
        console.log("SUBMITTED!");
        let formData = processForm();
        ajaxCalls(formData);
    });


    function displayResults(formData, tempData, outfit) {

        $("#page1").toggle();

        let $innerCol = $("<div class='col s12 white center-align'></div>");
        let $header = $(`<h4 class="center-align">${formData.nickname} you should wear:</h4>`);
        $innerCol.append($header);
        $("#resultpage").append($innerCol);

        //BEGIN OUTFIT DISPLAY
        let $topList = $("<h3></h3>");
        let str = "";
        for(let i = 0; i < outfit.top.length; i++){
            if(i !== outfit.top.length - 1){
                str += outfit.top[i] + " or ";
            } else {
                str += outfit.top[i];
            }
        }

        $topList.text(str);
        $innerCol.append($topList);

        let $bottomList = $("<h3></h3>");
        str = "";

        for(let i = 0; i < outfit.bottom.length; i++){
            if(i !== outfit.bottom.length - 1){
                str += outfit.bottom[i] + " or ";
            } else {
                str += outfit.bottom[i];
            }
        }

        $bottomList.text(str);
        $innerCol.append($bottomList);

        if(outfit.outer[0] !== "None"){
            let $outerList = $("<h3></h3>");
            str = "";
            for(let i = 0; i < outfit.outer.length; i++){
                if(i !== outfit.outer.length - 1){
                    str += outfit.outer[i] + " or ";
                } else {
                    str += outfit.outer[i];
                }
            }

            $outerList.text(str);
            $innerCol.append($outerList);
        }

        let $shoes = $("<h3></h3>");

        if(outfit.closedToeShoes){
            $shoes.text("Closed-toed shoes");
        } else {
            $shoes.text("Open-toed shoes");
        }
        $innerCol.append($shoes);

        if(outfit.accessories[0] !== "None"){
            let $accessoryList = $("<h3></h3>");
            str = "";
            for(let i = 0; i < outfit.accessories.length; i++){
                if(i !== outfit.accessories.length - 1){
                    str += outfit.accessories[i] + " or ";
                } else {
                    str += outfit.accessories[i];
                }
            }
            $accessoryList.text(str);
            $innerCol.append($accessoryList);
        }
        //END OUTFIT DISPLAY


        let $innerRow = $("<div class='row'></div>");
        let $currentInfo = $("<div class='col s6 left-align'></div>")
        let $summaryInfo = $("<div class='col s6 left-align'></div>")

        $innerCol.append($innerRow);
        $innerRow.append($currentInfo);
        $innerRow.append($summaryInfo);

         let $buttonCol = $("<div class='col s12 center-align'></div>'");
         let $backButton = $("<button id='back' type='button' class='waves-effect waves-light btn'>Back</button>");

         $backButton.click(function(){
             location.reload();
         });

         $innerCol.append($buttonCol);
         $buttonCol.append($backButton);



        let symbol = ((formData.units === "Celcius") ? "&#8451" : "&#8457");
        let date = new Date();
        let currDate = `${DAYS[date.getDay()]} ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        let currMinutes = formatMinutes(date.getMinutes());
        let currTime = `${date.getHours()}:${currMinutes}`
        let currIcon = ICONS[tempData.currentIcon];
        let currTemp = calcTemp(formData.units, tempData.currentTemp);


        $currentInfo.append("<p><strong>Currently:</strong></p>");
        $currentInfo.append(`<p>${currDate} @ ${currTime}</p>`);
        let $currContainer = $("<div class='row'></div>");
        let $currContainerLeft = $("<div class='col s6 center-align'></div>");
        let $currContainerRight = $("<div class='col s6 center-align'></div>");

        $currContainer.append($currContainerLeft);
        $currContainer.append($currContainerRight);
        $currentInfo.append($currContainer);

        $currContainerLeft.append(`<h3>${currTemp} ${symbol}</h3>`);
        $currContainerRight.append(`<img class='icon' src='${currIcon}' alt=${tempData.currentIcon}>`);



        let summIcon = ICONS[tempData.dayIcon];
        let highTemp = calcTemp(formData.units, tempData.highTemp.temp);
        let lowTemp = calcTemp(formData.units, tempData.lowTemp.temp);

        $summaryInfo.append("<p><strong>8-hr Summary:</strong></p>");
        $summaryInfo.append(`<p>High: ${highTemp} ${symbol} @ ${tempData.highTemp.timestamp}, Low: ${lowTemp} ${symbol} @ ${tempData.lowTemp.timestamp}`);
        $summaryInfo.append(`<div class='col s12 center-align'><br><img class='icon' src='${summIcon}' alt=${tempData.dayIcon}></div>`);








        $("#resultpage").toggle();

    } //END displayResults

    //Function to validate and process form input
    function processForm() {

        let formData = {
            nickname: $("#nickname").val(),
            zipcode: $("#zipcode").val(),
            units: $("input[name=units]:checked").val(),
            coldMax: Number($("#coldmax").val()),
            mildMin: Number($("#mildmin").val()),
            mildMax: Number($("#mildmax").val()),
            hotMax: Number($("#hotmax").val())
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
                console.log(darkskyData);
                tempData = {
                    currentTemp: Math.round(darkskyData.currently.apparentTemperature),
                    currentIcon: darkskyData.currently.icon,
                    dayIcon: darkskyData.daily.icon,
                    highTemp: getHighTemp(darkskyData.hourly.data),
                    lowTemp: getLowTemp(darkskyData.hourly.data)
                };
                let outfit = generateOutfit(formData, tempData);
                displayResults(formData, tempData, outfit);

            }); //END $xhr_darksky.done

        }); //END $xhr_google.done

        return tempData;
    } //END ajaxCalls

    function generateOutfit(formData, tempData) {
        let outfit = {};

        let currentConditions = "";
        let currentTemp = tempData.currentTemp;
        let midMild = Math.round((formData.mildMax + formData.mildMin) / 2);



        if(currentTemp <= formData.coldMax){
            currentConditions = "cold";
        } else if(currentTemp >= formData.mildMin && currentTemp <= midMild){
            currentConditions = "cool";
        } else if(currentTemp > midMild && currentTemp <= formData.mildMax){
            currentConditions = "warm";
        } else if(currentTemp >= formData.hotMax){
            currentConditions = "hot";
        } else {
            console.log("ERROR!");
            Materialize.toast("Something went wrong!", 4000);

        }

        //console.log(currentConditions);
        outfit.top = TOPS[currentConditions];
        outfit.bottom = BOTTOMS[currentConditions];
        outfit.outer = OUTER[currentConditions];

        outfit.accessories = [];
        outfit.accessories.push(((tempData.currentIcon === "rain" || tempData.dayIcon === "rain") ? ACCESSORIES.rain : "none" ));


        outfit.closedToeShoes = ((currentConditions === "cold" || currentConditions === "cool" || tempData.currentIcon === "rain" || tempData.dayIcon === "rain") ? true : false);




        //console.log(tempData.currentIcon);
        //console.log(tempData.dayIcon);
        //console.log(outfit);
        return outfit;

    }

    function getHighTemp(array) {
        let forecastObj = {};
        let maxTemp = Number.MIN_SAFE_INTEGER;
        let maxTempTime;
        for (let i = 0; i < 8; i++) {
            if (array[i].apparentTemperature > maxTemp) {
                maxTemp = array[i].apparentTemperature;
                maxTempTime = array[i].time;
            }
        }

        forecastObj.temp = Math.round(maxTemp);
        let date = new Date(maxTempTime * 1000);
        let hour = date.getHours();
        let minutes = formatMinutes(date.getMinutes());
        forecastObj.timestamp = `${hour}:${minutes}`
        console.log(forecastObj);
        return forecastObj;
    }

    function getLowTemp(array) {
        let forecastObj = {};
        let minTemp = Number.MAX_SAFE_INTEGER;
        let minTempTime;
        for (let i = 0; i < 8; i++) {
            if (array[i].apparentTemperature < minTemp) {
                minTemp = array[i].apparentTemperature;
                minTempTime = array[i].time;
            }
        }

        forecastObj.temp = Math.round(minTemp);
        let date = new Date(minTempTime * 1000);
        let hour = date.getHours();
        let minutes = formatMinutes(date.getMinutes());
        forecastObj.timestamp = `${hour}:${minutes}`
        return forecastObj;
    }

    function formatMinutes(minutes) {
        return (minutes < 10) ? "0" + minutes : minutes;
    }

    function calcTemp(unit, temp) {
        return (unit === "Celcius") ? Math.round((temp - 32) * (5 / 9)) : temp;
    }


});
