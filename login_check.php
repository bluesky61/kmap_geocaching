<?php
$members = array('user1'=>'pw1',
                 'user2'=>'pw2',
                 'user3'=>'pw3');

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