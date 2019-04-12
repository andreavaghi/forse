var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('layouts/index', {
    title: 'forse',
    apiEndpoint: '/api/tips/random'
  });
});

module.exports = router;
