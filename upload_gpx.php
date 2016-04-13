<?php
// Output JSON
function outputJSON($msg, $status = 'error'){
    header('Content-Type: application/json');
    die(json_encode(array(
        'data' => $msg,
        'status' => $status
    )));
}

$userdir = 'user//' . $_POST['userid'] . '//';

// Check for errors
if($_FILES['SelectedFile']['error'] > 0){
    outputJSON('An error ocurred when uploading.');
}

// Check filetype
if($_FILES['SelectedFile']['type'] != 'application/octet-stream'){
    outputJSON('Unsupported filetype uploaded:' . $_FILES['SelectedFile']['type']);
}

// Check filesize
if($_FILES['SelectedFile']['size'] > 25000000){
    outputJSON('File uploaded exceeds maximum upload size(25 MB).');
}

// Check if the file exists
//if(file_exists($userdir . $_FILES['SelectedFile']['name'])){
if(file_exists($userdir . 'geocaches.gpx')){
    unlink($userdir . 'geocaches.gpx');
}

// Upload file
//if(!move_uploaded_file($_FILES['SelectedFile']['tmp_name'], $userdir . $_FILES['SelectedFile']['name'])){
if(!move_uploaded_file($_FILES['SelectedFile']['tmp_name'], $userdir . 'geocaches.gpx')){
    outputJSON('Error uploading file - check destination is writeable.');
}

// Success!
outputJSON('File uploaded successfully to "' . $userdir . $_FILES['SelectedFile']['name'] . '".', 'success');
?>