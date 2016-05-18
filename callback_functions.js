//----------------------------------
// callback_functions.js - functions required in kmap_geocaching.html
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------

var readin = function(koMap, geocacheDB){
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
                if (response == 'success' || response == "__RESET__") {
					$("#wdialog").dialog( "open" );
					window.setTimeout(function() {
						koMap.removeAllMarkers(); 
						geocacheDB.geocacheDB = [];
						geocacheDB.readGPXFile(_idUser);
						koMap.attachHelpCallback(geocacheDB);
						koMap.createMarker(geocacheDB);
						koMap.changeMap("daum");
						$("#wdialog").dialog("close");
						}, 100);
				} else {  //check here!!!!!
                    $("#wdialog").value = '아이디 또는 비밀번호가 잘못되었습니다';
                }
            }
        });
}

// File Upload
var upload = function(koMap, geocacheDB ){
	if(_file.files.length === 0){
	return;
	}

	var _idUser = document.getElementById("userid").value;
	var data = new FormData();
	data.append('SelectedFile', _file.files[0]);
	data.append('userid', _idUser);

	var request = new XMLHttpRequest();
	request.onreadystatechange = function(){
		if(request.readyState == 4){
			try {
				var resp = JSON.parse(request.response);
			} catch (e){
				var resp = {
					status: 'error',
					data: 'Unknown error occurred: [' + request.responseText + ']'
				};
			}
//			console.log(resp.status + ': ' + resp.data);
			
			if(request.status == 200) {

				$("#wdialog").dialog( "open" );
				window.setTimeout(function(){
					koMap.removeAllMarkers(); //If upper side, this should be deleted.
					geocacheDB.geocacheDB=[];
					geocacheDB.readGPXFile(_idUser);
					koMap.createMarker(geocacheDB);
					koMap.changeMap("daum");
					$("#wdialog").dialog("close");
					}, 100);
			}
		}
	};

	request.open('POST', 'upload_gpx.php');
	request.send(data);
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