var express = require('express');
var router = express.Router();
var pg = require('pg');
var fs = require('fs')

var conString = process.env.DATABASE_URL;
var superMegaSecretTip = process.env.SUPER_MEGA_SECRET_TIP;

// https://nodejs.org/docs/latest/api/buffer.html#buffer_buffers_and_character_encodings
//
// ascii   - for 7-bit ASCII data only
// utf8    - Multibyte encoded Unicode characters
// utf16le - 2 or 4 bytes, little-endian encoded Unicode characters
// ucs2    - Alias of 'utf16le'
// base64  - Base64 string encoding
// binary  - A way of encoding the buffer into a one-byte (latin-1) encoded string
// hex     - Encode each byte as two hexadecimal characters.
router.get('/tips/random', (req, res) => {
  fs.readFile('utils/tips-iso-8859-1.txt', 'utf-8', function (err, data) {
    if (err) {
      return console.error(err);
    }
    var tips = data.toString().split('\n');
    res.json({ tip: tips[Math.floor(Math.random() * tips.length)] });
  });
});

router.get('/tips/dbrandom', (req, res) => {
  pg.connect(conString, (err, client, done) => {
    if (err) { 
      return console.error('error fetching client from pool', err); 
    }

    client.query('select * from tips', (err, result) => {
      done();
      if (err) { return console.error(err); }
      res.send(result.rows[Math.floor(Math.random() * result.rows.length)])
    });
  });
});

router.get('/tips/:id(\\d+)', (req, res) => {
  pg.connect(conString, (err, client, done) => {
    if (err) { return console.error('error fetching client from pool', err); }

    client.query('select * from tips where id = $1', [req.params.id], (err, result) => {
      done();
      if (err) { return console.error(err); }
      res.send(result.rows[0]);
    });
  });
});

router.get('/tips', (req, res) => {
  if (req.query.secret !== superMegaSecretTip) {
    return res.status(401).json({ message: 'forse non sei autorizzato' });
  }

  pg.connect(conString, (err, client, done) => {
    if (err) { return console.error('error fetching client from pool', err); }

    client.query('select * from tips order by id asc', (err, result) => {
      done();
      if (err) { return console.error(err); }
      res.send(result.rows);
    });
  });
});

router.post('/tips', (req, res) => {
  if (req.query.secret !== superMegaSecretTip) {
    return res.status(401).json({ message: 'forse non sei autorizzato' });
  }

  pg.connect(conString, (err, client, done) => {
    if (err) { return console.error('error fetching client from pool', err); }

    client.query('insert into tips(tip) values($1)', [req.body.tip], (err, result) => {
      done();
      if (err) { return console.error(err); }
      res.status(201).json({ message: 'tip inserito forse con successo' });
    });
  });
});

router.put('/tips/:id(\\d+)', (req, res) => {
  if (req.query.secret !== superMegaSecretTip) {
    return res.status(401).json({ message: 'forse non sei autorizzato' });
  }

  pg.connect(conString, (err, client, done) => {
    if (err) { return console.error('error fetching client from pool', err); }
    
    client.query('update tips set tip = $1, created_at = now() where id = $2', [req.body.tip, req.params.id], (err, result) => {
      done();
      if (err) { return console.error(err); }
      res.json({ message: 'tip aggiornato forse con successo' });
    });
  });
});

module.exports = router;