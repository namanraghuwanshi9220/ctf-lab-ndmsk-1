**Category:** Web Security / Cryptography  
**Difficulty:** Medium 🌶️🌶️  
**Tech Stack:** Python, Flask, PyJWT, Docker  
**Vulnerability:** JWT Algorithm Confusion (RS256 → HS256) + Source Code Recon

## 📖 Scenario
Welcome to the *College Portal v2.0*. Students can log in with their names to view their semester results. However, the top-secret administrative flag is locked behind the `admin` role. The portal prevents direct admin logins, and the session management relies on securely signed JSON Web Tokens (JWT). Can you outsmart the updated security architecture?

## 🎯 Objective
1. Bypass the authentication mechanism.
2. Forge a valid JWT with the `role` set to `admin`.
3. Access the dashboard to retrieve the flag.

## 🚀 Deployment Instructions
This challenge is fully containerized and ready for production deployment.

1. Clone the repository and navigate to the challenge directory:

docker-compose up --build -d

The challenge will be accessible at http://localhost:5000.

 flag CTF{JwT_Alg0_c0nfus10n_M4st3r}
