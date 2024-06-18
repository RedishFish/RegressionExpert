// Imports, setups
import express from "express";
import sqlite3 from "sqlite3";
const app = express();
import ejs from "ejs";

app.set("view engine", "ejs");
app.use(express.static("public"));

// Rendering of pages
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/srcdoc", (req, res) => {
  res.render("index");
});
app.get("/index", (req, res) => {
  res.render("index");
});
app.get("/newacc", (req, res) => {
  res.render("newacc", { msg: "" });
});
app.get("/login", (req, res) => {
  res.render("login", { msg: "" });
});
app.get("/success", (req, res) => {
  res.render("success");
});
app.get("/home", (req, res) => {
  res.render("home", { ok: "Bad", sc: "" });
});
app.get("/graph-editor", (req, res) => {
  res.render("graph-editor");
});
app.get("/settings", (req, res) => {
  res.render("settings", { msg: "Choose an option to get started: " });
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Express server initiated.");
});

app.get("/saved", (req, res) => {
  res.render("saved", { btns: [], ok: "Not OK" });
});

import bodyParser from "body-parser";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = new sqlite3.Database("./userDB.sql"); // the database

app.post("/getSC", (req, res) => {
  /*
  This method retrieves all shortcuts stored by the user
  in the database. Then it embeds the result into a hidden
  element.
  */
  const user = req.body.user;
  let sql = 'SELECT shortcuts FROM users WHERE username = "' + user + '"'; // retrieving
  db.all(sql, [], (err, ans) => {
    if (err) throw err;
    res.render("home", { ok: "Good", sc: ans[0].shortcuts }); // embedding
  });
});

app.post("/changeSC", (req, res) => {
  /*
  This method allows for the changing of shortcuts.
  */
  const plot = req.body.plot;
  const del = req.body.delete;
  const select = req.body.select;
  const user = req.body.user;
  // Retrieve the user's selections, and combine into string
  let sc = plot + " " + del + " " + select;
  // Store string into db
  let sql = db.prepare(
    "UPDATE users SET shortcuts = '" +
      sc +
      "' WHERE username = '" +
      user +
      "';",
  );
  sql.run();
  sql.finalize();
});

app.post("/saved", (req, res) => {
  /*
  This method retrieves the user's saved graphs. It then
  embeds the results into a hidden element in the page.
  */
  const user = req.body.username;
  let isOK = req.body.isOK;
  if (isOK != "OK") {
    let sql = "SELECT * FROM " + user + ";";
    db.all(sql, [], (err, ans) => {
      if (err) throw err;
      res.render("saved", { btns: ans, ok: "OK" });
    });
  }
});

//db.run("CREATE TABLE users (username TEXT, pwd TEXT, shortcuts TEXT)")
// The last statement creates the db. Only un-comment it when rebuilding the db.
app.post("/newacc", (req, res) => {
  // This method creates new accounts and shows alerts
  const user = req.body.user;
  const pwd = req.body.pwd; // retrieve user's inputs
  if (user == "users") {
    res.render("newacc", {
      msg: "For technical reasons, that username is not available. ", // otherwise sql error...
    });
  } else {
    let sql = 'SELECT username FROM users WHERE username = "' + user + '"';
    db.all(sql, [], (err, ans) => {
      if (err) {
        throw err;
      }
      // if username does not exist, ans is null, so doing
      // ans[0].username will give an error.
      // if an error occured, this means username is not
      // already in use.
      try {
        if (ans[0].username == user) {
          res.render("newacc", { msg: "Username already exists!" }); 
        }
      } catch {
        db.serialize(() => {
          let stmt = db.prepare(
            'INSERT INTO users VALUES ("' +
              user +
              '", "' +
              pwd +
              '", "p d s");',
          ); // insert new user into db
          stmt.run();
          stmt = db.prepare(
            "CREATE TABLE " +
              user +
              " (name TEXT, points TEXT, regressions TEXT);",
          );
          stmt.run();
          stmt.finalize();
          res.redirect("success"); // redirect to success page
        });
      }
    });
  }
});

app.post("/login", (req, res) => {
  // This method handles logins
  const user = req.body.user;
  const pwd = req.body.pwd;
  let sql = 'SELECT pwd FROM users WHERE username = "' + user + '";';
  db.all(sql, [], (err, ans) => {
    // similarly as last method, if username does not exist, an error will occur
    try {
      if (ans[0].pwd == pwd) {
        res.redirect("home"); // passwords match
      } else {
        res.render("login", { msg: "Invalid Password!" }); // passwords do not match
      }
    } catch {
      res.render("login", { msg: "Invalid Username!" }); // error, so username does not exist
    }
  });
});

app.post("/graph-editor", (req, res) => {
  // this method is serves the "Save" button.
  const user = req.body.user;
  const points = req.body.points;
  const lines = req.body.lines;
  const origName = req.body.origName;
  const origPoints = req.body.origPoints;
  // origName and origPoints are the old attributes of the graph.
  let name = req.body.name;
  if (name == "") name = "Untitled Graph";
  if (points.length != 0) {
    let sql = db.prepare(
      "DELETE FROM " +
        user +
        " WHERE name='" +
        origName +
        "' AND points='" +
        origPoints +
        "';", // delete old attributes
    );
    sql.run();
    sql = db.prepare(
      "INSERT INTO " +
        user +
        ' VALUES ("' +
        name +
        '", "' +
        points +
        '", "' +
        lines +
        '");', // insert new attributes, thus saving
    );
    sql.run();
    sql.finalize();
  }
  //res.status(200).send();
  //res.end();
});

app.post("/delete", (req, res) => {
  // this method serves the "delete" button in saved graphs page
  const user = req.body.deluser;
  const points = req.body.delpts;
  const graphName = req.body.gname;
  console.log(points);
  let sql = db.prepare(
    "DELETE FROM " +
      user +
      " WHERE name='" +
      graphName +
      "' AND points='" +
      points +
      "';", // delete the row corresponding to the graph
  );
  sql.run();
  sql.finalize();
  res.render("saved", { btns: [], ok: "Not OK" });
});

app.post("/changePwd", (req, res) => {
  // this method changes passwords
  const user = req.body.username;
  const oldpwd = req.body["old-pwd"];
  const newpwd = req.body["new-pwd"];
  const confirm = req.body["confirm-pwd"];
  const sc = req.body["shortcuts"];
  let sql = 'SELECT pwd FROM users WHERE username = "' + user + '";'; // select old password
  db.all(sql, [], (err, ans) => {
    if (ans[0].pwd != oldpwd) {
      res.render("settings", { msg: "Incorrect Password!" }); // check if passwords match
    } else if (newpwd != confirm) {
      res.render("settings", {
        msg: "New password and confirmation do not match!",
      });
    } 
    else {  
      sql = db.prepare("DELETE FROM users WHERE username='" + user + "';"); // delete old username/password pair
      sql.run();
      sql = db.prepare(
        'INSERT INTO users VALUES ("' + user + '", "' + newpwd + '", "'+sc+'");'); // insert new username/password pair
      sql.run();
      sql.finalize();
      res.render("settings", { msg: "Password change successful." }); // alert the user
    }
  });
});
