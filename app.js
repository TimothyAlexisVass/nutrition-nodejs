require('dotenv').config({path: __dirname + '/.env'})

const FILESYSTEM = require('fs');

const CORS = require('cors');
const EXPRESS = require('express');
const APPLICATION = new EXPRESS();
      APPLICATION.use(CORS());

const PUBLIC_HTML = __dirname + '/public_html/';
const VIEWS_DIR = __dirname + '/views/';

const MARIADB = require('mariadb');
const CONNECTION = MARIADB.createConnection({
    host: process.env.DATABASE_HOST, 
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
});

let TESTDATA;
const VIEWS = {};

CONNECTION.then(
    conn => {
        conn.query("SELECT * FROM bodyInfo", [2])
        .then(rows => {
          TESTDATA = rows;
          conn.end();
        })
        .catch(err => { 
          console.log(err);
        });
    }
).catch(
    err => {
      console.log(err);
    }
);


// Create get requests for all files in views
FILESYSTEM.readdir(VIEWS_DIR, (err, files) => {
    if (err) {
        throw err;
    }

    files.forEach(file => {
        FILESYSTEM.readFile(VIEWS_DIR + '/' + file, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            VIEWS[file] = data;
        });
    });
});


APPLICATION.get('/', function(request, response){
    response.sendFile('index.html', { root: PUBLIC_HTML });
});

// Request to web root
APPLICATION.get('/getdata', function(request, response){
    response.send(VIEWS['main']);
});

// Start the server on port 3000
APPLICATION.listen(3000, '127.0.0.1');
console.log('Node server running on port 3000');