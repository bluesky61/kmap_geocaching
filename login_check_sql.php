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

    $stmt = $db->prepare("SELECT * FROM KmapUsers WHERE ID = ? AND passwd = ?");
    $stmt->bindParam(1, $user_id, PDO::PARAM_STR);
    $stmt->bindParam(2, $user_pw, PDO::PARAM_STR);

    if($stmt->execute()) {
        setcookie('userid',$user_id);
        setcookie('passwd',$user_pw);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row['ResetPw']='yes') {
            echo("__RESET__");
        } else {
            echo("success");
        }
    } else {
        die("No such ID and PW<br>");
    }
?>