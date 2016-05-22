//----------------------------------
// geocache.js - define Geocache and GeocacheDB
// 
//		programed by Min Heo (heomin61@gmail.com)
//			2016-04-19		version 0.1 
// ---------------------------------
/*
cacheImage={
	"Traditional Cache":"images/2.gif",
	"Multi-cache":"images/3.gif",
	"Virtual Cache":"images/4.gif",
	"Letterbox Hybrid":"images/5.gif",
	"Event Cache":"images/6.gif",
	"Wherigo Cache":"images/7.gif",
	"Unknown Cache":"images/8.gif",
	"Earthcache":"images/9.gif",
	"Cache In Trash Out Event":"images/cito.gif",
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

// constructor
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

// create HTML image used in clicking
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
*/
// constructor
function GeocacheDB(){
	this.geocacheDB = new Array();
	this.GPXOwner = null;
	this.minlat = 0;
	this.maxlat = 0;
	this.minlon = 0;
	this.maxlon = 0;
}
/*
// read-in gpx file.
GeocacheDB.prototype.readGPXFile = function(GPXOwner) {
	this.GPXOwner = GPXOwner;
	var geocaches = this;

	var userDir = ".//user//" + GPXOwner + "//geocaches.gpx";

	$.ajax({
		type: "GET", 
		url: userDir,
		dataType: "xml",
		cache: false,
		async: false, // is now deprecated. however, if async be true, then
		                  // koMap.createMarker(geocacheDB) should be moved into success.
		success: function(data) {
			geocaches.parseGPX(data);
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
*/
GeocacheDB.prototype.getAllFromDB = function(Memberid, koMap) {

	var form_data = {
			memberid: Memberid
		};

	$.ajax({
		type: "POST",
		url: "getAllDB_sql.php",
		dataType: "json",
		data: form_data,
		cache: false,
		async: false,
		success: function(data) {
			this.geocacheDB = data;
			koMap.attachHelpCallback(this);
			koMap.createMarker(this);
			koMap.changeMap("daum");
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
/*
// read XML (GPX) into geocacheDB
GeocacheDB.prototype.parseGPX = function(xmlDoc) {

	if(xmlDoc) {
		var waypoints = xmlDoc.documentElement.getElementsByTagName("wpt");

		for(var i = 0; i < waypoints.length; i++) {
			var point = waypoints[i];

			var lat = parseFloat(point.getAttribute("lat"));
			var lon = parseFloat(point.getAttribute("lon"));
		
			var temp = $(point).find("name")
			var gcNumber = temp.first().text();
			var gcTitle = temp.eq(1).text();
			if (!(gcNumber[0] == 'G' && gcNumber[1] == 'C'))
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
		this.calc_MinMax();
	}
};
*/
// calculate boundary
GeocacheDB.prototype.calc_MinMax = function() {
// 
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

	this.minlat = minlat;
	this.maxlat = maxlat;
	this.minlon = minlon;
	this.maxlon = maxlon;
}
