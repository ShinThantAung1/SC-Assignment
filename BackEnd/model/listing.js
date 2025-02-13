

var db = require('./databaseConfig.js');

var listingDB = {
    addListing: function (title, category, description, price, fk_poster_id, callback) {
        console.log(description);
        var conn = db.getConnection();

        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            else {
                var sql = 'insert into listings(title,category,description,price,fk_poster_id) values(?,?,?,?,?)';
                conn.query(sql, [title, category, description, price, fk_poster_id], function (err, result) {
                    conn.end();
                    if (err) {
                        console.log("Err: " + err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                })

            }
        })
    },
    getUserListings: function (userid, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = `select l.title,l.category,l.price,l.id,i.name from listings l,images i where l.id = i.fk_product_id and fk_poster_id = ?`;
                conn.query(sql, [userid], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    getListing: function (id, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = "select l.title,l.category,l.description,l.price,u.username,l.fk_poster_id,i.name from listings l,users u,images i where l.id = ? and l.id = i.fk_product_id and l.fk_poster_id = u.id";
                conn.query(sql, [id], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    getOtherUsersListings: function (query, userid, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                // Use parameterized query to prevent SQL injection
                var sql = "SELECT l.title, l.category, l.price, l.id, i.name " +
                          "FROM listings l " +
                          "INNER JOIN images i ON l.id = i.fk_product_id " +
                          "WHERE l.fk_poster_id != ? AND l.title LIKE ?";
                
                // Use parameterized placeholders for 'userid' and 'query'
                conn.query(sql, [userid, `%${query}%`], function (err, result) {
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
    updateListing: function (title, category, description, price, id, userId, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log("Database connection error:", err);
                return callback(err, null);
            }
    
            // Step 1: Verify Ownership
            var checkOwnershipSql = "SELECT * FROM listings WHERE id = ? AND fk_poster_id = ?";
            conn.query(checkOwnershipSql, [id, userId], function (err, result) {
                if (err) {
                    conn.end();
                    console.log("Ownership verification error:", err);
                    return callback(err, null);
                }
    
                if (result.length === 0) {
                    conn.end();
                    return callback(new Error("Access denied: You do not own this listing"), null);
                }
    
                // Step 2: Proceed with Update
                var sql = "UPDATE listings SET title = ?, category = ?, description = ?, price = ? WHERE id = ?";
                conn.query(sql, [title, category, description, price, id], function (err, result) {
                    conn.end();
                    if (err) {
                        console.log("Update query error:", err);
                        return callback(err, null);
                    }
                    return callback(null, result);
                });
            });
        });
    }
    ,
    deleteListing: function (id, userId, callback) {
        var conn = db.getConnection();
    
        conn.connect(function (err) {
            if (err) {
                console.log("Database connection error:", err);
                return callback(err, null);
            }
    
            // Step 1: Verify Ownership
            var checkOwnershipSql = "SELECT * FROM listings WHERE id = ? AND fk_poster_id = ?";
            conn.query(checkOwnershipSql, [id, userId], function (err, result) {
                if (err) {
                    conn.end();
                    console.log("Ownership verification error:", err);
                    return callback(err, null);
                }
    
                if (result.length === 0) {
                    conn.end();
                    return callback(new Error("Access denied: You do not own this listing"), null);
                }
    
                // Step 2: Proceed with Deletion (Leaving SQL Injection Fix for Later)
                var sql = `DELETE FROM listings WHERE id=${id}`;
                conn.query(sql, [], function (err, result) {
                    conn.end();
                    if (err) {
                        console.log("Delete query error:", err);
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            });
        });
    }
    
}

module.exports = listingDB;