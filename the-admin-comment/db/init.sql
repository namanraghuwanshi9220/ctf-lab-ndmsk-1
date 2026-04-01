CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student'
);

CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE
);

-- Securely inserting Admin and the Flag
INSERT INTO users (username, password, role) VALUES ('admin', MD5('super_secret_admin_pass_123!'), 'admin');
INSERT INTO notices (author, title, content, is_private) VALUES ('admin', 'Welcome', 'Welcome to the new semester everyone!', 0);
INSERT INTO notices (author, title, content, is_private) VALUES ('admin', 'FLAG', 'CTF{2nd_0rd3r_SQL1_M4st3r}', 1);
