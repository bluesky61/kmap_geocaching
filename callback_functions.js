//----------------------------------
// callback_functions.js - functions required in kmap_geocaching.html
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------

var readin = function(koMap, geocacheDB, whichmap){
    var _idUser = $("#userid").val();
    var _pwUser = $("#pwd").val();

    var form_data = {
        user_id: _idUser,
        user_pw: _pwUser
    };
    
    $.ajax({
        type: "POST",
        url: "login_check_sql.php",
        data: form_data,
        success: function (response) {
            if(response=="ERROR"){
                $("#wdialog").text('No such id/pw').dialog("open");
                window.setTimeout(function() {
                    $("#wdialog").dialog("close");
                }, 1000);
            } else {
                MemberID = response;
                $("#wdialog").text('Wait a moment!').dialog( "open" );
                window.setTimeout(function() {
                    koMap.removeAllMarkers(whichmap); 
                    geocacheDB.geocacheDB = [];
                    geocacheDB.getAllFromDB(MemberID, koMap, whichmap);
                    $("#wdialog").dialog("close");
                }, 100);
            }
        }
    });
}

// panning to current position
// not working now
/*
var currentLocation = function(koMap){

  if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		var cLat = position.coords.latitude;
		var cLon = position.coords.longitude;

		if(geocaches.cMap == "google")
			koMap.gMap.setCenter(new google.maps.LatLng(cLat, cLon));
		else if(geocaches.cMap == "daum")
			koMap.dMap.setCenter(new daum.maps.LatLng(cLat, cLon));
		else
			koMap.nMap.setCenter(new nhn.api.map.LatLng(cLat, cLon));
    }); }
}
*/