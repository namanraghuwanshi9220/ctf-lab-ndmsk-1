<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

// 1. Securely fetch the user's details from DB
$stmt = $conn->prepare("SELECT username, role FROM users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$username = $user['username'];
$role = $user['role'];

// 2. THE VULNERABILITY: Developer trusts the database data!
// The username is taken from the DB and concatenated directly without sanitization.
$query = "SELECT title, content FROM notices WHERE author = '$username' AND is_private = 0";

$notices = $conn->query($query);
$db_error = $conn->error; // Catching error for Error-Based SQLi
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container wide">
        <header>
            <h2>Welcome, <?php echo htmlspecialchars($username); ?>!</h2>
            <a href="logout.php" class="btn-logout">Logout</a>
        </header>

        <div class="content-area">
            <h3>📝 Your Published Notices</h3>
            
            <?php if ($db_error): ?>
                <div class="db-error">
                    <strong>Database Error:</strong> <?php echo htmlspecialchars($db_error); ?>
                </div>
            <?php endif; ?>

            <div class="notices-grid">
                <?php if ($notices && $notices->num_rows > 0): ?>
                    <?php while($row = $notices->fetch_assoc()): ?>
                        <div class="notice-card">
                            <h4><?php echo htmlspecialchars($row['title']); ?></h4>
                            <p><?php echo htmlspecialchars($row['content']); ?></p>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p>No notices found for your account.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>
