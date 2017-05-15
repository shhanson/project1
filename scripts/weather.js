$(document).ready(function() {

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
        processForm();
    });

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

        //console.log(formInfo);

        if (formData.mildMin > formData.coldMax && formData.mildMax > formData.mildMin && formData.hotMax > formData.mildMax && (/(^\d{5}$)|(^\d{5}-\d{4}$)/).test(formData.zipcode)){
            ajaxCalls(formData);
        } else {
            Materialize.toast("Input error!", 4000);
            return;
        }

    }//END processForm

    function ajaxCalls(formData) {

        let longitude;
        let latitude;

        //Error checking for each AJAX call
        $.ajaxSetup({
            error: function(xhr, status, error) {
                console.log(`An AJAX error occurred: ${xhr.status} ${error}.`)
                return;
            }
        });

        let $xhr_google = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=${formData.zipcode}&key=AIzaSyBB6SAGxzrKyG3TEhlDJDLNfulXhPguo3M`);


        $xhr_google.done(function(googleData) {
            // console.log("GOOGLE API REQUEST NO PROBLEM!");
            //console.log(googleData);
            latitude = googleData.results[0].geometry.location.lat;
            longitude = googleData.results[0].geometry.location.lng;

            let $xhr_darksky = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/${latitude},${longitude}`);

            $xhr_darksky.done(function(darkskyData) {

                //console.log("DARKSKY API REQUEST NO PROBLEM!");
                //console.log(darkskyData);
            });


        });



    } //END ajaxCalls


});
