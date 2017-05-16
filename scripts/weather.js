$(document).ready(function() {

    const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    const NICKNAME_REGEX = /^[A-Za-z0-9_\-]{4,}$/;

    $("#nickname").change(function(){
        if(!NICKNAME_REGEX.test($("#nickname").val())){
            Materialize.toast('Nickname must be at least 4 characters in length, alphanumeric, "-" and "_" allowed', 4000);
        }
    });

    $("#zipcode").change(function(){
        if(!ZIP_REGEX.test($("#zipcode").val())){
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
        $("#page1").toggle();
        $("#resultpage").toggle();


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

        //Validating the fields before submission again JUST IN CASE
        if (formData.mildMin > formData.coldMax && formData.mildMax > formData.mildMin && formData.hotMax > formData.mildMax && ZIP_REGEX.test(formData.zipcode) && NICKNAME_REGEX.test(formData.nickname)){
            return formData;
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
            console.log(googleData);
            latitude = googleData.results[0].geometry.location.lat;
            longitude = googleData.results[0].geometry.location.lng;

            let $xhr_darksky = $.getJSON(`http://galvanize-cors-proxy.herokuapp.com/https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/${latitude},${longitude}`);

            $xhr_darksky.done(function(darkskyData) {

                //console.log("DARKSKY API REQUEST NO PROBLEM!");
                //console.log(darkskyData);
            }); //END $xhr_darksky.done


        }); //END $xhr_google.done



    } //END ajaxCalls


});
