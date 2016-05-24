<?php

/********************
 * Read GPX file and extract found information
 *  2016-5-15 by bluesky61
 *       현재의 버그 : Found 로그가 아니면서 내용에 'Found it' 이라고 쓰면
 *                    찾은사람이 Found it, id는 0으로 등록이 됨.
 */
ini_set('max_execution_time', 300);

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
    $sql = "DROP TABLE IF EXISTS founds_finder";
    $db->exec($sql);
 
    $sql = "CREATE TABLE `founds_finder` 
      ( `gcnumber` char(7) NOT NULL,
        `finder` varchar(50) NOT NULL,
        `finderid` int(11) NOT NULL 
       ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";
    $db->exec($sql);
    
    $sql = "ALTER TABLE `founds_finder`
        ADD KEY `gcnumber` (`gcnumber`),
        ADD KEY `finder` (`finder`),
        ADD KEY `finderid` (`finderid`)";
    $db->exec($sql);
} catch (PDOException $e) {
    die("Error! : " . $e->getMessage() . "<br/>");
}

$g_gcnumber="";
$g_finder="";
$g_finderid=0;
$num_geocaches = 0;

$stmt = $db->prepare("INSERT INTO founds_finder (gcnumber, finder, finderid) VALUES (?, ?, ?)");
$stmt->bindParam(1, $g_gcnumber, PDO::PARAM_STR);
$stmt->bindParam(2, $g_finder, PDO::PARAM_STR);
$stmt->bindParam(3, $g_finderid, PDO::PARAM_INT);


// Initialize the XML parser
$parser=xml_parser_create();
$index = "";
$is_LOGs = false;
$is_type = false;
$is_foundlog = false;

function start($parser, $element_name, $element_attrs) 
{
    global $index, $g_finderid, $is_LOGs, $is_type, $is_foundlog;
    
    switch($element_name) {
        case "NAME":
            $index = "GCNUMBER";
            break;
        case "GROUNDSPEAK:LOGS":
            $is_LOGs = true;
            break;
        case "GROUNDSPEAK:TYPE":
            if($is_LOGs)
                $is_type = true;
            break;
        case "GROUNDSPEAK:FINDER":
            $index = "FINDER";
            break;
    }
    if(!empty($element_attrs)){
        foreach ($element_attrs AS $attidx =>$attdata){
            if ($is_foundlog == true AND $index == "FINDER" AND $attidx =="ID"){
                $g_finderid = $attdata;
            }
        }
    }
}
// Function to use when finding character data
function char($parser,$data) 
{
    global $index, $is_LOGs, $is_type, $is_foundlog, $g_gcnumber, $num_geocaches;
    global $stmt, $g_finder, $g_finderid;
  
    if($index == "GCNUMBER"){
        $g_gcnumber= $data;
        $num_geocaches ++;
        $index = "";
    }

    if($is_LOGs AND $is_type AND $data == "Found it")
        $is_foundlog = true;
        
    if($is_foundlog AND $index == 'FINDER'){
        $g_finder = $data;
        $index = "";
    }
        
               
    // for debugging
    if($g_gcnumber == "GC6HNC3") {
        $_break = true;
    }
}

// Function to use at the end of an element
function stop($parser,$element_name) 
{
    global $index, $is_LOGs, $is_type, $is_foundlog, $g_finder, $g_finderid, 
            $stmt, $g_gcnumber, $num_geocaches;
    
    if ($element_name == "GROUNDSPEAK:LOGS"){
        $is_LOGs = false;
    }
    if ($element_name == "GROUNDSPEAK:LOG"){
        if($is_foundlog){
            $stmt->execute();
        }
        $index =="";
        $is_type = false;
        $is_foundlog = false;
        $g_finder ="";
        $g_finderid ="";
    }
    if ($element_name == "WPT"){
        echo "$num_geocaches : $g_gcnumber <br>";
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
