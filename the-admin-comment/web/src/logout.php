<?php
session_start();
// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to login/register page
header("Location: index.php");
exit();
?>
