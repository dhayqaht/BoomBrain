<!-- Dhay - 064 -->
<?php
// Start the session to store user data across pages
session_start();

//If the request is a POST and has an action (e.g., setting the username)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'setUsername':
             // If the username is provided in the POST request
            if (isset($_POST['username'])) {
                // Save the username in the session
                $_SESSION['username'] = $_POST['username'];
                // Also save it in a cookie that lasts 30 days
                setcookie('username', $_POST['username'], time() + (86400 * 30), "/"); // 30 days
                 // Send back a JSON (JavaScript Object Notation)response indicating success
                echo json_encode(['success' => true]);
            }
            break;
    }
} 
// If the request is a GET and the action is to check the session
else if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'checkSession':
        // Try to get the username from the session or cookie
            $username = isset($_SESSION['username']) ? $_SESSION['username'] : 
                       (isset($_COOKIE['username']) ? $_COOKIE['username'] : null);
            // If a username is found
            if ($username) {
                // Refresh the session with the username
                $_SESSION['username'] = $username; // Refresh session
                // Return it as a JSON response
                echo json_encode(['username' => $username]);
            } else {
                // No username was found
                echo json_encode(['username' => null]);
            }
            break;
    }
}