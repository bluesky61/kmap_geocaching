<?php
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

if(isset($_POST['user_id']) and isset($_POST['user_pw'])){
	$user_id = $_POST['user_id'];
	$user_pw = $_POST['user_pw'];
} else {
	die("ERROR - Please input User_ID and Password<br>");
}

$stmt = $db->prepare("SELECT * FROM kmapusers WHERE userid = ? AND passwd = ?");
$stmt->bindParam(1, $user_id, PDO::PARAM_STR);
$stmt->bindParam(2, $user_pw, PDO::PARAM_STR);

if($stmt->execute()) {
	setcookie('userid',$user_id);
	setcookie('passwd',$user_pw);

	$row = $stmt->fetch(PDO::FETCH_ASSOC);
	/* if ($row['ResetPw']='yes') {
		echo("__RESET__");
	} */
	$memberid = $row['memberid'];
	if($memberid == 0){
		$stmt = $db->prepare("SELECT finderid FROM `founds_finder` WHERE finder = ? limit 1");
		$stmt->bindParam(1, $user_id);
		if($stmt->execute()) {
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			$memberid = $row['finderid'];
		
			$stmt = $db->prepare("UPDATE kmapusers SET memberid = ? WHERE userid = ?");
			$stmt->bindParam(1, $memberid);
			$stmt->bindParam(2, $user_id);
			$stmt->execute();
		}
	}
	echo($memberid);

} else {
	echo("ERROR");
}
?>