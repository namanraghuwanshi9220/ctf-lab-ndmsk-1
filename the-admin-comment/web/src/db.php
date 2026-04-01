<?php
$host = 'db';
$user = 'ctf_user';
$pass = 'ctf_password';
$db   = 'ctf_db';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
