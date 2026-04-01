<?php
// basic filtering: blocks <script> tags
function filter_xss($input) {
    if (preg_match("/<script>/i", $input) || preg_match("/<\/script>/i", $input)) {
        return "<span style='color:red;'>[Security Alert: Script tags are not allowed!]</span>";
    }
    return $input; // VULNERABILITY: Other tags like <img>, <svg> are allowed!
}

$query = isset($_GET['q']) ? $_GET['q'] : '';
$safe_query = filter_xss($query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>College Events | Honest Search</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>📅 College Event Search</h1>
        <form method="GET" action="index.php">
            <input type="text" name="q" placeholder="Search events (e.g., Hackathon)" value="<?php echo htmlspecialchars($query, ENT_QUOTES); ?>">
            <button type="submit">Search</button>
        </form>

        <?php if (!empty($query)): ?>
            <div class="results">
                <!-- VULNERABILITY: The filtered query is reflected directly into the HTML! -->
                <p>Showing results for: <strong><?php echo $safe_query; ?></strong></p>
                <p style="color: #666;">No events found matching your query.</p>
            </div>
        <?php endif; ?>

        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px;">
            <p>Found a bug or an inappropriate event? <a href="report.php">Report an issue to the Admin</a></p>
        </div>
    </div>
</body>
</html>
