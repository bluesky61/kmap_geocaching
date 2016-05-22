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
                    async: false,
        success: function (response) {
           $("#wdialog").value = response;
           if (response == 'ERROR') {
                $("#wdialog").value = 'Wait a moment';
            } else {
                MemberID = response;
                $("#wdialog").dialog( "open" );
                window.setTimeout(function() {
                    koMap.removeAllMarkers(); 
                    geocacheDB.geocacheDB = [];
                    geocacheDB.getAllFromDB(MemberID, koMap);
            /*	koMap.attachHelpCallback(geocacheDB);
                    koMap.createMarker(geocacheDB);
                    koMap.changeMap("daum"); */ //moved into getAllFromDB()
                    $("#wdialog").dialog("close");
                    }, 100);
            }
        }
    });
}
/*
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
					geocacheDB.readGPXFile2(_idUser);
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
*/
function getHTML(gcNum)
{
	var form_data = {
		gcnumber: gcNum
	};

	$.ajax({
		type: "POST",
		url: "getHTMLFromDB.php",
		data: form_data,
		cache: false,
		async: false,
		success: function(data) {
			html = data;
			return html;
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(xhr.statusText);
			alert(xhr.responseText);
			alert(xhr.status);
			alert(thrownError);
			alert("There's somthing woring");
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