// Imports, setups
import express from "express";
import Database from "better-sqlite3";
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
import fs from "node:fs";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const DB_PATH = "./userDB.sql";
const dbExisted = fs.existsSync(DB_PATH);
const db = new Database(DB_PATH); // creates file if missing

if (!dbExisted) {
  console.log("Database not found. Creating a new database...");
}

// Always ensure required tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    pwd TEXT NOT NULL,
    shortcuts TEXT
  );
`);

app.post("/getSC", (req, res) => {
  /*
  This method retrieves all shortcuts stored by the user
  in the database. Then it embeds the result into a hidden
  element.
  */
  const user = req.body.user;
  let stmt = db.prepare("SELECT shortcuts FROM users WHERE username = ?");
  let ans = stmt.all(user);
  if (ans.length > 0) {
    res.render("home", { ok: "Good", sc: ans[0].shortcuts });
  } else {
    res.render("home", { ok: "Bad", sc: "" });
  }
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
  let stmt = db.prepare("UPDATE users SET shortcuts = ? WHERE username = ?");
  stmt.run(sc, user);
});

app.post("/saved", (req, res) => {
  /*
  This method retrieves the user's saved graphs. It then
  embeds the results into a hidden element in the page.
  */
  const user = req.body.username;
  let isOK = req.body.isOK;
  if (isOK != "OK") {
    let stmt = db.prepare("SELECT * FROM " + user + ";");
    let ans = stmt.all();
    res.render("saved", { btns: ans, ok: "OK" });
  }
});

//db.exec("CREATE TABLE users (username TEXT, pwd TEXT, shortcuts TEXT)")
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
    let stmt = db.prepare("SELECT username FROM users WHERE username = ?");
    let ans = stmt.all(user);
    
    if (ans.length > 0) {
      res.render("newacc", { msg: "Username already exists!" });
    } else {
      try {
        // Insert new user into db
        let insertStmt = db.prepare(
          "INSERT INTO users VALUES (?, ?, ?)"
        );
        insertStmt.run(user, pwd, "p d s");
        
        // Create table for user's graphs
        db.exec(
          "CREATE TABLE " +
            user +
            " (name TEXT, points TEXT, regressions TEXT);"
        );
        
        // Pass username to success page to set localStorage
        res.render("success", { username: user });
      } catch (err) {
        res.render("newacc", { msg: "Error creating account. Please try again." });
      }
    }
  }
});

app.post("/login", (req, res) => {
  // This method handles logins
  const user = req.body.user;
  const pwd = req.body.pwd;
  let stmt = db.prepare("SELECT pwd FROM users WHERE username = ?");
  let ans = stmt.all(user);
  
  if (ans.length > 0 && ans[0].pwd == pwd) {
    res.redirect("home"); // passwords match
  } else if (ans.length > 0) {
    res.render("login", { msg: "Invalid Password!" }); // passwords do not match
  } else {
    res.render("login", { msg: "Invalid Username!" }); // username does not exist
  }
});

app.post("/graph-editor", (req, res) => {
  // this method serves the "Save" button.
  const user = req.body.user;
  const points = req.body.points;
  const lines = req.body.lines;
  const origName = req.body.origName;
  const origPoints = req.body.origPoints;
  // origName and origPoints are the old attributes of the graph.
  let name = req.body.name;
  if (name == "") name = "Untitled Graph";
  if (points.length != 0) {
    let deleteStmt = db.prepare(
      "DELETE FROM " + user + " WHERE name=? AND points=?;"
    );
    deleteStmt.run(origName, origPoints);
    
    let insertStmt = db.prepare(
      "INSERT INTO " + user + " VALUES (?, ?, ?);"
    );
    insertStmt.run(name, points, lines);
  }
});

app.post("/delete", (req, res) => {
  // this method serves the "delete" button in saved graphs page
  const user = req.body.deluser;
  const points = req.body.delpts;
  const graphName = req.body.gname;
  console.log(points);
  let stmt = db.prepare(
    "DELETE FROM " + user + " WHERE name=? AND points=?;"
  );
  stmt.run(graphName, points);
  res.render("saved", { btns: [], ok: "Not OK" });
});

app.post("/changePwd", (req, res) => {
  // this method changes passwords
  const user = req.body.username;
  const oldpwd = req.body["old-pwd"];
  const newpwd = req.body["new-pwd"];
  const confirm = req.body["confirm-pwd"];
  const sc = req.body["shortcuts"];
  
  let stmt = db.prepare("SELECT pwd FROM users WHERE username = ?");
  let ans = stmt.all(user);
  
  if (ans.length === 0 || ans[0].pwd != oldpwd) {
    res.render("settings", { msg: "Incorrect Password!" });
  } else if (newpwd != confirm) {
    res.render("settings", {
      msg: "New password and confirmation do not match!",
    });
  } else {
    let deleteStmt = db.prepare("DELETE FROM users WHERE username=?");
    deleteStmt.run(user);
    
    let insertStmt = db.prepare(
      "INSERT INTO users VALUES (?, ?, ?);"
    );
    insertStmt.run(user, newpwd, sc);
    
    res.render("settings", { msg: "Password change successful." });
  }
});
