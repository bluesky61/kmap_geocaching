<?php
$members = array('guest'=>"guest",
	"bluesky61"=>"bluesky61",
	"hkbaik"=>"hkbaik",
	"generalred"=> "generalred",
	"Winny Lee"=>"Winny Lee",
	"ttettu"=>"ttettu",
	"hl1shy"=>"hl1shy",
	"suk8a"=>"suk8a",
	"K-one"=>"K-one",
	"orbee"=>"orbee",
	"wonkoo1"=>"wonkoo1",
	"bluejay99"=>"bluejay99",
	"YEHA"=>"YEHA" );

if(isset($_POST['user_id']) and isset($_POST['user_pw'])){
    $user_id = $_POST['user_id'];
    $user_pw = $_POST['user_pw'];
} else {
    echo "ERROR !!";
}
if($members[$user_id] == $user_pw){\
    setcookie('username',$user_id);
    setcookie('password',$members[$user_id]);
    echo "success";
} else {
    echo "ERROR !!";
}
?>