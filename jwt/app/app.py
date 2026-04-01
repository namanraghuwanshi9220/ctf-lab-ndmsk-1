import os
import base64
import json
import hmac
import hashlib
import jwt
from flask import Flask, render_template, request, redirect, url_for, make_response
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "CTF{JwT_Alg0_c0nfus10n_M4st3r}")

# --- KEY GENERATION ON STARTUP ---
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())
public_key = private_key.public_key()

PEM_PRIVATE = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption()
)

PEM_PUBLIC = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# Hide public key
os.makedirs('static/assets', exist_ok=True)
with open('static/assets/pub_cert_v2_backup.pem', 'wb') as f:
    f.write(PEM_PUBLIC)

# ---------------------------------

@app.route('/')
def index():
    token = request.cookies.get('session_token')
    if token:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    
    if username.lower() == 'admin':
        return render_template('index.html', error="Admin login via portal is disabled.")
    
    # Sign token with RS256
    token = jwt.encode(
        {'username': username, 'role': 'student'}, 
        PEM_PRIVATE, 
        algorithm='RS256'
    )
    
    resp = make_response(redirect(url_for('dashboard')))
    resp.set_cookie('session_token', token)
    return resp

@app.route('/dashboard')
def dashboard():
    token = request.cookies.get('session_token')
    if not token:
        return redirect(url_for('index'))
    
    try:
        # VULNERABILITY: ALGORITHM CONFUSION (Hardcoded to bypass modern library restrictions)
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get('alg', 'RS256')
        
        if alg == 'HS256':
            # Atacker uses HS256 with Public Key! We verify it manually.
            parts = token.split('.')
            if len(parts) != 3: raise Exception("Invalid token format")
            
            unsigned_token = f"{parts[0]}.{parts[1]}"
            signature = parts[2]
            
            # Use public key as symmetric secret
            expected_sig = hmac.new(PEM_PUBLIC, unsigned_token.encode('utf-8'), hashlib.sha256).digest()
            expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).replace(b'=', b'').decode('utf-8')
            
            if signature != expected_sig_b64:
                raise Exception("Invalid HMAC Signature")
            
            # Decode payload
            padding_needed = len(parts[1]) % 4
            payload_padded = parts[1] + ('=' * (4 - padding_needed) if padding_needed else '')
            decoded = json.loads(base64.urlsafe_b64decode(payload_padded).decode('utf-8'))
            
        else:
            # Legitimate Student (RS256)
            decoded = jwt.decode(token, PEM_PUBLIC, algorithms=['RS256'])

        role = decoded.get('role', 'student')
        username = decoded.get('username', 'Unknown')
        
        if role == 'admin':
            return render_template('dashboard.html', username=username, role=role, flag=FLAG)
        else:
            return render_template('dashboard.html', username=username, role=role, flag=None)
            
    except Exception as e:
        resp = make_response(redirect(url_for('index')))
        resp.set_cookie('session_token', '', expires=0)
        return resp

@app.route('/logout')
def logout():
    resp = make_response(redirect(url_for('index')))
    resp.set_cookie('session_token', '', expires=0)
    return resp

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
