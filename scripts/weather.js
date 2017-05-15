$(document).ready(function() {


    $("#coldmax").change(function(){
        $("#coolmin").val(parseInt($("#coldmax").val())+1);
        $("#coolmax").val(parseInt($("#coolmin").val())+1);
        $("#warmmin").val(parseInt($("#coolmax").val())+1);
    });


    $("#coolmax").change(function(){
        if(parseInt($("#coolmax").val()) < parseInt($("#coolmin").val())){
            //$("#coolmax").addClass("red");
            Materialize.toast(`Please enter a value greater than ${$("#coolmin").val()}`, 4000);
        } else {
            $("#warmmin").val(parseInt($("#coolmax").val())+1);
        }
    });

    $("#warmmax").change(function(){
        if(parseInt($("#warmmax").val()) < parseInt($("#warmmin").val())){
            //$("#coolmax").addClass("red");
            Materialize.toast(`Please enter a value greater than ${$("#warmmin").val()}`, 4000);
        } else {
            $("#hotmax").val(parseInt($("#warmmax").val())+1);
        }

    });


    //Listener for "Clear" button
    $("#clear").click(function() {
        $("form").trigger("reset");
    });

    //Listner for form submission
    $("form").submit(function(event) {
        event.preventDefault();
        processForm();
    });


    function processForm() {

        let postInfo = {};
        let $nickname = $("nickname").val();


        //Error checking for each AJAX call
        $.ajaxSetup({
            error: function(xhr, status, error) {
                console.log(`An AJAX error occurred: ${xhr.status} ${error}.`)
                return;
            }
        });

        let $xhr_google = $.getJSON("http://galvanize-cors-proxy.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=78728&key=AIzaSyBB6SAGxzrKyG3TEhlDJDLNfulXhPguo3M");

        $xhr_google.done(function(googleData) {
            // console.log("GOOGLE API REQUEST NO PROBLEM!");
        });

        let $xhr_darksky = $.getJSON("http://galvanize-cors-proxy.herokuapp.com/https://api.darksky.net/forecast/4425e1c1ccfdf34f99ecc35f208760b3/30.267153,-97.743061");

        $xhr_darksky.done(function(darkskyData) {

            // console.log("DARKSKY API REQUEST NO PROBLEM!");
        });

    }


});
