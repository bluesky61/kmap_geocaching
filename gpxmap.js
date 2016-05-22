//----------------------------------
// gpxmap.js - map object and map controls
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------
var cacheImage = {
	"Traditional Cache" : "images/2.gif",
	"Multi-cache" : "images/3.gif",
	"Virtual Cache" : "images/4.gif",
	"Letterbox Hybrid" : "images/5.gif",
	"Event Cache" : "images/6.gif",
	"Wherigo Cache" : "images/7.gif",
	"Unknown Cache" : "images/8.gif",
	"Earthcache" : "images/9.gif",
	"Cache In Trash Out Event" : "images/cito.gif",
	"Found" : "images/found.png",
	"Placed" : "images/placed.png"
	};

function GPXMap() {
//constructor
// initialize gMap, dMap, nMap

	this.gMap = this.dMap = this.nMap = null;
	this.cMap = 'old'; //(google, daum, naver)

	this.gMarkers = [];
	this.dMarkers = [];
	this.nMarkers = [];
	this.gMapListener = this.dMapListener = this.nMapListener = null;
	this.gInfoWindow = this.dInfoWindow = this.nInfoWindow = null;
	this.makeGHelpCallback = this.makeDHelpCallback = null;


	// Naver Map
	nMap = new nhn.api.map.Map(document.getElementById('nmap') ,{
		zoom : 10,
		mapMode : 0,
		activateTrafficMap : false,
		activateBicycleMap : false,
		minMaxLevel : [ 1, 14 ]
	});

	var oSlider = new nhn.api.map.ZoomControl();
	nMap.addControl(oSlider);
	oSlider.setPosition({
		top : 50,
		ringt : 10
	});

	var oMapTypeBtn = new nhn.api.map.MapTypeBtn();
	nMap.addControl(oMapTypeBtn);
	oMapTypeBtn.setPosition({
		top : 10,
		right : 10
	});

	this.nMap = nMap;

	// Daum Map
	var dMap = new daum.maps.Map(document.getElementById('dmap'), {
		center: new daum.maps.LatLng(37.56613, 126.97805),
		level: 6,
		mapTypeId: daum.maps.MapTypeId.ROADMAP
	});

	var zoomControl = new daum.maps.ZoomControl();
	dMap.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
	var mapTypeControl = new daum.maps.MapTypeControl();
	dMap.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

	this.dMap = dMap;

	var gMap = new google.maps.Map(document.getElementById('gmap'), {
		zoom: 13,
		center: {lat: 37.56613, lng: 126.97805} , 
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		streetViewControl: true,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.RIGHT_TOP
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.RIGHT_TOP
		}
	});
	gMap.setZoom(14);
	this.gMap = gMap;

	this.changeMap("google");
};

GPXMap.prototype.attachHelpCallback = function(geocacheDB) {
	var gMap = this.gMap;
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gInfoWindow = this.gInfoWindow;
	var dInfoWindow = this.dInfoWindow;
	var nInfoWindow = this.nInfoWindow;

	var gDB = geocacheDB.geocacheDB;

// Google Map
	function openGHelpWindow(gmarker) {
		var temp = gmarker.getTitle();
		var n_pos = temp.search('\n');
		var gcNum = temp.substr(0, n_pos);

		if(gInfoWindow) gInfoWindow.close();

		/* get HTML from server. with gcnumber*/
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
				gInfoWindow = new google.maps.InfoWindow({
					content: html,
					size: new google.maps.Size(50,50)
				});

				gInfoWindow.open(gMap, gmarker);
			}
		});

	}

	this.makeGHelpCallback = function (gmarker) {
	  return function() {
		openGHelpWindow(gmarker);
	  };
	}

	google.maps.event.addListener(gMap, "click", function(){
				if(gInfoWindow) gInfoWindow.close();
	});

// DAUM Map
	function openDHelpWindow(dmarker) {
		var temp = dmarker.getTitle();
		var n_pos = temp.search('\n');
		var gcNum = temp.substr(0, n_pos);

		if(dInfoWindow) dInfoWindow.close();

		var form_data = {
			gcnumber: gcNum
		};

		$.ajax({
			type: "POST",
			url: "getHTMLFromDB.php",
			data: form_data,
			cache: false,
			success: function(data) {
				html = data;
				dInfoWindow = new daum.maps.InfoWindow({
					content: html
				});

				dInfoWindow.open(dMap, dmarker);
			}
		});

	}

	this.makeDHelpCallback = function(dmarker) {
	  return function() {
		openDHelpWindow(dmarker);
	  };
	}

	daum.maps.event.addListener(dMap, "click", function(){
				if(dInfoWindow) dInfoWindow.close();
	});

// Naver Map
	nMap.attach('click', function(oEvent) {

		try{
			var temp =  oEvent.target.getTitle();
			var n_pos = temp.search('\n');
			var gcNum = temp.substr(0, n_pos);
		} 
		finally {
			if(nInfoWindow) nInfoWindow.setVisible(false);
		}
		
		var form_data = {
			gcnumber: gcNum
		};

		$.ajax({
			type: "POST",
			url: "getHTMLFromDB.php",
			data: form_data,
			cache: false,
			success: function(data) {
				html = data;
				nInfoWindow = new nhn.api.map.InfoWindow({
					point: oEvent.target.getPoint(),
					content: html
				});
				nInfoWindow.setOpacity(1);
				nInfoWindow.autoPosition();
				nInfoWindow.setVisible(true);

				nMap.addOverlay(nInfoWindow); 
			}
		});
	});

	var oLabel = new nhn.api.map.MarkerLabel();
	nMap.addOverlay(oLabel);

	nMap.attach('mouseenter', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;
			if (oTarget instanceof nhn.api.map.Marker) {
					var oMarker = oTarget;
					oLabel.setVisible(true, oMarker); // - 특정 마커를 지정하여 해당 마커의 title을 보여준다.
			}
	});

	nMap.attach('mouseleave', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;
			if (oTarget instanceof nhn.api.map.Marker) {
					oLabel.setVisible(false);
			}
	});

};

GPXMap.prototype.createMarker = function(geocacheDB) {
	var gMap = this.gMap;
	var dMap = this.dMap;
	var nMap = this.nMap;

	var gDB = geocacheDB.geocacheDB;
	var length = geocacheDB.geocacheDB.length;

	for(var i=0; i < length; i++){

		var gcNumber = gDB[i][0];
		var gcTitle = gDB[i][1];
		var lat = gDB[i][2];
		var lon = gDB[i][3];
		var gcIcon = gDB[i][4];

		// Google Map
		var gmarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lon),
			icon: {url:cacheImage[gcIcon]},
			title : gcNumber + '\n' + gcTitle,
			map: gMap
		});

		this.gMarkers.push(gmarker);

		google.maps.event.addListener(gmarker, "click", this.makeGHelpCallback(gmarker));

		// Daum Map

		var dposition = new daum.maps.LatLng(lat, lon);
		
		var dicon = new daum.maps.MarkerImage(
			cacheImage[gcIcon],
			new daum.maps.Size(16,16)
		);

		var dmarker = new daum.maps.Marker({
			position: dposition,
			image: dicon
		});
		dmarker.setTitle(gcNumber + '\n' + gcTitle);
		dmarker.setMap(dMap);

		this.dMarkers.push(dmarker);

		daum.maps.event.addListener(dmarker, "click", this.makeDHelpCallback(dmarker));

		// Naver Map
		var oSize = new nhn.api.map.Size(16, 16);
		var oIcon = new nhn.api.map.Icon(cacheImage[gcIcon], oSize);
		var nposition = new nhn.api.map.LatLng(lat, lon);
		var nmarker = new nhn.api.map.Marker(oIcon, {
			point : nposition,
			title : gcNumber + '\n' + gcTitle
		});
		nMap.addOverlay(nmarker); 
		nmarker.setVisible(true);

		this.nMarkers.push(nmarker);
	}
};

GPXMap.prototype.removeAllMarkers = function(){
	var gmarkers = this.gMarkers;
	var dmarkers = this.dMarkers;
	var nmarkers = this.nMarkers;

// googlemaps
	for (var i = 0; i < gmarkers.length; i++) {
		gmarkers[i].setMap(null);
	}
	gmarkers = [];

// daum map
	for (var i = 0; i < dmarkers.length; i++) {
		dmarkers[i].setMap(null);
	}
	dmarkers = [];

// naver map
	this.nMap.clearOverlay();
	nmarkers= [];
}

GPXMap.prototype.changeMap = function(service){

	var oldservice = this.cMap;
	this.cMap = service;
	var nMap = this.nMap;
	var dMap = this.dMap;
	var gMap = this.gMap;

	var cenPoint;
	var cenX = cenY = 0;

	var oldLevel, newLevel;

	if(oldservice == 'old') {
		$('#dmap').hide();
		$('#nmap').hide();
		$('#gmap').show();
		$('#google').css("background-color", "SkyBlue ");

		return;
	}

	if (oldservice == service){
		return;
	}

	if (oldservice == 'daum') {
		cenPoint = dMap.getCenter();
		cenY = cenPoint.getLat();
		cenX = cenPoint.getLng();

		oldLevel = dMap.getLevel();

		$('#dmap').hide();
		$('#daum').css("background-color", "LightGray");
	} else if(oldservice == 'naver') {
		cenPoint = nMap.getCenter();
		cenY = cenPoint.getY();
		cenX = cenPoint.getX();

		oldLevel = nMap.getLevel();
		$('#nmap').hide();
		$('#naver').css("background-color", "LightGray");
	} else if(oldservice == 'google') {
		cenPoint = gMap.getCenter();
		cenY = cenPoint.lat();
		cenX = cenPoint.lng();

		oldLevel = gMap.getZoom();
		$('#gmap').hide();
		$('#google').css("background-color", "LightGray");
	}

	if (service == "daum") 
	{	
		if(oldservice =='google')
			newLevel = 20 -oldLevel;
		else if (oldservice == 'naver')
			newLevel = 15 - oldLevel;
		if (newLevel >14) newLevel = 14;
		if (newLevel <1) newLevel =1;
		dMap.setLevel(newLevel);

		dMap.setCenter(new daum.maps.LatLng(cenY, cenX));

		$('#dmap').show();
		$('#daum').css("background-color", "SkyBlue ");
	} else if (service == 'naver')
	{
		if(oldservice =='google')
			newLevel = oldLevel - 5;
		else if (oldservice == 'daum')
			newLevel = 15 - oldLevel;

		if (newLevel >14) newLevel = 14;
		if (newLevel <1) newLevel =1;
		nMap.setLevel(newLevel);

		nMap.setCenter(new nhn.api.map.LatLng(cenY, cenX));

		$('#nmap').show();
		$('#naver').css("background-color", "SkyBlue ");
	} else //google
	{
		if(oldservice =='naver')
			newLevel = oldLevel + 5;
		else if (oldservice == 'daum')
			newLevel =  20 - oldLevel;

		if (newLevel >19) newLevel = 19;
		if (newLevel <6) newLevel =6;

		gMap.setZoom(newLevel);

		gMap.setCenter(new google.maps.LatLng(cenY, cenX));

		$('#gmap').show();
		$('#google').css("background-color", "SkyBlue ");
	} 
};
