<?php
session_start();
require 'db.php';

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];
    $username = $_POST['username'];
    $password = md5($_POST['password']);

    if ($action === 'register') {
        // SECURE: First-order is protected using Prepared Statements!
        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $password);
        
        if ($stmt->execute()) {
            $success = "Registration successful! You can now login.";
        } else {
            $error = "Username already exists or database error.";
        }
    } elseif ($action === 'login') {
        // SECURE: Login is also protected!
        $stmt = $conn->prepare("SELECT id, username FROM users WHERE username = ? AND password = ?");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $_SESSION['user_id'] = $row['id'];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Invalid credentials!";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>College Notice Board</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h2>📚 College Notice Board</h2>
        <?php if($error) echo "<p class='error'>$error</p>"; ?>
        <?php if($success) echo "<p class='success'>$success</p>"; ?>
        
        <div class="form-group">
            <h3>Login</h3>
            <form method="POST">
                <input type="hidden" name="action" value="login">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        </div>

        <div class="form-group">
            <h3>Register</h3>
            <form method="POST">
                <input type="hidden" name="action" value="register">
                <input type="text" name="username" placeholder="Choose a Username" required>
                <input type="password" name="password" placeholder="Choose a Password" required>
                <button type="submit" class="btn-register">Register</button>
            </form>
        </div>
    </div>
</body>
</html>
