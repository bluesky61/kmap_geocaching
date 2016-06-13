<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$diffImage = array('1'  => "images/stars1.gif",
	'1.5'=> "images/stars1_5.gif",
	'2'  => "images/stars2.gif",
	'2.5'=> "images/stars2_5.gif",
	'3'  => "images/stars3.gif",
	'3.5'=> "images/stars3_5.gif",
	'4'  => "images/stars4.gif",
	'4.5'=> "images/stars4_5.gif",
	'5'  => "images/stars5.gif"
       );
$cacheImage = array(
	"Traditional Cache" => "images/2.gif",
	"Multi-cache" => "images/3.gif",
	"Virtual Cache" => "images/4.gif",
	"Letterbox Hybrid" => "images/5.gif",
	"Event Cache" => "images/6.gif",
	"Wherigo Cache" => "images/7.gif",
	"Unknown Cache" => "images/8.gif",
	"Earthcache" => "images/9.gif",
	"Cache In Trash Out Event" => "images/cito.gif",
	"Found" => "images/found.png",
	"Placed" => "images/placed.png"
);
$sizeImage= array(
	"Micro" => "images/micro.gif",
	"Small" => "images/small.gif",
	"Regular" => "images/regular.gif",
	"Large" => "images/large.gif",
	"Not chosen" => "images/not_chosen.gif",
	"Virtual" => "images/virtual.gif",
	"Other" => "images/other.gif"
);

mb_internal_encoding("UTF-8");
mb_http_output('UTF-8'); 

// mySQL DB 연결
require_once 'login.php';
try { //Start of try. Open/Create table
    $db = new PDO("mysql:host=$db_hostname;dbname=$db_database;charset=utf8", 
            $db_username, $db_password);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
} catch (PDOException $e) {
    die("Error in connection ! : " . $e->getMessage() . "<br/>");
}

    $gcNumber = $_POST['gcnumber'];
//    $gcNumber = 'GC6FR4H';

try {
    $result = $db->query("select * from geocaches where gcnumber = '" . $gcNumber . "'");
    $row = $result ->fetch();
} catch (PDOException $e) {
    die("Error! in fetch : " . $e->getMessage() . "<br/>");
}
    $tot_width =300;
    $left_width = 150;
    if (strlen($row['title']) > 40 || strlen($row['placedby'])>40){
        $tot_width = 400;
        $left_with = 250;
    }
        
    $html = "<div style='padding:5px;font-size:12px;background-color:#FFFFFF;width:" . $tot_width. "px'> <table border='0'><tr><td colspan='2'>"
	. "<img src=" . $cacheImage[$row['type']] . ">"
	. "<a href=" . $row['url'] . " target='_blank'><span><b>" . $row['title'] . "</b></a></span><span style='float:right'>" . $row ['gcnumber'] . "</span><br /></td></tr>"
	. "<tr><td colspan='2'>Created by : " . $row['placedby'] . "</td></tr>"
	. "<tr><td width='$left_width'>Difficulty : <img src=" . $diffImage[$row['diff']] . "></td><td>Terrain : <img src=" . $diffImage[$row['terr']] . "></td></tr>"
	. "<tr><td>Size : <img src=" . $sizeImage[$row['size']] . "></td><td width='160'>Hidden : " . $row['hidden'] . "</td></tr></table></div>";

 exit($html);
?>    
    