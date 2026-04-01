<?php
$message = '';
$isError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['url'])) {
    $url = $_POST['url'];
    
    $data = json_encode(array("url" => $url));
    $ch = curl_init('http://127.0.0.1:3001/visit');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    $result = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // NAYA LOGIC: Check if bot replied with success or error
    if ($httpcode == 200) {
        $message = "Success: " . htmlspecialchars($result);
    } else {
        $isError = true;
        $message = "Bot Error: " . htmlspecialchars($result ?: "Bot is down or unreachable.");
    }
}
?>
