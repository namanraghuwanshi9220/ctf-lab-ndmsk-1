<?php
function basic_filter($input) {
    return str_ireplace("<script>", "[blocked]", $input);
}

$query = isset($_GET['q']) ? $_GET['q'] : "";

$taunt = "";
if ($query) {
    if (stripos($query, "<script>") !== false) {
        $taunt = "🤡 Script tag? Seriously? Try harder.";
    } elseif (stripos($query, "onerror") !== false) {
        $taunt = "😏 Oh... getting warmer.";
    } elseif (stripos($query, "alert") !== false) {
        $taunt = "👀 I see what you're trying...";
    } else {
        $taunt = "🔍 Searching... nothing suspicious (yet).";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>CyberPunk College Search</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<h1>⚡ CyberPunk College Event Search ⚡</h1>

<form method="GET">
    <input type="text" name="q" placeholder="Search events..." value="<?php echo htmlspecialchars($query); ?>">
    <button type="submit">Search</button>
</form>

<div class="result">
<?php if ($query): ?>
    <p>Results for: <?php echo basic_filter($query); ?></p>
    <div class="taunt"><?php echo $taunt; ?></div>
<?php else: ?>
    <p>Try searching for "Hackathon", "AI Summit", or something... creative 👀</p>
<?php endif; ?>
</div>

<div class="footer">
    <p>Admin reviews submitted links manually 👇</p>

    <form method="POST" action="bot.php">
        <input type="text" name="url" placeholder="Paste your crafted URL">
        <button type="submit">Submit to Admin</button>
    </form>
</div>

<!-- Hint: Not everything needs <script> -->

</body>
</html>
