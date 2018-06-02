var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
const fileUpload = require('express-fileupload');

var dbConn = mongodb.MongoClient.connect('mongodb://localhost:27017');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use(fileUpload());

app.post('/upload', function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    let sampleFile = req.files.sampleFile;
    var filename = sampleFile.name;
    sampleFile.mv('public/uploads/' + filename, function(err) {
        if (err)
            return res.status(500).send(err);
        res.send('File successfully uploaded!');
    });
});

app.post('/post-email', function (req, res) {
    dbConn.then(function(db) {
        delete req.body._id; // for safety reasons
        db.collection('emails').insertOne(req.body);
    });
    res.send('Data successfully received:\n' + JSON.stringify(req.body));
});

app.get('/view-emails',  function(req, res) {
    dbConn.then(function(db) {
        db.collection('emails').find({}).toArray().then(function(feedbacks) {
            res.status(200).json(feedbacks);
        });
    });
});

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );
