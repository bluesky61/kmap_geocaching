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

//constructor
function GPXMap() {
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

    nMap.attach('dragend', function(oCustomEvent) {
        cenPoint = nMap.getCenter();
        cenLat = cenPoint.getY();
        cenLng = cenPoint.getX();

        nLevel = nMap.getLevel();
        gLevel = nLevel + 5;

        $.cookie('cenLat', cenLat);
        $.cookie('cenLng', cenLng);
        $.cookie('gLevel', gLevel);
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

    daum.maps.event.addListener(dMap, "idle", function(){
        var cenPoint = dMap.getCenter();
        var cenLat = cenPoint.getLat();
        var cenLng = cenPoint.getLng();

        var dLevel = dMap.getLevel();
        var gLevel = 20 - dLevel;

        $.cookie('cenLat', cenLat);
        $.cookie('cenLng', cenLng);
        $.cookie('gLevel', gLevel);
    });

    this.dMap = dMap;

    // Google Maps
    var gLevel = Number($.cookie('gLevel'));
    if(gLevel == 0){
        gLevel = 14;
    }
    var cenLat = Number($.cookie('cenLat'));
    var cenLng = Number($.cookie('cenLng'));
    if(cenLng <123 || cenLng >133) cenLng = 127;
    if(cenLat <32 || cenLat>39) cenLat = 37;

    var gMap = new google.maps.Map(document.getElementById('gmap'), {
        zoom: gLevel,
        center: {lat: cenLat, lng: cenLng} , 
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
    google.maps.event.addListener(gMap, "idle", function(){
        var cenPoint = gMap.getCenter();
        var cenLat = cenPoint.lat();
        var cenLng = cenPoint.lng();

        gLevel = gMap.getZoom();

        $.cookie('cenLat', cenLat);
        $.cookie('cenLng', cenLng);
        $.cookie('gLevel', gLevel);
    });

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
                oLabel.setVisible(true, oMarker); 
        }
    });

    nMap.attach('mouseleave', function(oCustomEvent) {
        var oTarget = oCustomEvent.target;
        if (oTarget instanceof nhn.api.map.Marker) {
                oLabel.setVisible(false);
        }
    });

};

GPXMap.prototype.createMarker = function(geocacheDB, whichmap) {
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

        if (whichmap == "daum")
            continue;
        
        // Google Map
        var gmarker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,lon),
            icon: {url:cacheImage[gcIcon]},
            title : gcNumber + '\n' + gcTitle,
            map: gMap
        });

        this.gMarkers.push(gmarker);

        google.maps.event.addListener(gmarker, "click", this.makeGHelpCallback(gmarker));

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

GPXMap.prototype.removeAllMarkers = function(whichmap){
    var gmarkers = this.gMarkers;
    var dmarkers = this.dMarkers;
    var nmarkers = this.nMarkers;

// daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(null);
    }
    dmarkers = [];

    if(whichmap == 'daum')
        return;
    
// googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }
    gmarkers = [];

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
    var cenLng = cenLat = 0;

    var dLevel, nLevel, gLevel;

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
        cenLat = cenPoint.getLat();
        cenLng = cenPoint.getLng();

        dLevel = dMap.getLevel();
        nLevel = 15 - dLevel;
        gLevel = 20 - dLevel;

        $('#dmap').hide();
        $('#daum').css("background-color", "LightGray");
    } else if(oldservice == 'naver') {
        cenPoint = nMap.getCenter();
        cenLat = cenPoint.getY();
        cenLng = cenPoint.getX();

        nLevel = nMap.getLevel();
        dLevel = 15 - nLevel;
        gLevel = nLevel + 5;
        
        $('#nmap').hide();
        $('#naver').css("background-color", "LightGray");
    } else if(oldservice == 'google') {
        cenPoint = gMap.getCenter();
        cenLat = cenPoint.lat();
        cenLng = cenPoint.lng();

        gLevel = gMap.getZoom();
        nLevel = gLevel -5;
        dLevel = 20 - gLevel;
        $('#gmap').hide();
        $('#google').css("background-color", "LightGray");
    }
/*
 * dLevel = 20 - gLevel
 * dLevel = 15 - nLevel
 * nLevel = gLevel -5;
 * nLevel = 15 - dLevel
 * gLevle = nLevel + 5
 * gLevel = 20 - dLevel
 *===== 
 * daum    naver   google
 *   1       14      19
 *   2       13      18
 *   3       12      17
 *   
 *   7        8      13 (여기보다 축소하면(아래) 아이콘 작은 걸로 바꿈)
 *   
 *   13       2       7
 *   14       1       6 (축소)
 */
    if(dLevel > 14 ) dLevel = 14;
    if(dLevel < 1) dLevel = 1;
    if(nLevel > 14) nLevel = 14;
    if(nLevel < 1) nLevel = 1;
    if(gLevel > 19) gLevel = 19;
    if(gLevel < 1) gLevel = 1;
    
    if(cenLng <123 || cenLng >133) cenLng = 127;
    if(cenLat <32 || cenLat>39) cenLat = 37;
    
    if (service == "daum") {
        dMap.setLevel(dLevel);

        dMap.setCenter(new daum.maps.LatLng(cenLat, cenLng));

        $('#dmap').show();
        $('#daum').css("background-color", "SkyBlue ");
    } else if (service == 'naver') {
        nMap.setLevel(nLevel);

        nMap.setCenter(new nhn.api.map.LatLng(cenLat, cenLng));

        $('#nmap').show();
        $('#naver').css("background-color", "SkyBlue ");
    } else { //google
        gMap.setZoom(gLevel);

        gMap.setCenter(new google.maps.LatLng(cenLat, cenLng));

        $('#gmap').show();
        $('#google').css("background-color", "SkyBlue ");
    } 
};
