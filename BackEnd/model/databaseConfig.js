require('dotenv').config(); // Load environment variables from .env
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const dbconnect = {
    getConnection: function() {
        return mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }
};

// Function to hash existing plaintext passwords in the database
async function hashExistingPasswords() {
    const conn = dbconnect.getConnection();
    conn.connect();

    try {
        // Fetch all users who still have plaintext passwords (not bcrypt hashed)
        const [users] = await conn.promise().query("SELECT id, password FROM users WHERE password NOT LIKE '$2b$%'");

        if (users.length === 0) {
            console.log("No passwords need to be updated.");
            return;
        }

        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Update password in MySQL
            await conn.promise().query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

            console.log(`Updated password for user ID: ${user.id}`);
        }

        console.log("All plaintext passwords have been hashed.");
    } catch (err) {
        console.error("Error updating passwords:", err);
    } finally {
        conn.end();
    }
}

// Call the function to hash passwords when needed
hashExistingPasswords();

module.exports = dbconnect;
