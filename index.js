const winston = require('winston');
const express = require('express');
const config = require('config');
const uniqueFilename = require('unique-filename');
const os = require('os');

const app = express();

require('./startup/logging')();
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));

app.post('/upload', (req, res, next) => {
  let fileName = req.files.file.name.split('.');
  fileName = fileName[0];
  var uniqueTmpfile = uniqueFilename('/public', fileName);

  let imageFile = req.files.file;

  imageFile.mv(`${__dirname}${uniqueTmpfile}.jpg`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({ file: `${uniqueTmpfile}.jpg` });
  });
});

const port = process.env.PORT || config.get('port');
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
