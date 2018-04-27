var express = require('express');
var app = express();
var morgan = require('morgan'); 
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');

var connectionString = "mongodb+srv://admin:990202Gfh@fuh-tybjh.mongodb.net/test";

app.use(express.static(__dirname+ '/public'));
app.use(morgan('dev'));  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(methodOverride());
app.use(session({secret: "Your secret key"}));

app.get('/',function(req,res){
	res.sendFile(__dirname + "/public/login.html");
});

app.post('/login',function(req,res){
	MongoClient.connect(connectionString, function(err,db){
		var dbo = db.db("mydb");
		console.log(req.body.id);
		dbo.collection("users").findOne({id:req.body.id},function(err,result){
			console.log(result);
			if (!result) res.send("not existed");
			else if (result.password != req.body.password) res.send("wrong password");
			else {
				req.session.user = result;
				res.send('succeed');
				console.log(req.session.user);
				
			};
		});
	});
});

app.post('/signup', function(req,res){
	MongoClient.connect(connectionString, function(err,db){
		var dbo = db.db("mydb");
		var newUser = {id: req.body.id, password: req.body.password};
		console.log(newUser);
		dbo.collection("users").findOne({id:req.body.id},function(err,result){
				if (result) {
					res.send("Failed: User Already Exist");
				}
				else if (!req.body.id || !req.body.password || !req.body.password2){
						res.send("Failed: Above should not be blank");
				}
				else {	
					if (req.body.password != req.body.password2){
						res.send("Failed: Passwords are not equal");
					}
					
					else {
						dbo.collection("users").insertOne(newUser,function(err, res){
							console.log("New User added!");
						});
						req.session.user = newUser;
						res.send('succeed');
					};
				};
		});	
	});
});


app.get('/todos', function(req,res){
	MongoClient.connect(connectionString, function(err,db){
		var dbo = db.db("mydb");
		dbo.collection(req.session.user.id).find({}).toArray(function(err,todos){
			console.log(todos);
			res.json(todos);
		});
	});
});

app.post('/addtodos',function(req,res){
	MongoClient.connect(connectionString, function(err,db){
		var dbo = db.db("mydb");
		var newTodo = {text: req.body.text, done: false}
		console.log(newTodo);
		if (!req.body.text){
			console.log("empty once")
		}
		else{
			dbo.collection(req.session.user.id).insertOne(newTodo, function(err,todo){
				console.log("one document inserted");
			});
			dbo.collection(req.session.user.id).find({}).toArray(function(err,todos){
				res.json(todos);
			});
		};
	});
});

app.delete('/todos/:todo_id', function(req, res){
	MongoClient.connect(connectionString, function(err,db){
		var dbo = db.db("mydb");
		var myquery = {text : req.params.todo_id};
		console.log(myquery);
		dbo.collection(req.session.user.id).deleteOne(myquery,function(err,obj){
			console.log("1 document deleted");
		});
		dbo.collection(req.session.user.id).find({}).toArray(function(err,todos){
			res.json(todos);
		});
	});
});



app.listen(8080);