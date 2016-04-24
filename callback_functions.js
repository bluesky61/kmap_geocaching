//----------------------------------
// callback_functions.js - functions required in kmap_geocaching.html
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------

var guestIdPw = [
	{"gcId":"guest", "gcPw":"1234"},
	{"gcId":"test", "gcPw":"1234"},
	{"gcId":"bluesky61", "gcPw":"bluesky61" },
	{"gcId":"hkbaik", "gcPw" : "hkbaik" },
	{"gcId":"generalred", "gcPw" : "generalred" },
	{"gcId":"Winny Lee", "gcPw" : "Winny Lee" },
	{"gcId":"ttettu", "gcPw" : "ttettu1234" },
	{"gcId":"hl1shy", "gcPw" : "hl1shy1234" },
	{"gcId":"suk8a", "gcPw" : "4457" },
	{"gcId":"K-one", "gcPw" : "kyh7935" },
	{"gcId":"Jiho Kim", "gcPw" : "Jiho" },
	{"gcId":"bluejay99", "gcPw" : "3650geo" },
	{"gcId":"YEHA", "gcPw" : "YEHA" }
];		

var checkLogin = function(_idUser, _pwUser, koMap, geocacheDB){

	var found=-1;
	for (var i=0;i<guestIdPw.length ;i++ )
	{
		if(_idUser == guestIdPw[i].gcId && _pwUser == guestIdPw[i].gcPw ){
			found=i; break;
		}
	}
	if (found ==-1){
		alert("No such ID");
	}else{  // Login Successful
		return found;		
	}
}

// panning to current position
var currentLocation = function(pos){

	if (!navigator.geolocation) throw "No support for location information!";
	
	var cLat = pos.coords.latitude;
	var cLon = pos.coords.longitude;

	if(geocaches.cMap == "google")
		geocaches.gMap.setCenter(new google.maps.LatLng(cLat, cLon));
	else if(geocaches.cMap == "daum")
		geocaches.dMap.setCenter(new daum.maps.LatLng(cLat, cLon));
	else
		geocaches.nMap.setCenter(new nhn.api.map.LatLng(cLat, cLon));
	
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
			console.log(resp.status + ': ' + resp.data);
			
			if(request.status == 200) {
/*					$('#dmap').detach(); 
					$('#nmap').detach(); 
					$('#gmap').detach(); 
					$('body').append('<div id="nmap">');
					$('body').append('<div id="gmap">');
					$('body').append('<div id="dmap">');
					koMap = new GPXMap();
*/
				$("#wdialog").dialog( "open" );
				window.setTimeout(function(){
					koMap.removeAllMarkers(); //If upper side, this should be deleted.
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
