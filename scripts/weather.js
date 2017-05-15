$(document).ready(function() {
    console.log("Hello from jQuery land!");

    //Error checking for each AJAX call
    $.ajaxSetup({
        error: function(xhr, status, error) {
            console.log(`An AJAX error occurred: ${xhr.status} ${error}.`)
            return;
        }
    });

    let $xhr_google = $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?address=78728&key=AIzaSyBB6SAGxzrKyG3TEhlDJDLNfulXhPguo3M");

    $xhr_google.done(function(google_data){
        console.log("GOOGLE API REQUEST NO PROBLEM!");
        //console.log(google_data);


    });

    let $xhr_darksky = $.getJSON("https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/30.267153,-97.743061");

    $xhr_darksky.done(function(darksky_data) {

        console.log("DARKSKY API REQUEST NO PROBLEM!");
        //console.log(data);
    });
});
