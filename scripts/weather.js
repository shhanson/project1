$(document).ready(function() {
    console.log("Hello from jQuery land!");

    //Error checking for each AJAX call
    $.ajaxSetup({
        error: function(xhr, status, error) {
            console.log(`An AJAX error occurred: ${xhr.status} ${error}.`)
            return;
        }
    });

    let $xhr = $.getJSON("https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/30.267153,-97.743061");

    $xhr.done(function(data) {

        console.log("API REQUEST NO PROBLEM!");
        //console.log(data);
    });
});
