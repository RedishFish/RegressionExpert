const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();

const ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/srcdoc', (req, res) => {
  res.render('index');
});
app.get('/index', (req, res) => {
  res.render('index');
});
app.get('/newacc', (req, res) => {
  res.render('newacc');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/success', (req, res) => {
  res.render('success');
});
app.get('/home', (req, res) => {
  res.render('home');
});
app.get('/graph-editor', (req, res) => {
  res.render('graph-editor');
});
app.get('/settings', (req, res) => {
  res.render('settings');
});
app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(3000, () => {
  console.log('Express server initiated.');
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = new sqlite3.Database('./userDB.sql');

app.get('/saved', (req, res) => {
  res.render('saved', {btns: [], ok: "Not OK"});
});

app.post('/saved', (req, res) => {
  const user = req.body.username;
  let isOK = req.body.isOK;
  if(isOK != 'OK'){
    let sql = "SELECT * FROM "+user+";";
    db.all(sql, [], (err, ans) => {
      if(err) throw err;
      res.render('saved', {btns: ans, ok: 'OK'});
    });
  }
});

// db.run("CREATE TABLE users (username TEXT, pwd TEXT)")
app.post('/newacc', (req, res) => {
  const user = req.body.user;
  const pwd = req.body.pwd;

  let sql = "SELECT username FROM users WHERE username = \""+user+"\"";
  db.all(sql, [], (err, ans) => {
    if(err){
      throw err;
    }
    try {
      if(ans[0].username == user){

      }
    }
    catch {
      db.serialize(() => {
        let stmt = db.prepare("INSERT INTO users VALUES (\""+user+"\", \""+pwd+"\")");
        stmt.run();
        stmt = db.prepare("CREATE TABLE "+user+" (name TEXT, points TEXT, regressions TEXT);");
        stmt.run();
        stmt.finalize();
        res.redirect('success');
      });
    }
  });
});

app.post('/login', (req, res) => {
  const user = req.body.user;
  const pwd = req.body.pwd;
  let sql = "SELECT pwd FROM users WHERE username = \""+user+"\";";
  db.all(sql, [], (err, ans) => {
    if(err){
      throw err;
    }
    try {
      if(ans[0].pwd == pwd){
        res.redirect('home');
      }
    }
    catch {

    }
  });
});

app.post('/graph-editor', (req, res) =>{
  const user = req.body.user;
  const points = req.body.points;
  const lines = req.body.lines;
  const origName = req.body.origName;
  const origPoints = req.body.origPoints;
  let name = req.body.name;
  if(name == "") name = "Untitled Graph";
  if(points.length != 0){
    let sql = db.prepare("DELETE FROM "+user+" WHERE name='"+origName+"' AND points='"+origPoints+"';");
    sql.run();
    sql = db.prepare("INSERT INTO "+user+" VALUES (\""+name+"\", \""+points+"\", \""+lines+"\");");
    sql.run();
    sql.finalize();
  }
});
