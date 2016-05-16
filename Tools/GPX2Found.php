<?php

/********************
 * Read GPX file and extract found information
 *  2016-5-15 by bluesky61
 */

mb_internal_encoding("UTF-8");
mb_http_output('UTF-8'); 

// mySQL DB 연결
require_once 'login.php';
try { //Start of try. Open/Create table
    $db = new PDO("mysql:host=$db_hostname;dbname=$db_database;charset=utf8mb4", 
            $db_username, $db_password);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 

    // Table 생성. 
    $sql = "DROP TABLE IF EXISTS Founds";
    $db->exec($sql);

    $sql = "CREATE TABLE `Founds` ("
        . "`GCNumber` char(7) NOT NULL,"
        . "`OWNERID` int(11) NOT NULL) "
        . "ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $db->exec($sql);
    
    $sql = "ALTER TABLE `Founds`"
        . "ADD KEY `GCNumber` (`GCNumber`),"
        . "ADD KEY `OWNERID` (`OWNERID`)";
    $db->exec($sql);
} catch (PDOException $e) {
    die("Error! : " . $e->getMessage() . "<br/>");
}

$g_gcnumber="";
$g_ownerid=0;
$num_geocaches = 0;

$stmt = $db->prepare("INSERT INTO Founds (GCNumber, OWNERID) VALUES (?, ?)");
$stmt->bindParam(1, $g_gcnumber, PDO::PARAM_STR);
$stmt->bindParam(2, $g_ownerid, PDO::PARAM_INT);


// Initialize the XML parser
$parser=xml_parser_create();
$index = "";
$is_LOGs = false;
$is_type = false;
$is_foundlog = false;

function start($parser, $element_name, $element_attrs) 
{
    global $index, $g_gcnumber, $g_ownerid, $is_LOGs, $is_type, $is_foundlog, $stmt;
    
    switch($element_name) {
        case "NAME":
            $index = "GCNUMBER";
            break;
        case "GROUNDSPEAK:TYPE":
            if($is_LOGs)
                $is_type = true;
            break;
        case "GROUNDSPEAK:LOGS":
            $is_LOGs = true;
            break;
        case "GROUNDSPEAK:FINDER":
            $index = "OWNERID";
            break;
    }
    if(!empty($element_attrs)){
        foreach ($element_attrs AS $attidx =>$attdata){
            if ($index == "OWNERID" AND $is_foundlog == true){
                $g_ownerid = $attdata;
                $stmt->execute();
                $is_type = false;
                $is_foundlog = false;
            }
        }
    }
}

// Function to use at the end of an element
function stop($parser,$element_name) 
{
    global $is_LOGs, $is_type, $is_foundlog, $g_gcnumber, $num_geocaches;
    
    if ($element_name == "GROUNDSPEAK:LOGS"){
        $is_LOGs = false;
    }
    if ($element_name == "GROUNDSPEAK:LOG"){
        $is_type = false;
        $is_foundlog = false;
    }
    if ($element_name == "WPT"){
        echo "$num_geocaches : $g_gcnumber <br>";
    }
    
}

// Function to use when finding character data
function char($parser,$data) 
{
    global $index, $is_LOGs, $is_type, $is_foundlog, $g_gcnumber, $num_geocaches;
  
    if($is_LOGs AND $is_type AND $data == "Found it")
        $is_foundlog = true;
        
    if($index == "GCNUMBER"){
        $g_gcnumber= $data;
        $num_geocaches ++;
        $index = "";
    }
    
    // for debugging
    if($g_gcnumber == "GC6HNWJ") {
        $break = true;
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
