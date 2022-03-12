var express = require('express');

var homeController = require('../controllers/home');

var router = express.Router();

// index page(form)
router.get('/', homeController.homePage);

// form submit
router.get("/submit", homeController.formSubmit);


module.exports = router