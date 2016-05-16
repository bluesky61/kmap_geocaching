﻿<!DOCTYPE html>
<html>
	<head>
	<!-- meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densityDpi=device-dpi" -->	
	<meta content='user-scalable=no, initial-scale=1, width=device-width' id='viewport' name='viewport'>

	<title>Draw Geocaches on Korean Maps</title>
	<style>
		html, body {width: 100%; height: 100%}
		#gmap, #nmap, #dmap {width: 100%; height: 100%; position:fixed; top:0px; right:0px;}
		body {margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 0px}
		#openclose {position:absolute; width:300px; height:30px; background-color:DarkSlateGray; opacity:0.9; text-align:center; z-index:5; color:white}
		#controlbar {position:absolute; top:30px; width:300px; background-color:GhostWhite ; opacity:0.9; text-align:center; z-index:5}
		#userid, #pwd {width:100px}
		#daum, #naver {background-color:LightGray}
		#google {background-color:SkyBlue}
		.container {
			margin: 0 auto;
		}
	</style>

	<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
	<script src="//code.jquery.com/jquery-1.10.2.js"></script>
	<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>

	<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyD6Cw2m6ipHjPsd2HfHx5duc1M7tFls6ZY&language=ko"></script>
	<script src="http://apis.daum.net/maps/maps3.js?apikey=0bef3f16e12741da64be522723f027ab"></script>
	<!-- script src="http://openapi.map.naver.com/openapi/v2/maps.js?clientId=EUJ8CfA76G8mtqytMhQw"></script -->
	<script src="http://openapi.map.naver.com/openapi/v2/maps.js?clientId=Qtus_QPl_Ff_XimMtIcZ"></script>

	<script src="geocache.js"></script>
	<script src="gpxmap.js"></script>
	<script src="callback_functions.js"></script>
	<script>
		$(document).ready(function() {
			var viewPortScale = 2 / window.devicePixelRatio; // scale for smartphone
			$('#viewport').attr('content', 'user-scalable=no, initial-scale='+viewPortScale+', width=device-width');	
			
			var koMap = new GPXMap(); // initialize Maps
			var geocacheDB = new GeocacheDB();

			/* 화면 제어 */					
			$("#openclose").click(function(){$("#controlbar").slideToggle();});

			$("#google").click( function(){koMap.changeMap("google")});
			$("#daum").click( function(){koMap.changeMap("daum")});
			$("#naver").click( function(){koMap.changeMap("naver")});

			$("#login").click( function(){readin(koMap, geocacheDB)});

			var _file = document.getElementById('_file');
			var _idUser = document.getElementById('userid');
			$("#_submit").click( function(){upload(koMap, geocacheDB)});
			$("#curPos").click( function(){currentLocation(koMap)});
			$("#wdialog").dialog({autoOpen: false, });
		});
	</script>
	</head>
<body>
	<div id="openclose">콘트롤 여닫기</div>
	<div id="controlbar">
		<p></p>
		<form>
			<fieldset>
			<legend>지도 선택</legend>
				<button type="button" id="google" >Google</button>
				<button type="button" id="daum"   >Daum</button>
				<button type="button" id="naver"  >Naver</button>
			</fieldset>
		</form>

		<p></p>
		<form>
			<fieldset>
				<legend>GPX 파일 불러오기</legend>
					지오캐싱 ID : <input type="text" id="userid" value="<?php echo $_COOKIE['username']; ?>"><br>
					패스워드 &nbsp;&nbsp;&nbsp;&nbsp;: <input type="password" id="pwd" value="<?php echo $_COOKIE['password']; ?>"><br><br>
					<input type="button" id="login" value="접속하기">
					<div class='container'>
						<hr>
						<input type='file' id='_file'> 
						<br><br>
						<input type='button' id='_submit' value='올리기!'>
					</div>
			</fieldset>
		</form>

		<!-- p></p>
		<form>
			<fieldset>
				<legend>현재위치 찾아가기</legend>
				<button type="button" id="curPos" >현재위치로</button> 
			</fieldset>
		</form -->
		<p></p>
	</div>
	<div id="dmap"></div>
	<div id="gmap"></div>
	<div id="nmap"></div>
	<div id="wdialog" title="Wait"> <p>잠시 기다려주세요...</p> </div>
</body>
</html>
