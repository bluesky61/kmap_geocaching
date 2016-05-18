<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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
    $sql = "DROP TABLE IF EXISTS KmapUsers";
    $db->exec($sql);

    $sql = "CREATE TABLE `KmapUsers` (
            `ID` varchar(20) NOT NULL,
            `passwd` varchar(30) NOT NULL,
            `Gname` varchar(50) NOT NULL,
            `Gid` int(11) NOT NULL,
            `ResetPw` char(5) NOT NULL,
            PRIMARY KEY (`ID`)
          ) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
    $db->exec($sql);
    
    $sql = "ALTER TABLE `KmapUsers`"
        . "ADD KEY `ID` (`ID`),"
        . "ADD KEY `Gname` (`Gname`)";
    $db->exec($sql);
    
    $sql = "INSERT INTO `KmapUsers` (`ID`, `passwd`, `Gname`, `Gid`, `ResetPw`) VALUES "
        . "('bluesky61', 'bluesky61','bluesky61', 0, 'yes'),"
        . "('hkbaik', 'hkbaik', 'hkbaik', 0, 'yes'),"
        . "('generalred', 'generalred', 'generalred', 0, 'yes'),"
        . "('Winny Lee', 'Winny Lee', 'Winny Lee', 0, 'yes'),"
        . "('ttettu', 'ttettu', 'ttettu', 0, 'yes'),"
        . "('hl1shy', 'hl1shy', 'hl1shy', 0, 'yes'),"
        . "('suk8a', 'suk8a', 'suk8a', 0, 'yes'),"
        . "('K-one', 'K-one', 'K-one', 0, 'yes'),"
        . "('orbee', 'orbee', 'orbee', 0, 'yes'),"
        . "('wonkoo1', 'wonkoo1', 'wonkoo1', 0, 'yes'),"
        . "('bluejay99', 'bluejay99', 'bluejay99', 0, 'yes'),"
        . "('YEHA', 'YEHA', 'YEHA(霓河)', 0, 'yes')";
    $db->exec($sql);
} catch (PDOException $e) {
    die("Error! : " . $e->getMessage() . "<br/>");
}
?>
