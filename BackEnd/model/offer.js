var db = require("./databaseConfig.js");

var offerDB = {
  addOffer: function (offer, fk_listing_id, fk_offeror_id, status, callback) {
    var conn = db.getConnection();

    conn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        var sql = `INSERT INTO offers (offer, fk_listing_id, fk_offeror_id, status)
           VALUES (?, ?, ?, ?)`;
        conn.query(
          sql,
          [offer, fk_listing_id, fk_offeror_id, status],
          function (err, result) {
            conn.end();
            if (err) {
              console.log("Err: " + err);
              return callback(err, null);
            } else {
              return callback(null, result);
            }
          }
        );
      }
    });
  },
  getOffers: function (userid, callback) {
    var conn = db.getConnection();

    conn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        var sql =
          'select u.username,o.offer,l.title,o.id from users u,listings l,offers o where u.id = o.fk_offeror_id and l.id = o.fk_listing_id and o.status = "pending" and l.fk_poster_id = ?;';
        conn.query(sql, [userid], function (err, result) {
          conn.end();
          if (err) {
            console.log("Err: " + err);
            return callback(err, null);
          } else {
            return callback(null, result);
          }
        });
      }
    });
  },
  AcceptOrRejectOffer: function (status, offerid, callback) {
    var conn = db.getConnection();

    conn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        var sql = `UPDATE offers SET status = ? WHERE id = ?`;
        conn.query(sql, [status, offerid], function (err, result) {
          conn.end();
          if (err) {
            console.log("Err: " + err);
            return callback(err, null);
          } else {
            return callback(null, result);
          }
        });
      }
    });
  },
  getOfferStatus: function (userid, callback) {
    var conn = db.getConnection();

    conn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        var sql =
          'select u.username,o.offer,l.title,o.status from users u,listings l,offers o where o.fk_listing_id = l.id and l.fk_poster_id = u.id and o.fk_offeror_id = ? and (o.status = "accepted" or o.status = "rejected");';
        conn.query(sql, [userid], function (err, result) {
          conn.end();
          if (err) {
            console.log("Err: " + err);
            return callback(err, null);
          } else {
            return callback(null, result);
          }
        });
      }
    });
  },
};

module.exports = offerDB;
