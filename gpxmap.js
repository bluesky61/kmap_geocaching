//----------------------------------
// gpxmap.js - map object and map controls
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------

function GPXMap() {
//constructor
// initialize gMap, dMap, nMap

	this.gMap = this.dMap = this.nMap = null;
	this.cMap = null; //(google, daum, naver)

	this.gMarkers = [];
	this.dMarkers = [];
	this.nMarkers = [];
	this.gMapListener = this.dMapListener = this.nMapListener = null;
	this.gInfoWindow = this.dInfoWindow = this.nInfoWindow = null;
	this.makeGHelpCallback = this.makeDHelpCallback = null;

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
	var length = geocacheDB.geocacheDB.length;

// Google Map
	function openGHelpWindow(gmarker) {
		var temp = gmarker.getTitle();
		var n_pos = temp.search('\n');
		var gcNum = temp.substr(0, n_pos);

		if(gInfoWindow) gInfoWindow.close();

		for( var j=0; j< length; j++){
			if(gcNum == gDB[j].gcNumber) break;
		}
		html = gDB[j].makeHTML();

		gInfoWindow = new google.maps.InfoWindow({
			content: html,
			size: new google.maps.Size(50,50)
		});

		gInfoWindow.open(gMap, gmarker);
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

		for( var j=0; j< length; j++){
			if(gcNum == gDB[j].gcNumber) break;
		}
		html = gDB[j].makeHTML();

		dInfoWindow = new daum.maps.InfoWindow({
			content: html
		});

		dInfoWindow.open(dMap, dmarker);
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
		
		for( var j=0; j< length; j++){
			if(gcNum == gDB[j].gcNumber) break;
		}
		html = gDB[j].makeHTML();

		nInfoWindow = new nhn.api.map.InfoWindow({
			point: oEvent.target.getPoint(),
			content: html
		});
		nInfoWindow.setOpacity(1);
		nInfoWindow.autoPosition();
		nInfoWindow.setVisible(true);

		nMap.addOverlay(nInfoWindow); 
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

	var GPXOwner = geocacheDB.GPXOwner;
	var gDB = geocacheDB.geocacheDB;
	var length = geocacheDB.geocacheDB.length;

	for(var i=0; i < length; i++){

		var lat = gDB[i].lat;
		var lon = gDB[i].lon;
		var gcIcon = gDB[i].gcType;

		if (GPXOwner !='guest') {
			if(gDB[i].gcPlaced) gcIcon = "Placed";
			if(gDB[i].gcFound) gcIcon ="Found";
		}

		// Google Map
		var gmarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lon),
			icon: {url:cacheImage[gcIcon]},
			title : gDB[i].gcNumber + '\n' + gDB[i].gcTitle,
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
		dmarker.setTitle(gDB[i].gcNumber + '\n' + gDB[i].gcTitle);
		dmarker.setMap(dMap);

		this.dMarkers.push(dmarker);

		daum.maps.event.addListener(dmarker, "click", this.makeDHelpCallback(dmarker));

		// Naver Map
		var oSize = new nhn.api.map.Size(16, 16);
		var oIcon = new nhn.api.map.Icon(cacheImage[gcIcon], oSize);
		var nposition = new nhn.api.map.LatLng(lat, lon);
		var nmarker = new nhn.api.map.Marker(oIcon, {
			point : nposition,
			title : gDB[i].gcNumber + '\n' + gDB[i].gcTitle
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

	this.nMap.addOverlay();
}

GPXMap.prototype.regisiterGBoundsEvent = function() {
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gMap = this.gMap;

	if(this.dMapListener)
		daum.maps.event.removeListener(dMap, 'bounds_changed', this.dMapListener);
	if(this.nMapListener)
		nMap.detach('move', this.nMapListener);

	var gMapBoundsChanged = function() {

		var gMapBounds = gMap.getBounds();
		var neLL = gMapBounds.getNorthEast();
		var neLat = neLL.lat();
		var neLon = neLL.lng();

		var swLL = gMapBounds.getSouthWest();
		var swLat = swLL.lat();
		var swLon = swLL.lng();

		var dbounds = new daum.maps.LatLngBounds(
				new daum.maps.LatLng(swLat, swLon),
				new daum.maps.LatLng(neLat, neLon));
		dMap.setBounds(dbounds);
		dMap.setLevel(dMap.getLevel()-1);

		var minPoint = new nhn.api.map.LatLng(swLat, swLon);
		var maxPoint = new nhn.api.map.LatLng(neLat, neLon);
		nMap.setBound([minPoint, maxPoint]);

	}

	this.gMapListener = google.maps.event.addListener(gMap, 'bounds_changed', gMapBoundsChanged );

}

GPXMap.prototype.regisiterDBoundsEvent = function() {
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gMap = this.gMap;

	if(this.gMapListener)
		google.maps.event.removeListener(this.gMapListener);
	if(this.nMapListener)
		nMap.detach('move', this.nMapListener);

	var dMapBoundsChanged = function() {

		var dMapBounds = dMap.getBounds();
		var neLL = dMapBounds.getNorthEast();
		var neLat = neLL.getLat();
		var neLon = neLL.getLng();

		var swLL = dMapBounds.getSouthWest();
		var swLat = swLL.getLat();
		var swLon = swLL.getLng();

		var cenLat = (neLat + swLat)/2;
		var cenLon = (neLon + swLon)/2;
		
		var gbounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(swLat, swLon),
				new google.maps.LatLng(neLat, neLon)
		);

		gMap.setCenter(new google.maps.LatLng(cenLat, cenLon));
		gMap.setZoom(20 - dMap.getLevel());
		var ggbounds = gMap.getBounds();

		var minPoint = new nhn.api.map.LatLng(swLat, swLon);
		var maxPoint = new nhn.api.map.LatLng(neLat, neLon);
		nMap.setBound([minPoint, maxPoint]);
		nMap.setLevel(nMap.getLevel()+1);

	}

	this.dMapListener = dMapBoundsChanged;
	daum.maps.event.addListener(dMap, 'bounds_changed', dMapBoundsChanged);
}

GPXMap.prototype.regisiterNBoundsEvent = function() {
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gMap = this.gMap;

	if(this.gMapListener)
		google.maps.event.removeListener(this.gMapListener);
	if(this.dMapListener)
		daum.maps.event.removeListener(dMap, 'bounds_changed', this.dMapListener);

	var nMapBoundsChanged = function() {

		var nMapBound = nMap.getBound();
		var swLon = nMapBound[0].lng();
		var swLat = nMapBound[0].lat();
		var neLon = nMapBound[1].lng();
		var neLat = nMapBound[1].lat();

		var cc = nMap.getCenter();

		var cenLat = (neLat + swLat)/2;
		var cenLon = (neLon + swLon)/2;
		
		var dbounds = new daum.maps.LatLngBounds(
				new daum.maps.LatLng(swLat, swLon),
				new daum.maps.LatLng(neLat, neLon));
		dMap.setBounds(dbounds);
		dMap.setLevel(dMap.getLevel()-1);
		
		var gbounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(swLat, swLon),
				new google.maps.LatLng(neLat, neLon)
		);

		gMap.setZoom(nMap.getLevel()+5);
		var glevel = gMap.getZoom();
		var nlevel = nMap.getLevel();
		gMap.setCenter(new google.maps.LatLng(cenLat, cenLon));
		var ggbounds = gMap.getBounds();
	}

	this.nMapListener = nMapBoundsChanged;
	nMap.attach('move', this.nMapListener);
}

GPXMap.prototype.centerAndZoom = function(geocaches) {

	var minlat = geocaches.minlat;
	var maxlat = geocaches.maxlat;
	var minlon = geocaches.minlon;
	var maxlon = geocaches.maxlon;

	// Center around the middle of the points
	var centerlat = (maxlat + minlat) / 2;
	var centerlon = (maxlon + minlon) / 2;

	var bounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(minlat, minlon),
			new google.maps.LatLng(maxlat, maxlon));
	// this.gMap.setCenter(new google.maps.LatLng(centerlat, centerlon));
	this.gMap.fitBounds(bounds);

	// Daum Map
	var dbounds = new daum.maps.LatLngBounds(
			new daum.maps.LatLng(minlat, minlon),
			new daum.maps.LatLng(maxlat, maxlon));
	// this.dMap.setCenter(new daum.maps.LatLng(centerlon, centerlat));
	this.dMap.setBounds(dbounds);

	// Naver Map
	// var centerPoint = new nhn.api.map.LatLng(centerlat, centerlon);
	// this.nMap.setCenter(centerPoint);

	var minPoint = new nhn.api.map.LatLng(minlat, minlon);
	var maxPoint = new nhn.api.map.LatLng(maxlat, maxlon);
	this.nMap.setBound([minPoint, maxPoint]);

};

GPXMap.prototype.changeMap = function(service){

	this.cMap = service;

/*	$('#dmap').detach(); 
	$('#nmap').detach(); 
	$('#gmap').detach(); 
	$('body').append('<div id="nmap">');
	$('body').append('<div id="gmap">');
	$('body').append('<div id="dmap">');
*/
	$('#dmap').hide();
	$('#nmap').hide();
	$('#gmap').hide();
	$('#google').css("background-color", "LightGray");
	$('#naver').css("background-color", "LightGray");
	$('#daum').css("background-color", "LightGray");

	if (service == "daum") 
	{	
		$('#dmap').show();
		$('#daum').css("background-color", "SkyBlue ");
		this.regisiterDBoundsEvent();
	} else if (service == 'naver')
	{
		$('#nmap').show();
		$('#naver').css("background-color", "SkyBlue ");
		this.regisiterNBoundsEvent();
	} else 
	{
		$('#gmap').show();
		$('#google').css("background-color", "SkyBlue ");
		this.regisiterGBoundsEvent();
	} 
};
