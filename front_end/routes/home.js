var express = require('express');

var homeController = require('../controllers/home');

var router = express.Router();

// index page(dashboard)
router.get('/', homeController.homePage);

// form page
router.get('/form', homeController.formPage);

// submit data
router.post("/submit", homeController.submit);


module.exports = router