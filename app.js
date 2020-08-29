//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const shortid = require("shortid");
const sid = shortid.generate();

const app = express();

const currentDate = new Date(Date.now()).toLocaleString();

//lowdb
db.defaults({ posts: [], user: [], count: 0 }).write();



/* lowdb references
db.get("user").push({
  id:1,
  name:"seol",
  profile:"developer"
}).write();

db.get("posts").push({
  id:1,
  title: "lowdb",
  description: "lowdb is...",
  author: 1
}).write();


db.get("posts").push({
  id:2,
  title: "mySQL",
  description: "mySQL is...",
  author: 1
}).write();


console.log(db.get("posts").find({title:"lowdb", author:1}).value());


db.get("posts").find({id:2}).assign({title:"MYSQL & Mariadb"}).write();


db.get("posts").remove({id:2}).write();


const sid = shortid.generate();
db.get("user").push({
  id:sid,
  name:"taeho",
  profile:"trainer"
}).write();
db.get("posts").push({
  id:shortid.generate(),
  title:"Hello",
  description:"Bye",
  author:sid
}).write();
 */

//let posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, resp){
  resp.render("home",{ homePosts:db.get("posts").value()});
});

app.get("/about", function(req, resp){
  resp.render("about");
});

app.get("/contact", function(req, resp){
  resp.render("contact");
});

app.get("/compose", function(req, resp){
  resp.render("compose");
});

// express creat
app.post("/compose", function(req, resp){

  //const currentDate = new Date(Date.now()).toLocaleString();
  const randomImg = "https://picsum.photos/200/300";

  const post = {
    title: _.capitalize(req.body.title),
    content: req.body.content,
    timeStamp: currentDate,
    image: randomImg,
    id: sid
  };

  db.get("posts").push(post).write();
  resp.redirect("/");
});

//express routing - read
app.get("/posts/:postName", function(req, resp){
  const requestedTitle = _.lowerCase(req.params.postName);

  db.get("posts").value().forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if(storedTitle === requestedTitle) {
      resp.render("post",{title: post.title, content:post.content, postTime:post.timeStamp, imgRandom:post.image});
    }
  });
});

//express routing - update
app.get("/update/:updatePostName", function(req, resp){
  const requestedTitle = _.lowerCase(req.params.updatePostName);

  db.get("posts").value().forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if(storedTitle === requestedTitle) {
      resp.render("update",{title: post.title, content:post.content});
    }
  })
});

app.post("/update/:updatePostName", function(req, resp){
  const requestedTitle = _.lowerCase(req.params.updatePostName);
  db.get("posts").value().forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if(storedTitle === requestedTitle) {
      db.get("posts").find({title:post.title}).assign({title: req.body.title, content: req.body.content, timeStamp: currentDate}).write();
    }
  });
  resp.redirect("/");
});

//express routing - delete
app.get("/delete/:deletePostName", function(req, resp){
  const requestedTitle = _.lowerCase(req.params.deletePostName);

  db.get("posts").value().forEach(function(post){
    const storedTitle = _.lowerCase(post.title);

    if(storedTitle === requestedTitle) {
      db.get("posts").remove({title:post.title}).write();
      resp.redirect("/");
    }
  });
});

//Search

app.post("/search", function(req, resp){
  const searchTitle = _.capitalize(req.body.searchTitle);
  console.log(searchTitle);
  const result = db.get("posts").find({title:searchTitle}).value();
  console.log(result);
  resp.render("search", {searchResults:result});
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
