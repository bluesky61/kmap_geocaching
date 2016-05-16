<?php
/********************
 * Read GPX file and create Geecache Database.
 *  2016-5-15 by bluesky61
 */

mb_internal_encoding("UTF-8");
mb_http_output('UTF-8'); 

// mySQL DB 연결
require_once 'login.php';
try { //Start of try. Open/Create table
    $db = new PDO("mysql:host=$db_hostname;dbname=$db_database;charset=utf8", 
            $db_username, $db_password);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 

    // Table 생성. 
    $sql = "DROP TABLE IF EXISTS Geocaches";
    $db->exec($sql);

    $sql = "CREATE TABLE `geocaches` (
      `GCNumber` char(7) NOT NULL,
      `TITLE` varchar(100) NOT NULL,
      `LAT` float NOT NULL,
      `LON` float NOT NULL,
      `URL` varchar(100) NOT NULL,
      `HIDDEN` date NOT NULL,
      `TYPE` varchar(50) NOT NULL,
      `SIZE` char(10) NOT NULL,
      `PLACEDBY` varchar(80) NOT NULL,
      `OWNERID` int(11) NOT NULL,
      `DIFF` char(3) NOT NULL,
      `TERR` char(3) NOT NULL,
      `DISABLE` tinyint(1) NOT NULL
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";

    $db->exec($sql);

    $sql = "ALTER TABLE `geocaches`
      ADD PRIMARY KEY (`GCNumber`),
      ADD KEY `LAT` (`LAT`),
      ADD KEY `LON` (`LON`),
      ADD KEY `TYPE` (`TYPE`),
      ADD KEY `SIZE` (`SIZE`),
      ADD KEY `PLACEDBY` (`PLACEDBY`),
      ADD KEY `OWNERID` (`OWNERID`),
      ADD KEY `DIFF` (`DIFF`),
      ADD KEY `TERR` (`TERR`),
      ADD KEY `DISABLE` (`DISABLE`)";

    $db->exec($sql);

    $sql = "ALTER TABLE `geocaches` ADD FULLTEXT KEY `TITLE` (`TITLE`)";
    $db->query($sql);
} catch (PDOException $e) {
    die("Error! : " . $e->getMessage() . "<br/>");
}

$g_gcnumber=$g_title=$g_url=$g_type=$g_placedby=$g_diff=$g_terr=$g_size="";
$g_lat=$g_lon=$g_hidden=$g_ownerid=0;
$g_disable=0;

$stmt = $db->prepare("INSERT INTO geocaches (GCNumber, TITLE, LAT, LON, URL, "
        . "HIDDEN, TYPE, SIZE, PLACEDBY, OWNERID, DIFF, TERR, DISABLE) "
        . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bindParam(1, $g_gcnumber, PDO::PARAM_STR);
$stmt->bindParam(2, $g_title, PDO::PARAM_STR);
$stmt->bindParam(3, $g_lat, PDO::PARAM_STR);
$stmt->bindParam(4, $g_lon, PDO::PARAM_STR);
$stmt->bindParam(5, $g_url, PDO::PARAM_STR);
$stmt->bindParam(6, $g_hidden, PDO::PARAM_STR);
$stmt->bindParam(7, $g_type, PDO::PARAM_STR);
$stmt->bindParam(8, $g_size, PDO::PARAM_STR);
$stmt->bindParam(9, $g_placedby, PDO::PARAM_STR);
$stmt->bindParam(10, $g_ownerid, PDO::PARAM_INT);
$stmt->bindParam(11, $g_diff, PDO::PARAM_STR);
$stmt->bindParam(12, $g_terr, PDO::PARAM_STR);
$stmt->bindParam(13, $g_disable, PDO::PARAM_BOOL);

// Initialize the XML parser
$parser=xml_parser_create();

// Function to use at the start of an element
$startparsing = FALSE;
$num_geocaches = 0;
$geocache = array("GCNUMBER"=>"", "TITLE" => "", "LAT"=>0, "LON" => 0 , 
    "URL" => "", "HIDDEN" => 0, "TYPE"=>"", "SIZE"=>"", "PLACEDBY"=>"", 
    "OWNERID"=>0, "DIFF"=>"", "TERR"=>"", "DISABLE" => 0);
$index = "";
$is_TBs=false;
$is_LOGs=false;

function start($parser, $element_name, $element_attrs) 
{
    global $index,$geocache, $startparsing, $is_TBs, $is_LOGs;
    
    switch($element_name) {
        case "WPT":
            $startparsing = TRUE;
            break;
        case "NAME":
            $index = "GCNUMBER";
            break;
        case "GROUNDSPEAK:NAME":
            $index = "TITLE";
            break;
        case "TIME":
            $index = "HIDDEN";
            break;
        case "URL":
            $index = "URL";
            break;
        case "GROUNDSPEAK:TYPE":
            $index = "TYPE";
            break;
        case "GROUNDSPEAK:PLACED_BY":
            $index = "PLACEDBY";
            break;
        case "GROUNDSPEAK:OWNER ID":
            $index = "OWNERID";
            break;
        case "GROUNDSPEAK:DIFFICULTY":
            $index = "DIFF";
            break;
        case "GROUNDSPEAK:CONTAINER":
            $index="SIZE";
            break;
        case "GROUNDSPEAK:TERRAIN":
            $index = "TERR";
            break;
        case "GROUNDSPEAK:TRAVELBUGS":
            $is_TBs = true;
            break;
        case "GROUNDSPEAK:LOGS":
            $is_LOGs = true;
            break;
    }
    if(!empty($element_attrs)){
        if ($element_name!= 'WPT' AND $element_name!= 'GROUNDSPEAK:OWNER' AND $element_name!= 'GROUNDSPEAK:CACHE')
            return;
        
        foreach ($element_attrs AS $attidx =>$attdata){
            switch($attidx) {
                case "LAT":
                    $geocache["LAT"] = $attdata;
                    break;
                case "LON":
                    $geocache["LON"] = $attdata;
                    break;
                case "ID" :
                    $geocache["OWNERID"] = $attdata;
                    break;
                case "AVAILABLE":
                    if($attdata == "False")
                            $geocache["DISABLE"] = 1;
                    break;
            }
        }
    }
}

// Function to use at the end of an element
function stop($parser,$element_name) 
{
    global $startparsing, $index, $db, $is_TBs, $is_LOGs;
    global $num_geocaches, $geocache, $index, $stmt;
    global $g_gcnumber, $g_title, $g_url, $g_type, $g_placedby, $g_diff, $g_terr;
    global $g_size, $g_lat, $g_lon, $g_hidden, $g_ownerid, $g_disable;
    
    $index ="";
    if (!$startparsing){
        return;
    }
    
    if ($element_name == "GROUNDSPEAK:TRAVELBUGS"){
        $is_TBs = false;
    }
    if ($element_name == "GROUNDSPEAK:LOGS"){
        $is_LOGs = false;
    }
    
    if($element_name == "WPT") {
        $g_gcnumber = $geocache['GCNUMBER'];
        $g_title = htmlspecialchars($geocache['TITLE'], ENT_QUOTES, 'UTF-8');
        $g_url = htmlspecialchars($geocache['URL'], ENT_QUOTES, 'UTF-8');
        $g_type = $geocache['TYPE'];
        $g_placedby = htmlspecialchars($geocache['PLACEDBY'], ENT_QUOTES, 'UTF-8');
        $g_diff = $geocache['DIFF'];
        $g_terr = $geocache['TERR'];
        $g_size = $geocache['SIZE'];
        $g_lat = $geocache['LAT'];
        $g_lon = $geocache['LON'];
        $g_hidden = $geocache['HIDDEN'];
        $g_ownerid = $geocache['OWNERID'];
        $g_disable = $geocache['DISABLE'];
        
        $num_geocaches++;

        if($g_gcnumber == 'GC68CH6'){ //for Debugging
            $_break = true;
        }
        
        echo "$num_geocaches : $g_gcnumber $g_title<br>";
        $stmt->execute();

        $geocache = array("GCNUMBER"=>"", "TITLE" => "", "LAT"=>0, "LON" => 0 , 
            "URL" => "", "HIDDEN" => "", "TYPE"=>"", "SIZE"=>"", "PLACEDBY"=>"", 
            "OWNERID"=>0, "DIFF"=>"", "TERR"=>"", "DISABLE"=>0);
    }
}

// Function to use when finding character data
function char($parser,$data) 
{
    global $geocache, $index, $is_TBs, $is_LOGs;
  
    if($index != "" AND $is_TBs != true AND $is_LOGs != true) {
        $geocache[$index] .= $data;
        if ($index =="HIDDEN") {
            $geocache[$index] = mb_substr($data, 0, 10);
        }
    }
}

// Specify element handler
xml_set_element_handler($parser,"start","stop");

// Specify data handler
xml_set_character_data_handler($parser,"char");

// Open XML file
$fp=fopen("geocaches_ALL.gpx","r");

// Read data
while ($data=fread($fp,4096)) {
    xml_parse($parser,$data,feof($fp)) or 
        die (sprintf("XML Error: %s at line %d", 
    xml_error_string(xml_get_error_code($parser)), xml_get_current_line_number($parser)));
}

$db = null;

// Free the XML parser
xml_parser_free($parser);
?>﻿


