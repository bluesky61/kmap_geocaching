///////////////////////////////////////////////////////////////////////////////
// geocachegpx.js
//
///////////////////////////////////////////////////////////////////////////////

cacheImage={
	"Traditional":"images/2.gif",
	"Multi":"images/3.gif",
	"Virtual":"images/4.gif",
	"Letterbox":"images/5.gif",
	"Event":"images/6.gif",
	"Wherigo":"images/7.gif",
	"Unknown":"images/8.gif",
	"Earthcach":"images/9.gif",
	"Cache":"images/cito.gif",
	"Found":"images/found.png",
	"Placed":"images/placed.png"
};

diffImage={
	'1'  :"images/stars1.gif",
	'1.5':"images/stars1_5.gif",
	'2'  :"images/stars2.gif",
	'2.5':"images/stars2_5.gif",
	'3'  :"images/stars3.gif",
	'3.5':"images/stars3_5.gif",
	'4'  :"images/stars4.gif",
	'4.5':"images/stars4_5.gif",
	'5'  :"images/stars5.gif"
};

sizeImage={
	"Micro" :"images/micro.gif",
	"Small" :"images/small.gif",
	"Regular" :"images/regular.gif",
	"Large" :"images/large.gif",
	"Not chosen" :"images/not_chosen.gif",
	"Virtual" :"images/virtual.gif",
	"Other" : "images/other.gif"
};

function Geocache(lat,lon,gcNumber,gcTitle,gcUrl,gcHidden, gcOwner, gcType, gcSize, gcDiff, gcTerr, gcPlaced, gcFound) {
	this.lat = lat;
	this.lon = lon;
	this.gcNumber = gcNumber;
	this.gcTitle = gcTitle;
	this.gcUrl = gcUrl;
	this.gcOwner = gcOwner;
	this.gcHidden = gcHidden;
	this.gcType = gcType;
	this.gcSize = gcSize;
	this.gcDiff = gcDiff;
	this.gcTerr = gcTerr;
	this.gcPlaced = gcPlaced;
	this.gcFound = gcFound;
}

Geocache.prototype.makeHTML = function() {
	var html = "";

	html += "<div style='font-size: 12px;background-color:#FFFFFF;width:310px'> <table border='0'><tr><td colspan='2'>"
	html += "<img src=" + cacheImage[this.gcType] + ">";
	html += "<a href=" + this.gcUrl + " target='_blank'><span><b>" + this.gcTitle + "</b></a></span><span style='float:right'>" + this.gcNumber + "</span><br /></td></tr>";
	html += "<tr><td width='150'>Created by : " + this.gcOwner + "</td><td width='150'>Hidden : " + this.gcHidden + "</td></tr>";
	html += "<tr><td>Difficulty : <img src=" + diffImage[this.gcDiff] + "></td><td>Terrain : <img src=" + diffImage[this.gcTerr] + "></td></tr>";
	html += "<tr><td>Size : <img src=" + sizeImage[this.gcSize] + "></td><td>Type : " + this.gcType + "</td></tr></table></div>";

	return html;
};

function GPXMap(GPXOwner) {

	this.geocacheDB = null;
	this.GPXOwner = GPXOwner;
	this.cMap = "daum";
	this.gMapListener = this.dMapListener = this.nMapListener = null;
	this.gInfoWindow = this.dInfoWindow = this.nInfoWindow = null;

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

GPXMap.prototype.parseGPX = function(xmlDoc) {
	this.geocacheDB = new Array();

	if(xmlDoc) {
		var waypoints = xmlDoc.documentElement.getElementsByTagName("wpt");

		for(var i = 0; i < waypoints.length; i++) {
			var point = waypoints[i];

			var lat = parseFloat(point.getAttribute("lat"));
			var lon = parseFloat(point.getAttribute("lon"));
		
			var temp = $(point).find("name")
			var gcNumber = temp.first().text();
			var gcTitle = temp.eq(1).text();
			if (gcNumber[0] != 'G' && gcNumber[1] != 'C') 
				continue;
			
			var gcUrl = $(point).find("url").text();
			var gcHidden = $(point).find("time").text().slice(0,10); 
			var gcOwner = $(point).find("owner").text();
			var gcPlaced = (gcOwner == this.GPXOwner) ? true : false;
			
			var temp = $(point).find("sym").text();
			var gcFound = (temp == "Geocache Found") ? true : false;
			var gctType  = $(point).find("type").first().text().slice(9);
			var ind = gctType.indexOf(' ');
				if(ind == -1) {
					ind = gctType.indexOf('-');
				}
				gcType=gctType.slice(0,ind);
			var gcSize  = $(point).find("container").text();
			var gcDiff  = $(point).find("difficulty").text();
			var gcTerr  = $(point).find("terrain").text();

			var geocache = new Geocache(lat,lon,gcNumber,gcTitle,gcUrl,gcHidden, gcOwner, gcType, gcSize, gcDiff, gcTerr, gcPlaced, gcFound); 
			
			this.geocacheDB.push(geocache);
		}
	}
};

GPXMap.prototype.createMarker = function() {
	var gMap = this.gMap;
	var dMap = this.dMap;
	var nMap = this.nMap;
	var gDB = this.geocacheDB;
	var GPXOwner = this.GPXOwner;
	var length = this.geocacheDB.length;
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
/*
		var nCenter = nMap.getCenter();
		var cenLat = nCenter.y;
		var cenLon = nCenter.x;
		
		var nLevel = nMap.getLevel();
		var gLevel = nLevel + 5;
		var dLevel = 20 - gLevel;

		dMap.setLevel(dLevel);
		dMap.panTo(new daum.maps.LatLng(cenLat, cenLon));

		gMap.setZoom(gLevel);
		gMap.setCenter(new google.maps.LatLng(cenLat, cenLon));
*/
	}

	this.nMapListener = nMapBoundsChanged;
	nMap.attach('move', this.nMapListener);
}

GPXMap.prototype.centerAndZoom = function() {

	var minlat = 0;	var maxlat = 0;
	var minlon = 0;	var maxlon = 0;

	var geocacheDB = this.geocacheDB;

	// If the min and max are uninitialized then initialize them.
	if(geocacheDB.length > 1) {
		minlat = geocacheDB[0].lat;
		maxlat = geocacheDB[0].lat;
		minlon = geocacheDB[0].lon;
		maxlon = geocacheDB[0].lon;
	} else {
		alert("There's no waypoints!!");
		return;
	}

	for(var i = 1; i < geocacheDB.length; i++) {
		var lat = geocacheDB[i].lat;
		var lon = geocacheDB[i].lon;

		if(lon < minlon) minlon = lon;
		if(lon > maxlon) maxlon = lon;
		if(lat < minlat) minlat = lat;
		if(lat > maxlat) maxlat = lat;
	}

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

