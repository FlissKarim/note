const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// server listening on
const port = 8000;

// noteFormat of user files
const noteFormat = ".txt";
const favFormat = ".fav";
// variable filled with data of current user traiting
var session = {}
var UsersDir = "Users";
// dictionary stock recent authentifications to fast check valid requests later
var authentifications = {};
// dictionary stock stuff todo, send notification to users, run jobs ..
var todos = { 'notifications': [], 'jobs': [] };
// dictionary stock stuff did for a day ago
var dids = { 'notifications': [], 'jobs': [] };

var notification_updater = setInterval(function(authentifications, todos, dids) {
    var now = new Date();
    var happyBirthday = "Happy birthday :)";
    for(let pseudo in authentifications) {
        console.log("updating..");
        var user = {'pseudo': pseudo };
        var file = File(user);
        var obj = fileToObject(file);
        var parts = obj.birthday.split('-');
        var birthday = new Date(parts[2], parts[1] - 1, parts[0]);
        if (birthday.getMonth() == now.getMonth() && birthday.getDay() == now.getDay()) {
            if (!dids['notifications'][pseudo])
                dids['notifications'][pseudo] = []
            else if (dids['notifications'][pseudo].indexOf(happyBirthday) < 0) {
                todos['notifications'][pseudo].push(happyBirthday);
            }
        }
    }
  }, 5000, authentifications, todos, dids);

// extract a hint of string (n characters)
function hint(str, n) {
    var res = "";
    var i = 0;
    var tag = false;
    while (n >= 0 && i < str.length) {
        if (str.charAt(i) == '<') {tag = true; res +=" "; }
        else if (str.charAt(i) == '>') tag = false;
        else if (!tag) { res += str.charAt(i); n--;}
        i++;
    }
    return res + '..';
}
function error(message) {
    console.log('E: ' + message);
}

// construct name of directory user
function Dir(user) {
    return UsersDir + '/' + '_' + user.pseudo + '/';
}
function File(user) {
    return UsersDir + '/' + user.pseudo + noteFormat;
}
// create user file for newbie
function createUserFile(user) {
    userFile = File(user);
    data = '{"pseudo": "' + user.pseudo + '" , "hash": "' + user.hash + '", "birthday": "'+ user.birthday +'" }'
    fs.writeFile(userFile, data, (err) => {
        if (err) throw err;
        console.log('File is created.');
    });
}
// create user directory for a newbie
function createUserDir(user) {
    // create the root folder if not exists
    if (!fs.existsSync(UsersDir)){
        fs.mkdirSync(UsersDir);
    }
    // include notes
    const dir = Dir(user);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        console.log('Directory is created.');
    }
}

// delete folder and it subdirectries
function deleteFolder(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recursive
          deleteFolder(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };


// save it in authentification enregstry
// init notification stack to be pushed
function startSession(session) {
    authentifications[session.pseudo] = session.hash;
    todos['notifications'][session.pseudo] = [];
}

function endSession(user) {
    delete authentifications[user.pseudo];
    console.log('Session ended up.');
}

function getSession(request) {
    return {
        "pseudo" :request.body['session[pseudo]'],
        "hash": request.body['session[hash]']
        }
}

function hasSession(session) {
    return authentifications[session.pseudo] == session.hash;
}

// check from user file instead DB cause i cant configure it
function freeId(user) {
    var file = File(user);
    return !fs.existsSync(file);
}

// create user data if newbie
function addUser(user) {
    if(freeId(user)) {
        createUserDir(user);
        createUserFile(user);
        console.log(user.pseudo + " added to user's list.");
        return;
    }
    console.log("User already exists");
}

function removeUser(user) {
    fs.unlinkSync( File(user) );
    deleteFolder( Dir(user) );
    console.log(user.pseudo + ' is deleted.');
}

function fileToObject(file) {
    var obj = '{}';
    if (fs.existsSync(file)) {
        var res = fs.readFileSync(file, 'utf8');
        obj = JSON.parse(res);
    }
    return obj;
}
function authentification(user) {
    // check from user file instead DB cause i cant configure it
    file = File(user);
    var obj = fileToObject(file);
    return obj.pseudo === user.pseudo && obj.hash === user.hash;
}

// return object fill with notes to send to user
function importNote(user) {
    var path = Dir(user);
    // return notes
    var content = ' { "object" : "notes", "list": ['
    if (fs.existsSync(path)) {
        console.log('importation..');
        fs.readdirSync(path).forEach((file, index) => {
          if (file.search(noteFormat) != -1) {
            const curPath =  path + file;
            var res = fs.readFileSync(curPath, 'utf8');
            var obj = JSON.parse(res);
            // show a hint of note 20 caractere length
            obj.body = hint(obj.body, 20);
            content += JSON.stringify(obj) + ',';
          }
        });
    }
    content = content.substring(0, content.length - 1) + ' ] }';
    return content
}
// delete note from user account
function deleteNote(user, note) {
    var file = Dir(user) + '/' + note.id + noteFormat;
    if (fs.existsSync(file)) fs.unlinkSync(file);
    deleteFavorite(user, note.id);
}

// add note or update it if its existes to server side
function syncNote(user, note) {
    const file = Dir(user) + '/' + note.id + noteFormat;
    fs.writeFile(file, JSON.stringify(note), (err) => {
        if (err) throw err;
        console.log('Note Submitted.');
    });
}

function addFavorite(user, note_id) {
    const file = Dir(user) + '/' + note_id + favFormat;
    fs.writeFile(file, '', (err) => {
        if (err) throw err;
        console.log('Note added to favories.');
    });
}

function deleteFavorite(user, note_id) {
    const file = Dir(user) + '/' + note_id + favFormat;
    if (fs.existsSync(file)) fs.unlinkSync(file);
}


function importFav(user) {
    var path = Dir(user);
    var content = ' { "object" : "favorites", "list": ['
    // return notes order by date
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            if (file.search(favFormat)) {
                var id = file.split(favFormat)[0];
                content += '{ "id": "' + id + '"}' + ',';
            }
        });
    }
    content = content.substring(0, content.length - 1) + ' ] }'
    return content
}

app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', (request, response) => {
    var pseudo = getSession(request);
    console.log('Root reached @' + pseudo);
});

app.post('/Connect', (request, response) => {
    session = getSession(request);
    var message = "500";
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    if(authentification(session)) {
        startSession(session);
        message = "200";
        console.log('Root: connected as ' + session.pseudo);
    }
    response.write(message);
    response.end();
});

app.post('/DeleteUser', (request, response) => {
    var message = "500";
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    var session = getSession(request);
    if (hasSession(session)) {
        var user = getSession(request);
        removeUser(user);
        endSession(user);
        message = "200";
    }
    response.write(message);
    response.end();
});
// update password and date for a user
app.post('/UpdateUser', (request, response) => {
    var message = "500";
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    var session = getSession(request);
    if (hasSession(session)) {
        var date = request.body['more[date]'];
        var oldPassword = request.body['more[oldPassword]'];
        var newPassword = request.body['more[newPassword]'];
        // if true update the password
        if (authentifications[session.pseudo] == oldPassword) {
            authentifications[session.pseudo] = newPassword;
            // override the existen file user
            createUserFile( {'pseudo': session.pseudo, 'hash': newPassword, 'birthday': date});
            console.log(session.pseudo + " changes password");
        }
        message = "200";
    }
    response.write(message);
    response.end();
});
// send 200 if user exists else 500
app.post('/CheckUser', (request, response) => {
    var session = getSession(request);
    var bool = freeId(session);
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    var message = "500";
    if (!bool) message = "200";
    else console.log (session.pseudo + ': is not a user');
    response.write(message);
    response.end();
});

app.post('/NewUser', (request, response) => {
    user = getSession(request)
    var message = "500";
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    if (!freeId(user)) {
        error('User already exists.');
    }
    else {
        addUser(user);
        message = "200";
        console.log('New: connected as ' + user.pseudo );
    }
    response.write(message);
    response.end();
});

app.post('/ImportAllNotes', (request, response) => {
    session = getSession(request);
    if (hasSession(session)) {
        // core app
        var content = importNote(session);
        response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
        response.write(content);
        response.end();
    }
    console.log('ImportAllNotes: connected as ' + session.pseudo);
});

app.post('/ImportAllFav', (request, response) => {
    session = getSession(request);
    if (hasSession(session)) {
        // core app
        var content = importFav(session);
        response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
        response.write(content);
        response.end();
    }
    console.log('ImportAllFav: connected as ' + session.pseudo);
});

app.post('/ImportNote/*', (request, response) => {
    session = getSession(request);
    if (hasSession(session)) {
        var user = session;
        var file = request.url.split('/')[2] + noteFormat;
        var res = fs.readFileSync( Dir(user) + '/' + file, 'utf8');

        response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
        response.write(res);
        response.end();
    }
    console.log('ImportNote: connected as ' + session.pseudo)
});

// export the note to user account, server side
app.post('/ExportNote', (request, response) => {
    session = getSession(request);
    var message = '500';
    if (hasSession(session)) {
        var note = { 'id': request.body['more[id]'], 'head': request.body['more[head]'], 'body':request.body['more[body]'], 'date':request.body['more[date]']}
        syncNote(session, note);
        message = '200';
    }
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    response.write(message);
    response.end();
    console.log('ExportNote: connected as ' + session.pseudo);
});
// delete note from user account, server side
app.post('/DeleteNote', (request, response) => {
    session = getSession(request);
    var message = "200";
    if (hasSession(session)) {
        var note = { 'id': request.body['more[id]'] };
        deleteNote(session, note);

        response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
        response.write(message);
        response.end();
    }
    console.log('Note: connected as ' + session.pseudo)
});

app.post('/toggleFavorite', (request, response) => {
    session = getSession(request);
    if (hasSession(session)) {
        var user = session;
        var note = { 'id': request.body['more[id]'] };
        var file = Dir(user) + '/' + note.id + favFormat;
        if (fs.existsSync(file)) deleteFavorite(user, note.id);
        else addFavorite(user, note.id);
    }
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    response.write("200");
    response.end();
});

app.post('/Ping', (request, response) => {
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    response.write("Ping !");
    response.end();
});

// push a notification for a user
app.post('/Notification', (request, response) => {
    var session = getSession(request);
    var pseudo = session.pseudo;
    var message = "";
    // notification pushed to user will be removed from todos and insert to dids
    if (todos['notifications'][pseudo] && todos['notifications'][pseudo].length > 0) {
        message = todos['notifications'][pseudo].shift();
        var i = dids['notifications'][pseudo].indexOf(message);
        if (i < 0) {
            dids['notifications'][pseudo].push(message);
        }
    }
    response.writeHead(200, { "Access-Control-Allow-Origin": "*", 'content-type': 'text/plain'});
    response.write(message);
    response.end();
});

app.listen(port);
