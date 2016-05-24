<?php
/********************
 * Read GPX file and create Geecache Database.
 *  2016-5-15 by bluesky61
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
} catch (PDOException $e) {
    die("Error! : " . $e->getMessage() . "<br/>");
}

if(isset($_POST['memberid'])){
	$memberid = $_POST['memberid'];
} else {
	die("ERROR - Please input User_ID and Password<br>");
}

$db->exec("UPDATE geocaches SET icon1 = type");

$stmt = $db->prepare("UPDATE geocaches SET icon1 = 'Found' WHERE gcnumber = ?");
$stmt->bindParam(1, $g_gcnumber, PDO::PARAM_STR);

$results = $db->query("SELECT gcnumber FROM founds_finder WHERE finderid = $memberid");
foreach($results as $row) {
    $g_gcnumber = $row[0];
    $stmt->execute();
}

$db->exec("UPDATE geocaches SET icon1 = 'Placed' WHERE ownerid = $memberid");

$result = $db->query("SELECT gcnumber, title, lat, lon, icon1 from geocaches");
$gcresults = $result->fetchAll(PDO::FETCH_NUM);

header('Content-type: application/json');

exit (json_encode($gcresults));


