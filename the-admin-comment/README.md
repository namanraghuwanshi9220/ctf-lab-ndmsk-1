# 🎓 The Admin Comment

**Category:** Web Security  
**Difficulty:** Medium 🌶️🌶️  
**Tech Stack:** PHP, MySQL, Apache, Docker  
**Vulnerability:** Second-Order SQL Injection (Union-based / Error-based)

## 📖 Scenario
Welcome to the *College Notice Board*. Students can register, log in, and view their published notices on their personalized dashboard. The application looks rock-solid from the outside—all inputs on the login and registration pages are protected using strict Prepared Statements. However, the developer made a fatal assumption: *"Data coming from our own database is safe."*

## 🎯 Objective
Exploit the Second-Order SQL Injection vulnerability in the dashboard to bypass the privacy filter and read the Admin's hidden notice containing the flag.

## 🚀 Deployment Instructions
This challenge is fully containerized with a custom glass/dark-mode UI and proper 404 error handling.

1. Clone the repository and navigate to the directory:
   
   cd the-admin-comment
