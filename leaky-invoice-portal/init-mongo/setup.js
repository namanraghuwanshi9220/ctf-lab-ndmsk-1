db = db.getSiblingDB('ctf');
db.users.insertOne({
    _id: "65f0a1b2c3d4e5f67890abcd", // String ID for bot
    username: "finance_bot",
    password: "$2b$10$SomethingExtremelyLongAndUncrackableHashGoesHereXYZ",
    role: "user",
    bio: "I generate invoices."
});
print("Database initialized!");
