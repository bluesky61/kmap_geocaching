<!DOCTYPE html>
<html>
<head>
    <!-- meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densityDpi=device-dpi" -->	
    <meta content='user-scalable=no, initial-scale=1, width=device-width' id='viewport' name='viewport'>

    <title>Draw Geocaches on Korean Maps</title>
    <meta name="keywords" content="Geocaching, Geocache, Daum Map, Naver Map, Google Map">
    <meta name="description" content="In Korea, google maps are not so good. 
          For examps, there's no contours and trails in the mountain area. 
          It makes a little bit difficult fot geocaching. The kmap_geocaching site
          can draw geocaches in daum map and naver map, which are famous Korean maps.
          Now the site use static DB, which should update separatly. In the future,
          It will use geocaching.com API, so that update informations automatically.">
    <meta charset="UTF-8">
    <meta name="author" content="Min Heo, blusky61@geocacing">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="jquery.cookie.js"></script> 

    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="myCSS.css">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
    
<!-- for main 
    <script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyD6Cw2m6ipHjPsd2HfHx5duc1M7tFls6ZY&language=ko"></script>
    <script src="http://apis.daum.net/maps/maps3.js?apikey=0bef3f16e12741da64be522723f027ab"></script>
    <script src="http://openapi.map.naver.com/openapi/v2/maps.js?clientId=EUJ8CfA76G8mtqytMhQw"></script>
<!-- for gpx_test 
    <script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyD6Cw2m6ipHjPsd2HfHx5duc1M7tFls6ZY&language=ko"></script>
    <script src="http://apis.daum.net/maps/maps3.js?apikey=0bef3f16e12741da64be522723f027ab"></script>
    <script src="http://openapi.map.naver.com/openapi/v2/maps.js?clientId=Qtus_QPl_Ff_XimMtIcZ"></script>
<!-- for local  -->
    <script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyB-52v-NmfCHdSYdY-Z51OYlEqk8EySnLs&language=ko"></script>
    <script src="http://apis.daum.net/maps/maps3.js?apikey=ac43b4fa06e3aa177aeb45ae83af4a5b"></script>
    <script src="http://openapi.map.naver.com/openapi/v2/maps.js?clientId=tKwiqUIbN2oMs10svQyD"></script>

    <script src="geocache.js"></script>
    <script src="gpxmap.js"></script>
    <script src="callback_functions.js"></script>
    <script src="navMenu.js"></script>
    <script>
        $(document).ready(function() {
            // var viewPortScale = 2 / window.devicePixelRatio; // scale for smartphone
            //$('#viewport').attr('content', 'user-scalable=no, initial-scale='+viewPortScale+', width=device-width');	

            var koMap = new GPXMap(); // initialize Maps
            var geocacheDB = new GeocacheDB();

            initMenu(koMap);

        /* 화면 제어 */					
            $("#google").click( function(){koMap.changeMap("google")});
            $("#daum").click( function(){koMap.changeMap("daum")});
            $("#naver").click( function(){koMap.changeMap("naver")});

            $("#ajaxResult").change( function(){
                var result = $("#ajaxResult").val();
                if (result == "getAllDBComplete" ) { 
                    var whichmap = ($(window).width() > 1000) ? "ALL" : "daum";

                    koMap.attachHelpCallback(geocacheDB);
                    koMap.createMarker(geocacheDB, whichmap);
                    koMap.changeMap("daum");
                    $("#waitModal").modal("hide");
                } else { //checkLogin 
                    var memberID = result;
                    var whichmap = ($(window).width() > 1000) ? "ALL" : "daum";

                    $("#waitModal").modal("show");
                    koMap.removeAllMarkers(whichmap); 
                    geocacheDB.geocacheDB = [];
                    geocacheDB.getAllFromDB(memberID);
                }
            });
            
            displayRoadview = function(GCNum) { // global variable
                $("#roadview").css("display","block");
                $("#roadviewClose").css("display","block");
                koMap.displayRoadview(geocacheDB, GCNum);
            };
            $("#roadviewClose").click( function(){
                $("#roadview").css("display","none");
                $("#roadviewClose").css("display","none");
            })
        });
    </script>
</head>
<body>
    <?php include "navMenu.html" ?>
    <?php include "allForms.php" ?>
    
    <div id="loginBar">
        <form>
            <fieldset><legend>로그인 하기</legend>
                지오캐싱 ID : <input type="text" id="userid" value="<?php if(isset($_COOKIE['userid'])) echo $_COOKIE['userid']; ?>" autofocus><br>
                패스워드 &nbsp;&nbsp;&nbsp;&nbsp;: <input type="password" id="pwd" value="<?php if(isset($_COOKIE['passwd'])) echo $_COOKIE['passwd']; ?>"><br><br>
                <input type="button" id="login" value="접속하기">
            </fieldset>
        </form>
    </div>
    <div id="dmap"></div>
    <div id="gmap"></div>
    <div id="nmap"></div>
    <div id="roadview"></div>
    <button type="button" class="btn btn-danger btn-lg" id="roadviewClose">&times;</button>
    <input type="text" id="ajaxResult" value="0" >
</body>
</html>

