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
    this.terrainOn = true;
    this.isFoundDisplay = true;
    this.isPlacedDisplay = true;
    
    this.gMarkers = [];
    this.gPlacedMarkers = [];
    this.gFoundMarkers = [];
    this.dMarkers = [];
    this.dPlacedMarkers = [];
    this.dFoundMarkers = [];
    this.nMarkers = [];
    this.nPlacedMarkers = [];
    this.nFoundMarkers = [];
    this.gMapListener = null;
    this.dMapListener = null;
    this.nMapListener = null;
    this.gInfoWindow = null;
    this.dInfoWindow = null;
    this.nInfoWindow = null;
    this.makeGHelpCallback = null;
    this.makeDHelpCallback = null;
    this.roadview = this.roadviewClient = null;

    // Road view
    var roadviewContainer = document.getElementById('roadview'); //로드뷰를 표시할 div
    this.roadview = new daum.maps.Roadview(roadviewContainer); //로드뷰 객체
    this.roadviewClient = new daum.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체
    
    // read previous map position
    var gLevel = Number($.cookie('gLevel'));
    if(gLevel == 0){
        gLevel = 14;
    }
    var nLevel = gLevel -5;
    var dLevel = 20 - gLevel;
    
    var cenLat = Number($.cookie('cenLat'));
    var cenLng = Number($.cookie('cenLng'));
    if(cenLng <123 || cenLng >133) cenLng = 127;
    if(cenLat <32 || cenLat>39) cenLat = 37;

    // Naver Map
    var cPoint = new nhn.api.map.LatLng(Number(cenLat), Number(cenLng))
    nMap = new nhn.api.map.Map(document.getElementById('nmap') ,{
        zoom : Number(nLevel),
        point : cPoint,
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
        center: new daum.maps.LatLng(Number(cenLat), Number(cenLng)),
        level: Number(dLevel),
        mapTypeId: daum.maps.MapTypeId.ROADMAP
    });

    var zoomControl = new daum.maps.ZoomControl();
    dMap.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
    var mapTypeControl = new daum.maps.MapTypeControl();
    dMap.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

    dMap.addOverlayMapTypeId(daum.maps.MapTypeId.TERRAIN);

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

GPXMap.prototype.attachHelpCallback = function(geocacheDB)
{
    var koMap = this;
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

        var pos = dmarker.getPosition();
        var mlat = pos.getLat();
        var mlng = pos.getLng();
        
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
                html +='<div style="text-align:center;padding:5px;color:blue;"><a href="javascript:displayRoadview(\'' + gcNum + '\')">로드뷰</a>';
                html += '&nbsp;&nbsp;&nbsp;&nbsp;<a href="http://map.daum.net/link/to/' + gcNum + ',' + mlat + ',' + mlng + '" style="color:blue;" target="_blank">길찾기</a><div>';
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

    var isFoundDisplay = Number($.cookie('foundDisplay'));
    var isPlacedDisplay = Number($.cookie('placedDisplay'));

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

        if(gcIcon == 'Placed') {
            if(whichmap!= "daum") this.dPlacedMarkers.push(dmarker);
            if(isPlacedDisplay)
                dmarker.setMap(dMap);
        } else if(gcIcon =='Found') {
            if(whichmap!= "daum") this.dFoundMarkers.push(dmarker);
            if(isFoundDisplay)
                dmarker.setMap(dMap);
        } else {
            this.dMarkers.push(dmarker);
                dmarker.setMap(dMap);
        }

        daum.maps.event.addListener(dmarker, "click", this.makeDHelpCallback(dmarker));

        if (whichmap == "daum")
            continue;
        
        // Google Map
        var gmarker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,lon),
            icon: {url:cacheImage[gcIcon]},
            title : gcNumber + '\n' + gcTitle,
        });

        if(gcIcon == 'Placed') {
            this.gPlacedMarkers.push(gmarker);
            if(isPlacedDisplay) 
                gmarker.setMap(gMap);
        } else if(gcIcon =='Found') {
            this.gFoundMarkers.push(gmarker);
            if(isFoundDisplay) 
                gmarker.setMap(gMap);
        } else {
            this.gMarkers.push(gmarker);
                gmarker.setMap(gMap);
        }

        google.maps.event.addListener(gmarker, "click", this.makeGHelpCallback(gmarker));

        // Naver Map
        var oSize = new nhn.api.map.Size(16, 16);
        var oIcon = new nhn.api.map.Icon(cacheImage[gcIcon], oSize);
        var nposition = new nhn.api.map.LatLng(lat, lon);
        var nmarker = new nhn.api.map.Marker(oIcon, {
            point : nposition,
            title : gcNumber + '\n' + gcTitle
        });

        if(gcIcon == 'Placed') {
            this.nPlacedMarkers.push(nmarker);
            if(isPlacedDisplay) 
                nMap.addOverlay(nmarker); 
        } else if(gcIcon =='Found') {
            this.nFoundMarkers.push(nmarker);
            if(isFoundDisplay) 
                nMap.addOverlay(nmarker); 
        } else {
            this.nMarkers.push(nmarker);
            nMap.addOverlay(nmarker); 
        }

        // nmarker.setVisible(true);
    }
};

GPXMap.prototype.removeAllMarkers = function(whichmap){
    var gmarkers = this.gMarkers;
    var gfmarkers = this.gFoundMarkers;
    var gpmarkers = this.gPlacedMarkers;
    var dmarkers = this.dMarkers;
    var dfmarkers = this.dFoundMarkers;
    var dpmarkers = this.dPlacedMarkers;
    var nmarkers = this.nMarkers;
    var nfmarkers = this.nFoundMarkers;
    var npmarkers = this.nPlacedMarkers;

// daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(null);
    }
    dmarkers = [];
    for (var i = 0; i < dfmarkers.length; i++) {
        dfmarkers[i].setMap(null);
    }
    dfmarkers = [];
    for (var i = 0; i < dpmarkers.length; i++) {
        dpmarkers[i].setMap(null);
    }
    dpmarkers = [];

    if(whichmap == 'daum')
        return;
    
// googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }
    gmarkers = [];
    for (var i = 0; i < gfmarkers.length; i++) {
        gfmarkers[i].setMap(null);
    }
    gfmarkers = [];
    for (var i = 0; i < gpmarkers.length; i++) {
        gpmarkers[i].setMap(null);
    }
    gpmarkers = [];

// naver map
    this.nMap.clearOverlay();
    nmarkers= [];
    nfmarkers= [];
    npmarkers= [];
}

GPXMap.prototype.hidePlacedMarkers = function(whichmap) {
    var gmarkers = this.gPlacedMarkers;
    var dmarkers = this.dPlacedMarkers;
    var nmarkers = this.nPlacedMarkers;
    var dmap = this.dMap;
    var gmap = this.gMap;
    var nmap = this.nMap;
    
    // daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(null);
    }

    if(whichmap == 'daum')
        return;
    
    // googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }

    // naver map
    for (var i = 0; i < nmarkers.length; i++) {
        nmap.removeOverlay(nmarkers[i]); 
    }

}

GPXMap.prototype.hideFoundMarkers = function(whichmap) {
    var gmarkers = this.gFoundMarkers;
    var dmarkers = this.dFoundMarkers;
    var nmarkers = this.nFoundMarkers;
    var dmap = this.dMap;
    var gmap = this.gMap;
    var nmap = this.nMap;
    
    // daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(null);
    }

    if(whichmap == 'daum')
        return;
    
    // googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }

    // naver map
    for (var i = 0; i < nmarkers.length; i++) {
        nmap.removeOverlay(nmarkers[i]); 
    }
}

GPXMap.prototype.showPlacedMarkers = function(whichmap) {
    var gmarkers = this.gPlacedMarkers;
    var dmarkers = this.dPlacedMarkers;
    var nmarkers = this.nPlacedMarkers;
    var dmap = this.dMap;
    var gmap = this.gMap;
    var nmap = this.nMap;
    // daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(dmap);
    }

    if(whichmap == 'daum')
        return;
    
    // googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(gmap);
    }

    // naver map
    for (var i = 0; i < nmarkers.length; i++) {
        nmap.addOverlay(nmarkers[i]); 
    }
}

GPXMap.prototype.showFoundMarkers = function(whichmap) {
    var gmarkers = this.gFoundMarkers;
    var dmarkers = this.dFoundMarkers;
    var nmarkers = this.nFoundMarkers;
    var dmap = this.dMap;
    var gmap = this.gMap;
    var nmap = this.nMap;
    // daum map
    for (var i = 0; i < dmarkers.length; i++) {
        dmarkers[i].setMap(dmap);
    }

    if(whichmap == 'daum')
        return;
    
    // googlemaps
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(gmap);
    }

    // naver map
    for (var i = 0; i < nmarkers.length; i++) {
        nmap.addOverlay(nmarkers[i]); 
    }
}

GPXMap.prototype.terrainOnOff = function(){
    if (this.terrainOn) {
        this.dMap.removeOverlayMapTypeId(daum.maps.MapTypeId.TERRAIN);
        this.terrainOn = false;
    } else {
        this.dMap.addOverlayMapTypeId(daum.maps.MapTypeId.TERRAIN);
        this.terrainOn = true;
    }
}
GPXMap.prototype.displayRoadview = function(gDB, gcNumber){
    geocache = gDB.getGeocache(gcNumber);
        // {gcnumber:gDB[i][0], title:gDB[i][1], lat:gDB[i][2], lon:gDB[i][3], icon1:gDB[i][4]}
        // this.roadview = new daum.maps.Roadview(roadviewContainer); //로드뷰 객체
        // this.roadviewClient = new daum.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체

    var Lat = geocache.lat;
    var Lng = geocache.lon;
    var roadview = this.roadview;
    var roadviewClient = this.roadviewClient;
        
    var position = new daum.maps.LatLng(Lat, Lng);

// 특정 위치의 좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
    roadviewClient.getNearestPanoId(position, 50, function(panoId) {
        if (panoId === null) { //로드뷰가 없음
            $("#roadview").css("display","none");
            $("#roadviewClose").css("display","none");
        } else {
            roadview.setPanoId(panoId, position); //panoId와 중심좌표를 통해 로드뷰 실행
        }
    });
    var rMarker = new daum.maps.Marker({
        position: position, // 지도의 중심좌표에 올립니다.
        map: roadview // 생성하면서 지도에 올립니다.
    });
    var rLabel = new daum.maps.InfoWindow({
        position: position, // 지도의 중심좌표에 올립니다.
        content: "<div>" + gcNumber +"<br>"+ geocache.title + "</div>" // 인포윈도우 내부에 들어갈 컨텐츠 입니다.
    });
    rLabel.open(roadview, rMarker);
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
        $('#google').addClass("active");

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
        $('#daum').removeClass('active');
    } else if(oldservice == 'naver') {
        cenPoint = nMap.getCenter();
        cenLat = cenPoint.getY();
        cenLng = cenPoint.getX();

        nLevel = nMap.getLevel();
        dLevel = 15 - nLevel;
        gLevel = nLevel + 5;
        
        $('#nmap').hide();
        $('#naver').removeClass('active');
    } else if(oldservice == 'google') {
        cenPoint = gMap.getCenter();
        cenLat = cenPoint.lat();
        cenLng = cenPoint.lng();

        gLevel = gMap.getZoom();
        nLevel = gLevel -5;
        dLevel = 20 - gLevel;
        $('#gmap').hide();
        $('#google').removeClass('active');
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
        $('#daum').addClass("active");
    } else if (service == 'naver') {
        nMap.setLevel(nLevel);

        nMap.setCenter(new nhn.api.map.LatLng(cenLat, cenLng));

        $('#nmap').show();
        $('#naver').addClass("active");
    } else { //google
        gMap.setZoom(gLevel);

        gMap.setCenter(new google.maps.LatLng(cenLat, cenLng));

        $('#gmap').show();
        $('#google').addClass("active");
    } 
};
