var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var promise = require('promise');
var route = express.Router();

var imageLink = null;

app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Vipul@123',
    database:'adminDatabase1'
});

var sql1 = "CREATE TABLE IF NOT EXISTS movieTable (movieName VARCHAR(255) PRIMARY KEY, actorName VARCHAR(255), movieDate VARCHAR(255), movieRating INT, movieBudget INT, movieGross INT)";
connection.query(sql1, function (Error, Result) {
     if (Error) throw Error;
     console.log("movieTable created!!");
});

route.post('/movieAdd', function (request, response) {

    var movieName = request.body.movieName.trim();
    var actorName = request.body.actorName.trim();
    var movieDate = request.body.movieDate.trim();
    var movieRating = parseInt(request.body.movieRating.trim());
    var movieBudget = parseInt(request.body.movieBudget.trim());
    var movieGross = parseInt(request.body.movieGross.trim());

    console.log('reach');

    if (movieName === "" || actorName === "" || movieDate === "" || movieRating === "" || movieBudget === "" || movieGross === ""){
        response.send("<center><h2 style='font-family: Chandas'>'Undefined' Error! :: All fields are required!</h2></center>");
    }
    else if (movieRating < 1 || movieRating > 5){
        response.send("<center><h2 style='font-family: Chandas'>'Input Error!' :: Please select a range between 0 and 5 for rating.</h2></center>");
    }
    else{
            let sql9 = "SELECT * FROM movieTable WHERE movieName = ? ";
            let valueMovie = [[movieName]];

            connection.query(sql9, valueMovie, function (Error, Result) {
                if (Result.length === 0){
                    let sql2 = "INSERT INTO movieTable VALUES ?";
                    let values = [[movieName, actorName, movieDate, movieRating, movieBudget, movieGross]];

                    connection.query(sql2, [values], function (Error) {
                        if (Error) throw Error;
                        console.log("Movie data inserted!")
                    });

                    response.writeHead(200, {"Content-Type":"text/html"});
                    fs.createReadStream('/Users/vipulbhagwat/Desktop/MovieDB/index/movieAdded.html').pipe(response);
                }
                else {
                    response.send("<center><h2 style='font-family: Chandas'>'Duplicate Error!' :: Movie already exists in database.</h2></center>");
                }
            });
    }
 });

 route.get('/getMovie', function (request, response) {
     var movieData = request.query.searchElement.trim();

     if (movieData != ""){
         var sqlFind = "SELECT * FROM movieTable WHERE movieName = ? OR actorName = ?";
         var values = [movieData, movieData];

         connection.query(sqlFind, values,function (Error, Result) {
             if (Error) throw Error;
             if (Result.length == 0){
                 insertIntoNotFoundTable(movieData);
                 response.writeHead(200, {"Content-Type":"text/html"});
                 fs.createReadStream('/Users/vipulbhagwat/Desktop/MovieDB/index/movieNOTFound.html').pipe(response);
             }
             else {
                 console.log(Result);
                 response.render(path.join(__dirname, "../..") + "/index/movieFound.html", {name:Result});
             }
         });
     }
     else {
         response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

     }
 });


route.post('/showMovies', function (request, response) {
    var movieName = request.body.showMovies.trim();

    if (movieName != ""){

        var sqlShowMovies = "SELECT * FROM movieTable WHERE movieName =  ?";
        var values = [movieName];

        connection.query(sqlShowMovies, values,function (Error, Result) {
            if (Error) throw Error;
            if (Result.length === 0){
                console.log("Movie not found.");
                response.send("<center><h2 style='font-family: Chandas'>'Movie not found in our database!</h2></center>");
            }
            else {
                console.log(Result);
                console.log("Movie found!");
                response.send(Result);
            }
        });
    }
    else {
        response.send("<center><h2 style='font-family: Chandas'>'Undefined Error!' :: Please enter input paramters.</h2></center>");

    }
});

 function insertIntoNotFoundTable(data){
     var sqlNotFound = "CREATE TABLE IF NOT EXISTS movieNotFoundTable (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, movieData VARCHAR(255))";
     connection.query(sqlNotFound, function (Error, Result) {
         if (Error) throw Error;
         console.log("Movie not found table created!!");
     });

     let sql = "INSERT INTO movieNotFoundTable (movieData) VALUES ?";
     let values = [[data]];

     connection.query(sql, [values], function (Error) {
         if (Error) throw Error;
         console.log("Movie data inserted!")
     });
 }

module.exports = route;