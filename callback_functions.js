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
var upload = function(_submit, _file, _progress, _idUser){
	if(_file.files.length === 0){
	return;
	}

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
			_progress.style.width = "20%";
			
			if(request.status == 200) {
				$('#dmap').detach(); 
				$('#nmap').detach(); 
				$('#gmap').detach(); 
				$('body').append('<div id="dmap">');
				$('body').append('<div id="nmap">');
				$('body').append('<div id="gmap">');
		
				geocaches = new GPXMap(_idUser); // initialize Maps
				readGPXFile(geocaches, _idUser);
			}
		}
	};

	request.upload.addEventListener('progress', function(e){
		_progress.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
	}, false);

	request.open('POST', 'upload_gpx.php');
	request.send(data);
}
