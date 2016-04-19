//----------------------------------
// gpxmap.js - map object and map controls
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------

function GPXMap() {
//constructor
// initialize gMap, dMap, nMap

	this.cMap = "daum";
	this.gMapListener = this.dMapListener = this.nMapListener = null;
	this.gInfoWindow = this.dInfoWindow = this.nInfoWindow = null;
	this.gMap = this.dMap = this.nMap = null;

	var gMap = new google.maps.Map(document.getElementById('gmap'), {
		zoom: 8,
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
	this.gMap = gMap;

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

};


GPXMap.prototype.createMarker = function(geocaches) {
	var gMap = this.gMap;
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gDB = geocaches.geocacheDB;
	var GPXOwner = geocaches.GPXOwner;
	var length = geocaches.geocacheDB.length;
	var gInfoWindow = this.gInfoWindow;
	var dInfoWindow = this.dInfoWindow;
	var nInfoWindow = this.nInfoWindow;

// Google Map
	function openGHelpWindow(gmarker) {
		var gcNum = gmarker.getTitle();

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

	function makeGHelpCallback(gmarker) {
	  return function() {
		openGHelpWindow(gmarker);
	  };
	}

	google.maps.event.addListener(gMap, "click", function(){
				if(gInfoWindow) gInfoWindow.close();
	});

// DAUM Map
	function openDHelpWindow(dmarker) {
		var gcNum = dmarker.getTitle();

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

	function makeDHelpCallback(dmarker) {
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
			var gcNum = oEvent.target.getTitle();
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

	for(var i=0; i < length; i++){

		var lat = gDB[i].lat;
		var lon = gDB[i].lon;
		var gcIcon = gDB[i].gcType;
		var html = gDB[i].makeHTML();

		if (GPXOwner !='guest') {
			if(gDB[i].gcPlaced) gcIcon = "Placed";
			if(gDB[i].gcFound) gcIcon ="Found";
		}

		// Google Map
		var gmarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lon),
			icon: {url:cacheImage[gcIcon]},
			title : gDB[i].gcNumber,
			map: gMap
		});

		google.maps.event.addListener(gmarker, "click", makeGHelpCallback(gmarker));

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
		dmarker.setTitle(gDB[i].gcNumber);
		dmarker.setMap(dMap);

		daum.maps.event.addListener(dmarker, "click", makeDHelpCallback(dmarker));

		// Naver Map
		var oSize = new nhn.api.map.Size(16, 16);
		var oIcon = new nhn.api.map.Icon(cacheImage[gcIcon], oSize);
		var nposition = new nhn.api.map.LatLng(lat, lon);
		var nmarker = new nhn.api.map.Marker(oIcon, {
			point : nposition,
			title : gDB[i].gcNumber
		});
		nMap.addOverlay(nmarker); 
		nmarker.setVisible(true);
	}
};

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