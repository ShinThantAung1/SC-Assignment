var db = require('./databaseConfig.js');
var config = require('../config.js');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var userDB = {

	loginUser: function (email, password, callback) {
        const conn = db.getConnection();

        conn.connect(function (err) {
            if (err) {
                console.error("Database connection error:", err);
                return callback(new Error("Database connection error."), null, null);
            }

            // Fetch the user by email
            const sql = "SELECT * FROM users WHERE email = ?";
            conn.query(sql, [email], async function (err, result) {
                conn.end();

                if (err) {
                    console.error("SQL query error:", err);
                    return callback(new Error("SQL query error."), null, null);
                }

                // If no user is found, return an error
                if (!result || result.length === 0) {
                    return callback(new Error("User not found."), null, null);
                }

                const userData = result[0];

                // Compare the provided password with the hashed password
                const isPasswordValid = await bcrypt.compare(password, userData.password);
                if (!isPasswordValid) {
                    return callback(new Error("Invalid credentials."), null, null);
                }

                // Generate a JWT token
                const token = jwt.sign({ id: userData.id }, config.key, { expiresIn: "24h" });

                // Return the token and user data
                callback(null, token, [userData]);
            });
        });
    },
	updateUser: function (username, firstname, lastname, id, callback) {

		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("Connected!");

				var sql = "update users set username = ?,firstname = ?,lastname = ? where id = ?;";

				conn.query(sql, [username, firstname, lastname, id], function (err, result) {
					conn.end();

					if (err) {
						console.log(err);
						return callback(err, null);
					} else {
						console.log("No. of records updated successfully: " + result.affectedRows);
						return callback(null, result.affectedRows);
					}
				})
			}
		})
	},

	addUser: function (username, email, password, profile_pic_url, role, callback) {

		var conn = db.getConnection();

		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {


				console.log("Connected!");
				var sql = "Insert into users(username,email,password,profile_pic_url,role) values(?,?,?,?,?)";
				conn.query(sql, [username, email, password, profile_pic_url, role], function (err, result) {
					conn.end();

					if (err) {
						console.log(err);
						return callback(err, null);
					} else {
						return callback(null, result);
					}
				});

			}
		});
	},
};


module.exports = userDB;